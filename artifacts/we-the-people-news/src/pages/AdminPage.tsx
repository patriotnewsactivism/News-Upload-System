import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { format } from "date-fns";

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || "WTP2024admin";

type Article = {
  id: number;
  title: string;
  summary: string;
  content: string;
  category: string;
  tags: string[];
  imageUrl: string;
  publishedAt: string;
  readTimeMinutes: number;
  featured: boolean;
  status: string;
  createdAt: string;
};

type ArticleForm = {
  title: string;
  summary: string;
  content: string;
  category: string;
  tags: string;
  imageUrl: string;
  featured: boolean;
  status: string;
  scheduledFor?: string;
};

const BLANK_FORM: ArticleForm = {
  title: "",
  summary: "",
  content: "",
  category: "Public Officials",
  tags: "",
  imageUrl: "",
  featured: false,
  status: "published",
  scheduledFor: "",
};

const CATEGORIES = [
  "Corrupt Law Enforcement",
  "Public Officials",
  "Court Cases - Open",
  "Court Cases - Closed",
  "Activism",
];

async function api(path: string, options?: RequestInit) {
  const res = await fetch(path, options);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || res.statusText);
  }
  return res.json();
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem("wtp_admin") === "1");
  const [pwInput, setPwInput] = useState("");
  const [pwError, setPwError] = useState(false);
  const [tab, setTab] = useState<"list" | "create" | "upload">("list");
  const [form, setForm] = useState<ArticleForm>(BLANK_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [uploadText, setUploadText] = useState("");
  const [uploadContentType, setUploadContentType] = useState<"text" | "html" | "evidence">("text");
  const [evidenceNotes, setEvidenceNotes] = useState("");
  const [parsedDraft, setParsedDraft] = useState<Partial<ArticleForm> | null>(null);
  const [parseError, setParseError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const qc = useQueryClient();

  const { data, isLoading } = useQuery<{ articles: Article[] }>({
    queryKey: ["admin-articles"],
    queryFn: () => api("/api/articles?limit=100"),
    enabled: authed,
  });

  const createMutation = useMutation({
    mutationFn: (body: object) => api("/api/articles", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-articles"] }); setTab("list"); setForm(BLANK_FORM); setSuccessMsg("Article created!"); setTimeout(() => setSuccessMsg(""), 3000); },
    onError: (e: Error) => setErrorMsg(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: number; body: object }) => api(`/api/articles/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-articles"] }); setTab("list"); setEditingId(null); setForm(BLANK_FORM); setSuccessMsg("Article updated!"); setTimeout(() => setSuccessMsg(""), 3000); },
    onError: (e: Error) => setErrorMsg(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api(`/api/articles/${id}`, { method: "DELETE" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-articles"] }); setSuccessMsg("Article deleted."); setTimeout(() => setSuccessMsg(""), 3000); },
    onError: (e: Error) => setErrorMsg(e.message),
  });

  const uploadMutation = useMutation({
    mutationFn: (body: object) => api("/api/articles/upload", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }),
    onSuccess: (data) => {
      setParsedDraft({
        title: data.suggestedTitle || "",
        summary: data.suggestedSummary || "",
        content: data.processedContent || "",
        category: data.suggestedCategory || "Politics",
        tags: (data.suggestedTags || []).join(", "),
        imageUrl: "",
        featured: false,
        status: "draft",
      });
    },
    onError: (e: Error) => setParseError(e.message),
  });

  function login() {
    if (pwInput === ADMIN_PASSWORD) {
      sessionStorage.setItem("wtp_admin", "1");
      setAuthed(true);
    } else {
      setPwError(true);
      setTimeout(() => setPwError(false), 2000);
    }
  }

  function logout() {
    sessionStorage.removeItem("wtp_admin");
    setAuthed(false);
  }

  function startEdit(article: Article) {
    setForm({
      title: article.title,
      summary: article.summary,
      content: article.content,
      category: article.category,
      tags: article.tags?.join(", ") || "",
      imageUrl: article.imageUrl || "",
      featured: article.featured,
      status: article.status,
    });
    setEditingId(article.id);
    setTab("create");
  }

  function submitForm() {
    setErrorMsg("");
    const payload: Record<string, unknown> = {
      ...form,
      tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
      published: form.status === "published" && !form.scheduledFor,
    };
    if (form.scheduledFor) {
      payload.scheduledFor = new Date(form.scheduledFor).toISOString();
      payload.published = false;
    }
    if (editingId !== null) {
      updateMutation.mutate({ id: editingId, body: payload });
    } else {
      createMutation.mutate(payload);
    }
  }

  function useDraft() {
    if (parsedDraft) {
      setForm({ ...BLANK_FORM, ...parsedDraft });
      setTab("create");
      setParsedDraft(null);
      setUploadText("");
    }
  }

  // ---------- Login ----------
  if (!authed) {
    return (
      <div style={{ fontFamily: "sans-serif", minHeight: "100vh", background: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ background: "white", borderRadius: "8px", padding: "48px", width: "360px", textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.4)" }}>
          <div style={{ fontSize: "32px", marginBottom: "8px" }}>🔒</div>
          <h1 style={{ fontSize: "22px", fontWeight: "900", color: "#1e293b", marginBottom: "4px" }}>Admin Login</h1>
          <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "28px" }}>We The People News</p>
          <input
            type="password"
            value={pwInput}
            onChange={e => setPwInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && login()}
            placeholder="Enter admin password"
            style={{ width: "100%", padding: "12px", border: `2px solid ${pwError ? "#b91c1c" : "#e2e8f0"}`, borderRadius: "4px", fontSize: "14px", marginBottom: "12px", boxSizing: "border-box" }}
          />
          {pwError && <p style={{ color: "#b91c1c", fontSize: "13px", marginBottom: "8px" }}>Incorrect password</p>}
          <button onClick={login} style={{ width: "100%", padding: "12px", background: "#1e3a5f", color: "white", border: "none", borderRadius: "4px", fontSize: "14px", fontWeight: "700", cursor: "pointer" }}>
            LOG IN
          </button>
          <div style={{ marginTop: "16px" }}>
            <Link href="/" style={{ color: "#94a3b8", fontSize: "13px" }}>← Back to site</Link>
          </div>
        </div>
      </div>
    );
  }

  const label = (text: string) => (
    <label style={{ display: "block", fontSize: "12px", fontWeight: "700", letterSpacing: "1px", color: "#475569", marginBottom: "6px" }}>{text}</label>
  );

  const input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input {...props} style={{ width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: "4px", fontSize: "14px", marginBottom: "16px", boxSizing: "border-box", fontFamily: "sans-serif" }} />
  );

  const textarea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
    <textarea {...props} style={{ width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: "4px", fontSize: "14px", marginBottom: "16px", boxSizing: "border-box", fontFamily: "sans-serif", resize: "vertical" }} />
  );

  // ---------- Authenticated Admin ----------
  return (
    <div style={{ fontFamily: "sans-serif", minHeight: "100vh", background: "#f8fafc" }}>
      {/* Top Bar */}
      <div style={{ background: "#1e3a5f", color: "white", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <span style={{ fontWeight: "900", fontFamily: "'Georgia',serif", fontSize: "18px" }}>We The People News</span>
          <span style={{ marginLeft: "12px", background: "#b91c1c", padding: "3px 8px", borderRadius: "2px", fontSize: "11px", fontWeight: "700", letterSpacing: "1px" }}>ADMIN</span>
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <Link href="/" style={{ color: "#94a3b8", fontSize: "13px" }}>← View Site</Link>
          <button onClick={logout} style={{ background: "transparent", border: "1px solid #334155", color: "#94a3b8", padding: "6px 12px", borderRadius: "3px", fontSize: "12px", cursor: "pointer" }}>Sign Out</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: "white", borderBottom: "1px solid #e2e8f0", padding: "0 24px", display: "flex", gap: "0" }}>
        {(["list", "create", "upload"] as const).map(t => (
          <button key={t} onClick={() => {
            setTab(t);
            if (t !== "create") { setEditingId(null); setForm(BLANK_FORM); }
            if (t === "upload") { setUploadText(""); setEvidenceNotes(""); setParsedDraft(null); setParseError(""); }
          }}
            style={{ padding: "14px 20px", fontSize: "13px", fontWeight: tab === t ? "700" : "400", color: tab === t ? "#b91c1c" : "#64748b", background: "transparent", border: "none", borderBottom: tab === t ? "3px solid #b91c1c" : "3px solid transparent", cursor: "pointer" }}>
            {t === "list" ? "📰 Articles" : t === "create" ? "✏️ Write / Edit" : "⬆️ Upload Content"}
          </button>
        ))}
      </div>

      {/* Messages */}
      {successMsg && (
        <div style={{ background: "#dcfce7", color: "#166534", padding: "12px 24px", fontSize: "14px", fontWeight: "600" }}>✓ {successMsg}</div>
      )}
      {errorMsg && (
        <div style={{ background: "#fee2e2", color: "#991b1b", padding: "12px 24px", fontSize: "14px", fontWeight: "600", display: "flex", justifyContent: "space-between" }}>
          <span>⚠ {errorMsg}</span>
          <button onClick={() => setErrorMsg("")} style={{ background: "none", border: "none", cursor: "pointer", color: "#991b1b" }}>✕</button>
        </div>
      )}

      <div style={{ maxWidth: "1100px", margin: "32px auto", padding: "0 24px" }}>
        {/* Articles List */}
        {tab === "list" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#1e293b", margin: 0 }}>All Articles ({data?.articles?.length || 0})</h2>
              <button onClick={() => { setTab("create"); setEditingId(null); setForm(BLANK_FORM); }}
                style={{ background: "#b91c1c", color: "white", border: "none", padding: "10px 20px", borderRadius: "4px", fontSize: "13px", fontWeight: "700", cursor: "pointer" }}>
                + New Article
              </button>
            </div>

            {isLoading && <div style={{ textAlign: "center", padding: "60px", color: "#64748b" }}>Loading...</div>}

            {!isLoading && (
              <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "6px", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                      {["Title", "Category", "Status", "Featured", "Date", "Actions"].map(h => (
                        <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "11px", fontWeight: "700", letterSpacing: "1px", color: "#64748b", textTransform: "uppercase" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data?.articles?.map((article, i) => (
                      <tr key={article.id} style={{ borderBottom: i < (data.articles.length - 1) ? "1px solid #f1f5f9" : "none" }}>
                        <td style={{ padding: "12px 16px", fontSize: "14px", fontWeight: "600", color: "#1e293b", maxWidth: "300px" }}>
                          <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{article.title}</div>
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <span style={{ background: "#e2e8f0", color: "#475569", padding: "2px 8px", borderRadius: "2px", fontSize: "11px", fontWeight: "700" }}>{article.category}</span>
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <span style={{ background: article.status === "published" ? "#dcfce7" : "#fef3c7", color: article.status === "published" ? "#166534" : "#92400e", padding: "2px 8px", borderRadius: "2px", fontSize: "11px", fontWeight: "700" }}>
                            {article.status}
                          </span>
                        </td>
                        <td style={{ padding: "12px 16px", fontSize: "14px" }}>{article.featured ? "⭐" : "—"}</td>
                        <td style={{ padding: "12px 16px", fontSize: "12px", color: "#64748b" }}>
                          {article.createdAt ? format(new Date(article.createdAt), "MMM d, yyyy") : "—"}
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <div style={{ display: "flex", gap: "8px" }}>
                            <Link href={`/article/${article.id}`} style={{ color: "#3b82f6", fontSize: "12px", fontWeight: "600" }}>View</Link>
                            <button onClick={() => startEdit(article)} style={{ background: "none", border: "none", color: "#1e3a5f", fontSize: "12px", fontWeight: "600", cursor: "pointer", padding: 0 }}>Edit</button>
                            <button
                              onClick={() => { if (window.confirm("Delete this article?")) deleteMutation.mutate(article.id); }}
                              style={{ background: "none", border: "none", color: "#b91c1c", fontSize: "12px", fontWeight: "600", cursor: "pointer", padding: 0 }}
                              disabled={deleteMutation.isPending}
                            >Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {!data?.articles?.length && (
                      <tr><td colSpan={6} style={{ padding: "40px", textAlign: "center", color: "#94a3b8" }}>No articles yet. Create your first one!</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Create / Edit */}
        {tab === "create" && (
          <div style={{ maxWidth: "800px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#1e293b", marginBottom: "28px" }}>
              {editingId !== null ? `Editing Article #${editingId}` : "Write New Article"}
            </h2>
            <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "6px", padding: "32px" }}>
              {label("TITLE *")}
              {input({ value: form.title, onChange: e => setForm(f => ({ ...f, title: e.target.value })), placeholder: "Article headline..." })}

              {label("SUMMARY *")}
              {textarea({ value: form.summary, onChange: e => setForm(f => ({ ...f, summary: e.target.value })), placeholder: "2–3 sentence summary...", rows: 3 })}

              {label("CONTENT (HTML supported) *")}
              {textarea({ value: form.content, onChange: e => setForm(f => ({ ...f, content: e.target.value })), placeholder: "<p>Article body...</p>", rows: 14 })}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
                <div>
                  {label("CATEGORY")}
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: "4px", fontSize: "14px", marginBottom: "16px", fontFamily: "sans-serif" }}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  {label("STATUS")}
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: "4px", fontSize: "14px", marginBottom: "16px", fontFamily: "sans-serif" }}>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
                <div>
                  {label("PUBLISH AT (optional)")}
                  {input({ type: "datetime-local", value: form.scheduledFor || "", onChange: e => setForm(f => ({ ...f, scheduledFor: e.target.value })), placeholder: "Schedule for later..." })}
                </div>
              </div>

              {label("TAGS (comma-separated)")}
              {input({ value: form.tags, onChange: e => setForm(f => ({ ...f, tags: e.target.value })), placeholder: "government, freedom, constitution..." })}

              {label("IMAGE URL")}
              {input({ value: form.imageUrl, onChange: e => setForm(f => ({ ...f, imageUrl: e.target.value })), placeholder: "https://..." })}

              <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", marginBottom: "24px", fontSize: "14px", fontWeight: "600", color: "#475569" }}>
                <input type="checkbox" checked={form.featured} onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))} />
                ⭐ Featured Article (shows prominently on homepage)
              </label>

              <div style={{ display: "flex", gap: "12px" }}>
                <button onClick={submitForm}
                  disabled={createMutation.isPending || updateMutation.isPending || !form.title || !form.summary || !form.content}
                  style={{ background: "#b91c1c", color: "white", border: "none", padding: "12px 28px", borderRadius: "4px", fontSize: "14px", fontWeight: "700", cursor: "pointer" }}>
                  {(createMutation.isPending || updateMutation.isPending) ? "Saving..." : editingId !== null ? "Update Article" : "Publish Article"}
                </button>
                <button onClick={() => { setTab("list"); setEditingId(null); setForm(BLANK_FORM); }}
                  style={{ background: "transparent", color: "#64748b", border: "1px solid #e2e8f0", padding: "12px 20px", borderRadius: "4px", fontSize: "14px", cursor: "pointer" }}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Upload Content */}
        {tab === "upload" && (
          <div style={{ maxWidth: "800px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#1e293b", marginBottom: "8px" }}>Upload & Parse Content</h2>
            <p style={{ color: "#64748b", marginBottom: "28px", fontSize: "14px", lineHeight: "1.6" }}>
              Paste raw HTML, plain text, evidence notes, or research material below. The system will parse it and generate a draft article ready for your review.
            </p>

            <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "6px", padding: "32px", marginBottom: "24px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                <div>
                  {label("CONTENT TYPE")}
                  <select value={uploadContentType} onChange={e => setUploadContentType(e.target.value as "text" | "html" | "evidence")}
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: "4px", fontSize: "14px", marginBottom: "16px", fontFamily: "sans-serif" }}>
                    <option value="text">Plain Text</option>
                    <option value="html">HTML</option>
                    <option value="evidence">Evidence / Research Notes</option>
                  </select>
                </div>
              </div>

              {label("PASTE YOUR CONTENT")}
              <textarea
                value={uploadText}
                onChange={e => setUploadText(e.target.value)}
                placeholder={uploadContentType === "html" ? "Paste HTML content here..." : uploadContentType === "evidence" ? "Paste evidence, research notes, bullet points, quotes, or links..." : "Paste plain text content here..."}
                rows={14}
                style={{ width: "100%", padding: "12px", border: "1px solid #e2e8f0", borderRadius: "4px", fontSize: "14px", marginBottom: "16px", boxSizing: "border-box", fontFamily: "sans-serif", resize: "vertical" }}
              />

              {uploadContentType === "evidence" && (
                <>
                  {label("CONTEXT / ANALYSIS NOTES (optional)")}
                  <textarea
                    value={evidenceNotes}
                    onChange={e => setEvidenceNotes(e.target.value)}
                    placeholder="Add context, analysis, or interpretation of the evidence..."
                    rows={6}
                    style={{ width: "100%", padding: "12px", border: "1px solid #e2e8f0", borderRadius: "4px", fontSize: "14px", marginBottom: "16px", boxSizing: "border-box", fontFamily: "sans-serif", resize: "vertical" }}
                  />
                </>
              )}

              <button
                onClick={() => { setParseError(""); uploadMutation.mutate({ rawContent: uploadText, contentType: uploadContentType, evidenceNotes: uploadContentType === "evidence" ? evidenceNotes : undefined }); }}
                disabled={uploadMutation.isPending || !uploadText.trim()}
                style={{ background: "#1e3a5f", color: "white", border: "none", padding: "12px 24px", borderRadius: "4px", fontSize: "14px", fontWeight: "700", cursor: "pointer" }}>
                {uploadMutation.isPending ? "Parsing..." : "⚡ Parse Content → Generate Draft"}
              </button>
            </div>

            {parseError && (
              <div style={{ background: "#fee2e2", color: "#991b1b", padding: "16px", borderRadius: "4px", fontSize: "14px", marginBottom: "16px" }}>⚠ {parseError}</div>
            )}

            {parsedDraft && (
              <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: "6px", padding: "24px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#166534", marginBottom: "16px" }}>✓ Draft Generated</h3>
                <div style={{ marginBottom: "8px" }}><strong>Title:</strong> {parsedDraft.title}</div>
                <div style={{ marginBottom: "8px" }}><strong>Category:</strong> {parsedDraft.category}</div>
                <div style={{ marginBottom: "16px" }}><strong>Summary:</strong> {parsedDraft.summary}</div>
                <button onClick={useDraft}
                  style={{ background: "#16a34a", color: "white", border: "none", padding: "10px 20px", borderRadius: "4px", fontSize: "14px", fontWeight: "700", cursor: "pointer" }}>
                  Open in Editor →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
