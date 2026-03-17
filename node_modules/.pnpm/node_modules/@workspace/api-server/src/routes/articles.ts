import { Router, type IRouter } from "express";
import { db, articlesTable, newsletterTable } from "@workspace/db";
import { eq, desc, and, count, ilike } from "drizzle-orm";
import {
  ListArticlesQueryParams,
  CreateArticleBody,
  GetArticleParams,
  UpdateArticleBody,
  UpdateArticleParams,
  DeleteArticleParams,
  UploadArticleContentBody,
  SubscribeNewsletterBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80)
    + "-" + Date.now().toString(36);
}

function estimateReadTime(content: string): number {
  const words = content.replace(/<[^>]*>/g, "").split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function extractTextFromHtml(html: string): string {
  const stripped = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
  return stripped;
}

function generateSummary(text: string, maxLength = 200): string {
  const clean = stripHtml(text);
  if (clean.length <= maxLength) return clean;
  const truncated = clean.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");
  return (lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated) + "...";
}

function inferCategory(text: string): string {
  const lower = text.toLowerCase();
  if (/\b(police|cop|officer|department|badge|law enforcement|fbi|doj|cia|nsa|federal agent|sheriff|detective|badge|abuse|brutality|misconduct)\b/.test(lower)) return "Corrupt Law Enforcement";
  if (/\b(politician|official|mayor|governor|senator|representative|congress|bureaucrat|government employee|civil servant|public official|embezzlement|bribery|fraud|kickback)\b/.test(lower)) return "Public Officials";
  if (/\b(court|lawsuit|trial|judge|attorney|verdict|ruling|litigation|plea deal|case law|open case|pending case|appeal|conviction|sentence)\b/.test(lower)) {
    if (/\b(open|current|pending|active|recent|ongoing)\b/.test(lower)) return "Court Cases - Open";
    return "Court Cases - Closed";
  }
  if (/\b(activist|activism|protest|movement|civil rights|freedom|justice|rights|community action|grassroots|advocacy|organize|rally)\b/.test(lower)) return "Activism";
  return "Public Officials";
}

function extractTags(text: string): string[] {
  const tags: string[] = [];
  const lower = text.toLowerCase();
  const keywords = [
    // Law Enforcement Issues
    "Police Abuse", "Corruption", "Misconduct", "Civil Rights", "Brutality",
    "FBI", "DOJ", "Federal Agents", "Sheriff", "Detective",
    // Public Officials
    "Embezzlement", "Bribery", "Kickback", "Fraud", "Public Official",
    "Mayor", "Governor", "Politician",
    // Court System
    "Court Case", "Lawsuit", "Trial", "Judge", "Verdict",
    // General
    "Justice", "Accountability", "Investigation", "Evidence",
    "Constitution", "First Amendment", "Freedom", "Activism", "Community"
  ];
  for (const kw of keywords) {
    if (lower.includes(kw.toLowerCase())) tags.push(kw);
    if (tags.length >= 8) break;
  }
  return tags.length > 0 ? tags : ["Investigation", "We The People"];
}

function parseHtmlToArticleContent(html: string): string {
  let content = html.trim();
  if (!content.startsWith("<")) {
    content = `<p>${content.replace(/\n\n+/g, "</p><p>").replace(/\n/g, "<br>")}</p>`;
  }
  return content;
}

router.get("/articles", async (req, res) => {
  const parsed = ListArticlesQueryParams.safeParse(req.query);
  const limit = parsed.success ? (parsed.data.limit ?? 20) : 20;
  const offset = parsed.success ? (parsed.data.offset ?? 0) : 0;
  const category = req.query.category as string | undefined;

  const conditions = [eq(articlesTable.published, true)];
  if (category) {
    conditions.push(ilike(articlesTable.category, category));
  }

  const [articles, totalResult] = await Promise.all([
    db.select().from(articlesTable)
      .where(and(...conditions))
      .orderBy(desc(articlesTable.publishedAt), desc(articlesTable.createdAt))
      .limit(limit)
      .offset(offset),
    db.select({ count: count() }).from(articlesTable).where(and(...conditions)),
  ]);

  res.json({
    articles,
    total: totalResult[0]?.count ?? 0,
    limit,
    offset,
  });
});

router.post("/articles/upload", async (req, res) => {
  const parsed = UploadArticleContentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "INVALID_REQUEST", message: "Invalid content" });
    return;
  }

  const { rawContent, contentType, evidenceNotes } = parsed.data;
  let processedContent = rawContent;
  let plainText = rawContent;

  if (contentType === "html") {
    plainText = extractTextFromHtml(rawContent);
    processedContent = parseHtmlToArticleContent(rawContent);
  } else if (contentType === "text") {
    processedContent = `<p>${rawContent.replace(/\n\n+/g, "</p><p>").replace(/\n/g, "<br>")}</p>`;
  } else if (contentType === "evidence") {
    const notes = evidenceNotes ? `\n\n<p><strong>Evidence Notes:</strong> ${evidenceNotes}</p>` : "";
    processedContent = `<p>${rawContent.replace(/\n\n+/g, "</p><p>").replace(/\n/g, "<br>")}</p>${notes}`;
    plainText = rawContent + (evidenceNotes ? " " + evidenceNotes : "");
  }

  const firstSentence = plainText.split(/[.!?]/)[0]?.trim() || "Breaking News Report";
  const suggestedTitle = firstSentence.length > 10 && firstSentence.length < 120
    ? firstSentence
    : "Breaking: " + plainText.slice(0, 80).trim() + "...";

  const suggestedSummary = generateSummary(plainText);
  const suggestedCategory = inferCategory(plainText);
  const suggestedTags = extractTags(plainText);
  const suggestedMetaTitle = `${suggestedTitle.slice(0, 60)} | We The People News`;
  const suggestedMetaDescription = suggestedSummary.slice(0, 160);

  res.json({
    suggestedTitle,
    suggestedSummary,
    processedContent,
    suggestedCategory,
    suggestedTags,
    suggestedMetaTitle,
    suggestedMetaDescription,
  });
});

