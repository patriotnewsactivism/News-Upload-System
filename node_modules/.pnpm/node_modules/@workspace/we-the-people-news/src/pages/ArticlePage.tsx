import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { format } from "date-fns";

async function fetchArticle(id: number) {
  const res = await fetch(`/api/articles/${id}`);
  if (!res.ok) throw new Error("Not found");
  return res.json();
}

async function fetchArticles() {
  const res = await fetch("/api/articles?limit=4");
  if (!res.ok) throw new Error("Failed");
  return res.json();
}

export default function ArticlePage({ id }: { id: number }) {
  const { data: article, isLoading, isError } = useQuery({
    queryKey: ["article", id],
    queryFn: () => fetchArticle(id),
    enabled: !!id && !isNaN(id),
  });

  const { data: related } = useQuery({
    queryKey: ["articles", "related"],
    queryFn: fetchArticles,
  });

  if (isLoading) {
    return (
      <div style={{ fontFamily: "sans-serif", textAlign: "center", padding: "80px", color: "#64748b" }}>
        Loading article...
      </div>
    );
  }

  if (isError || !article) {
    return (
      <div style={{ fontFamily: "sans-serif", textAlign: "center", padding: "80px" }}>
        <p style={{ color: "#b91c1c", fontSize: "18px" }}>Article not found.</p>
        <Link href="/" style={{ color: "#1e3a5f" }}>← Back to Home</Link>
      </div>
    );
  }

  const metaTitle = article.metaTitle || `${article.title} | We The People News`;
  const metaDesc = article.metaDescription || article.summary;

  return (
    <div style={{ fontFamily: "'Georgia', serif", background: "#f8f8f6", minHeight: "100vh" }}>
      {/* SEO Meta via title */}
      <title>{metaTitle}</title>

      {/* Header */}
      <header style={{ background: "#1e3a5f", color: "white", padding: "20px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", alignItems: "center", gap: "20px" }}>
          <Link href="/" style={{ color: "white", textDecoration: "none", fontSize: "13px", letterSpacing: "1px", fontFamily: "sans-serif" }}>← Back</Link>
          <div style={{ fontSize: "clamp(18px, 3vw, 28px)", fontWeight: "900", color: "white" }}>WE THE PEOPLE NEWS</div>
        </div>
      </header>

      {/* Top Ad */}
      <div style={{ background: "#e2e8f0", textAlign: "center", padding: "12px", borderBottom: "1px solid #cbd5e1" }}>
        <div style={{ display: "inline-block", background: "#f1f5f9", border: "1px dashed #94a3b8", padding: "10px 40px", fontSize: "12px", color: "#64748b", fontFamily: "sans-serif" }}>
          Advertisement — 728×90 Leaderboard
        </div>
      </div>

      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 20px", display: "grid", gridTemplateColumns: "1fr 300px", gap: "40px" }}>
        {/* Article Content */}
        <article>
          {/* Category + Tags */}
          <div style={{ marginBottom: "16px" }}>
            <span style={{ background: "#b91c1c", color: "white", padding: "3px 10px", fontSize: "11px", fontWeight: "700", letterSpacing: "2px", fontFamily: "sans-serif", borderRadius: "2px" }}>
              {article.category.toUpperCase()}
            </span>
            {article.tags?.slice(0, 3).map((tag: string) => (
              <span key={tag} style={{ marginLeft: "8px", background: "#e2e8f0", color: "#475569", padding: "3px 8px", fontSize: "11px", borderRadius: "2px", fontFamily: "sans-serif" }}>
                {tag}
              </span>
            ))}
          </div>

          {/* Title */}
          <h1 style={{ fontSize: "clamp(24px,4vw,40px)", fontWeight: "900", lineHeight: "1.2", color: "#1e293b", marginBottom: "20px" }}>
            {article.title}
          </h1>

          {/* Byline */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "28px", paddingBottom: "20px", borderBottom: "2px solid #1e3a5f", fontFamily: "sans-serif" }}>
            <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "#1e3a5f", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "700", fontSize: "16px" }}>DM</div>
            <div>
              <div style={{ fontWeight: "700", color: "#1e293b", fontSize: "15px" }}>Don Matthews</div>
              <div style={{ color: "#64748b", fontSize: "12px" }}>
                {article.publishedAt ? format(new Date(article.publishedAt), "MMMM d, yyyy") : ""}
                {" "}&bull; {article.readTimeMinutes} min read
              </div>
            </div>
            <div style={{ marginLeft: "auto", display: "flex", gap: "8px" }}>
              <button
                onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(window.location.href)}`, "_blank")}
                style={{ background: "#1da1f2", color: "white", border: "none", borderRadius: "3px", padding: "6px 12px", fontSize: "12px", cursor: "pointer", fontFamily: "sans-serif" }}
              >Twitter</button>
              <button
                onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, "_blank")}
                style={{ background: "#1877f2", color: "white", border: "none", borderRadius: "3px", padding: "6px 12px", fontSize: "12px", cursor: "pointer", fontFamily: "sans-serif" }}
              >Facebook</button>
            </div>
          </div>

          {/* Hero Image */}
          {(article.imageUrl || true) && (
            <img
              src={article.imageUrl || "https://images.unsplash.com/photo-1495020632541-8cf3486be514?w=900&q=80"}
              alt={article.title}
              style={{ width: "100%", height: "380px", objectFit: "cover", borderRadius: "4px", marginBottom: "32px", display: "block" }}
            />
          )}

          {/* Article Body */}
          <div
            style={{ fontSize: "17px", lineHeight: "1.85", color: "#334155", fontFamily: "'Georgia', serif" }}
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {/* Author Bio */}
          <div style={{ background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: "4px", padding: "28px", marginTop: "48px", display: "flex", gap: "20px", alignItems: "flex-start" }}>
            <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: "#1e3a5f", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "900", fontSize: "24px", flexShrink: 0 }}>DM</div>
            <div>
              <div style={{ fontWeight: "800", fontSize: "18px", color: "#1e293b", marginBottom: "4px" }}>Don Matthews</div>
              <div style={{ fontSize: "12px", color: "#b91c1c", letterSpacing: "2px", fontFamily: "sans-serif", marginBottom: "12px" }}>INDEPENDENT JOURNALIST</div>
              <p style={{ fontSize: "14px", color: "#64748b", lineHeight: "1.7", fontFamily: "sans-serif" }}>
                Don Matthews is an independent journalist and investigative reporter dedicated to exposing the truth that mainstream media refuses to cover. Fighting for freedom, the Constitution, and the American people.
              </p>
            </div>
          </div>

          {/* Bottom Ad */}
          <div style={{ background: "#f1f5f9", border: "1px dashed #94a3b8", padding: "24px", textAlign: "center", marginTop: "32px", fontFamily: "sans-serif" }}>
            <div style={{ fontSize: "12px", color: "#64748b" }}>Advertisement — 728×90</div>
          </div>
        </article>

        {/* Sidebar */}
        <aside>
          {/* 300x250 Ad */}
          <div style={{ background: "#f1f5f9", border: "1px dashed #94a3b8", padding: "40px 20px", textAlign: "center", marginBottom: "28px", fontFamily: "sans-serif" }}>
            <div style={{ fontSize: "11px", color: "#94a3b8" }}>Advertisement</div>
            <div style={{ fontSize: "13px", color: "#64748b", marginTop: "8px" }}>300×250</div>
          </div>

          {/* Support */}
          <div style={{ background: "#1e3a5f", color: "white", padding: "24px", borderRadius: "4px", marginBottom: "28px", textAlign: "center" }}>
            <div style={{ fontSize: "20px", marginBottom: "8px" }}>🇺🇸</div>
            <h3 style={{ fontSize: "15px", fontWeight: "900", marginBottom: "8px" }}>Support Don Matthews</h3>
            <p style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "16px", lineHeight: "1.6", fontFamily: "sans-serif" }}>Independent journalism costs money. Help keep the truth alive.</p>
            <a href="https://www.paypal.com/donate" target="_blank" rel="noopener noreferrer"
              style={{ display: "block", background: "#b91c1c", color: "white", padding: "10px", borderRadius: "3px", fontSize: "13px", fontWeight: "700", textDecoration: "none", marginBottom: "8px", fontFamily: "sans-serif" }}>
              💛 DONATE
            </a>
          </div>

          {/* Related Articles */}
          {related?.articles?.filter((a: any) => a.id !== id).slice(0, 4).length > 0 && (
            <div style={{ background: "white", border: "1px solid #e2e8f0", padding: "20px", borderRadius: "4px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                <div style={{ width: "3px", height: "18px", background: "#b91c1c" }}></div>
                <h3 style={{ fontSize: "13px", fontWeight: "800", color: "#1e293b", letterSpacing: "2px", textTransform: "uppercase", fontFamily: "sans-serif", margin: 0 }}>Related</h3>
              </div>
              {related.articles.filter((a: any) => a.id !== id).slice(0, 4).map((a: any) => (
                <Link key={a.id} href={`/article/${a.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                  <div style={{ paddingBottom: "12px", marginBottom: "12px", borderBottom: "1px solid #f1f5f9", cursor: "pointer" }}>
                    <div style={{ fontSize: "13px", fontWeight: "700", color: "#1e293b", lineHeight: "1.4", marginBottom: "4px" }}>{a.title.slice(0, 80)}...</div>
                    <div style={{ fontSize: "11px", color: "#94a3b8", fontFamily: "sans-serif" }}>{a.readTimeMinutes} min read</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </aside>
      </main>

      {/* Footer */}
      <footer style={{ background: "#1e3a5f", color: "#94a3b8", padding: "32px 20px", fontFamily: "sans-serif", textAlign: "center", marginTop: "40px" }}>
        <Link href="/" style={{ color: "white", fontWeight: "900", textDecoration: "none", fontSize: "18px", fontFamily: "'Georgia',serif" }}>We The People News</Link>
        <p style={{ marginTop: "8px", fontSize: "12px" }}>© {new Date().getFullYear()} Don Matthews · Independent Journalism</p>
      </footer>
    </div>
  );
}