router.post("/articles", async (req, res) => {
  const parsed = CreateArticleBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "INVALID_REQUEST", message: "Invalid article data" });
    return;
  }

  const data = parsed.data;
  const slug = generateSlug(data.title);
  const readTimeMinutes = estimateReadTime(data.content);
  const now = new Date();

  const [article] = await db.insert(articlesTable).values({
    title: data.title,
    slug,
    summary: data.summary,
    content: data.content,
    author: "Don Matthews",
    category: data.category ?? "Politics",
    tags: data.tags ?? [],
    imageUrl: data.imageUrl ?? null,
    featured: data.featured ?? false,
    published: data.published ?? false,
    publishedAt: data.published ? (data.publishedAt ? new Date(data.publishedAt) : now) : null,
    scheduledFor: data.scheduledFor ? new Date(data.scheduledFor) : null,
    metaTitle: data.metaTitle ?? `${data.title} | We The People News`,
    metaDescription: data.metaDescription ?? data.summary.slice(0, 160),
    readTimeMinutes,
    updatedAt: now,
  }).returning();

  res.status(201).json(article);
});

router.get("/articles/:id", async (req, res) => {
  const parsed = GetArticleParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: "INVALID_PARAMS", message: "Invalid article ID" });
    return;
  }

  const [article] = await db.select().from(articlesTable).where(eq(articlesTable.id, parsed.data.id));
  if (!article) {
    res.status(404).json({ error: "NOT_FOUND", message: "Article not found" });
    return;
  }

  res.json(article);
});

router.put("/articles/:id", async (req, res) => {
  const paramsParsed = UpdateArticleParams.safeParse(req.params);
  const bodyParsed = UpdateArticleBody.safeParse(req.body);

  if (!paramsParsed.success || !bodyParsed.success) {
    res.status(400).json({ error: "INVALID_REQUEST", message: "Invalid data" });
    return;
  }

  const data = bodyParsed.data;
  const now = new Date();
  const updateData: Record<string, unknown> = { updatedAt: now };

  if (data.title !== undefined) {
    updateData.title = data.title;
    updateData.metaTitle = data.metaTitle ?? `${data.title} | We The People News`;
  }
  if (data.summary !== undefined) updateData.summary = data.summary;
  if (data.content !== undefined) {
    updateData.content = data.content;
    updateData.readTimeMinutes = estimateReadTime(data.content);
  }
  if (data.category !== undefined) updateData.category = data.category;
  if (data.tags !== undefined) updateData.tags = data.tags;
  if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
  if (data.featured !== undefined) updateData.featured = data.featured;
  if (data.metaTitle !== undefined) updateData.metaTitle = data.metaTitle;
  if (data.metaDescription !== undefined) updateData.metaDescription = data.metaDescription;
  if (data.published !== undefined) {
    updateData.published = data.published;
    if (data.published) {
      updateData.publishedAt = data.publishedAt ? new Date(data.publishedAt) : now;
    }
  }
  if (data.scheduledFor !== undefined) updateData.scheduledFor = data.scheduledFor ? new Date(data.scheduledFor) : null;

  const [article] = await db.update(articlesTable)
    .set(updateData)
    .where(eq(articlesTable.id, paramsParsed.data.id))
    .returning();

  if (!article) {
    res.status(404).json({ error: "NOT_FOUND", message: "Article not found" });
    return;
  }

  res.json(article);
});

router.delete("/articles/:id", async (req, res) => {
  const parsed = DeleteArticleParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: "INVALID_PARAMS", message: "Invalid article ID" });
    return;
  }

  const [deleted] = await db.delete(articlesTable)
    .where(eq(articlesTable.id, parsed.data.id))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "NOT_FOUND", message: "Article not found" });
    return;
  }

  res.status(204).send();
});

router.post("/articles/bulk-publish", async (req, res) => {
  const { articleIds, publishAt } = req.body as { articleIds: number[]; publishAt?: string };

  if (!Array.isArray(articleIds) || articleIds.length === 0) {
    res.status(400).json({ error: "INVALID_REQUEST", message: "articleIds must be a non-empty array" });
    return;
  }

  const now = new Date();
  const published: number[] = [];
  const scheduled: number[] = [];
  const failed: Array<{ id: number; reason: string }> = [];

  for (const id of articleIds) {
    try {
      const updateData: Record<string, unknown> = {
        published: true,
        updatedAt: now,
      };

      if (publishAt) {
        updateData.scheduledFor = new Date(publishAt);
      } else {
        updateData.publishedAt = now;
      }

      const [article] = await db.update(articlesTable)
        .set(updateData)
        .where(eq(articlesTable.id, id))
        .returning();

      if (article) {
        if (publishAt) {
          scheduled.push(id);
        } else {
          published.push(id);
        }
      } else {
        failed.push({ id, reason: "Article not found" });
      }
    } catch (error) {
      failed.push({ id, reason: String(error) });
    }
  }

  res.json({
    published: published.length,
    scheduled: scheduled.length,
    failed,
  });
});

router.put("/articles/:id/analytics", async (req, res) => {
  const parsed = GetArticleParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: "INVALID_PARAMS", message: "Invalid article ID" });
    return;
  }

  const { views: viewsToAdd, shares: sharesToAdd } = req.body as { views?: number; shares?: number };
  const viewsIncrement = viewsToAdd ?? 1;
  const sharesIncrement = sharesToAdd ?? 0;

  const [article] = await db.select().from(articlesTable).where(eq(articlesTable.id, parsed.data.id));
  if (!article) {
    res.status(404).json({ error: "NOT_FOUND", message: "Article not found" });
    return;
  }

  const newViews = (article.views ?? 0) + viewsIncrement;
  const newShares = (article.shares ?? 0) + sharesIncrement;
  const viralScore = newViews + (newShares * 10);

  const [updated] = await db.update(articlesTable)
    .set({
      views: newViews,
      shares: newShares,
      viralScore,
      updatedAt: new Date(),
    })
    .where(eq(articlesTable.id, parsed.data.id))
    .returning();

  res.json(updated);
});

router.post("/newsletter", async (req, res) => {
  const parsed = SubscribeNewsletterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "INVALID_EMAIL", message: "Please provide a valid email address" });
    return;
  }

  await db.insert(newsletterTable).values({
    email: parsed.data.email,
    name: parsed.data.name ?? null,
  }).onConflictDoUpdate({
    target: newsletterTable.email,
    set: { active: true },
  });

  res.json({ message: "You've been subscribed to the We The People News newsletter!", success: true });
});

export default router;
