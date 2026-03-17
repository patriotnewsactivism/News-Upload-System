import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { format } from "date-fns";

const CATEGORIES = ["All", "Politics", "Government", "Constitution", "Crime", "Economy", "World"];

async function fetchArticles(category?: string) {
  const params = new URLSearchParams({ limit: "20", offset: "0" });
  if (category && category !== "All") params.set("category", category);
  const res = await fetch(`/api/articles?${params}`);
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}

async function subscribeNewsletter(email: string) {
  const res = await fetch("/api/newsletter", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) throw new Error("Failed to subscribe");
  return res.json();
}

export default function HomePage({ category }: { category?: string }) {
  const [activeCategory, setActiveCategory] = useState(category || "All");
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["articles", activeCategory],
    queryFn: () => fetchArticles(activeCategory),
  });

  const subscribeMutation = useMutation({
    mutationFn: subscribeNewsletter,
    onSuccess: () => { setSubscribed(true); setEmail(""); },
  });

  const articles = data?.articles || [];
  const featured = articles.find((a: any) => a.featured) || articles[0];
  const rest = featured ? articles.filter((a: any) => a.id !== featured.id) : articles;

  return (
    <div style={{ fontFamily: "'Georgia', serif", background: "#f8f8f6", minHeight: "100vh" }}>
      {/* Breaking News Ticker */}
      <div style={{ background: "#b91c1c", color: "white", padding: "6px 16px", fontSize: "13px", fontFamily: "sans-serif", overflow: "hidden", whiteSpace: "nowrap" }}>
        <strong style={{ marginRight: "16px", background: "#7f1d1d", padding: "2px 8px", borderRadius: "2px" }}>⚡ BREAKING</strong>
        <span>Government whistleblower reveals new evidence • Constitutional rights under review • Independent journalism you can trust • Border crisis latest developments •</span>
      </div>

      {/* Header */}
      <header style={{ background: "#1e3a5f", color: "white", padding: "0" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "24px 20px 16px" }}>
          <div style={{ textAlign: "center", borderBottom: "3px solid #b91c1c", paddingBottom: "16px", marginBottom: "16px" }}>
            <div style={{ fontSize: "11px", letterSpacing: "4px", color: "#94a3b8", fontFamily: "sans-serif", marginBottom: "8px" }}>INDEPENDENT • UNFILTERED • FEARLESS</div>
            <div style={{ fontSize: "clamp(32px,5vw,64px)", fontWeight: "900", letterSpacing: "-1px", lineHeight: "1", color: "white" }}>WE THE PEOPLE</div>
            <div style={{ fontSize: "clamp(14px,2.5vw,22px)", letterSpacing: "8px", color: "#e2e8f0", fontFamily: "sans-serif", fontWeight: "300" }}>N E W S</div>
            <div style={{ fontSize: "12px", color: "#94a3b8", fontFamily: "sans-serif", marginTop: "8px" }}>
              {format(new Date(), "EEEE, MMMM d, yyyy")} | By Don Matthews
            </div>
          </div>

          {/* Nav */}
          <nav style={{ display: "flex", gap: "4px", flexWrap: "wrap", justifyContent: "center", fontFamily: "sans-serif" }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: "6px 14px",
                  fontSize: "12px",
                  fontWeight: "600",
                  letterSpacing: "1px",
                  border: "none",
                  borderRadius: "3px",
                  cursor: "pointer",
                  transition: "all .15s",
                  background: activeCategory === cat ? "#b91c1c" : "transparent",
                  color: activeCategory === cat ? "white" : "#cbd5e1",
                  textTransform: "uppercase",
                }}
              >
                {cat}
              </button>
            ))}
            <Link href="/admin" style={{ marginLeft: "auto", padding: "6px 14px", fontSize: "12px", fontWeight: "600", color: "#64748b", textDecoration: "none" }}>Admin ›</Link>
          </nav>
        </div>
      </header>

      {/* Top Ad Banner */}
      <div style={{ background: "#e2e8f0", textAlign: "center", padding: "12px", borderBottom: "1px solid #cbd5e1" }}>
        <div style={{ display: "inline-block", background: "#f1f5f9", border: "1px dashed #94a3b8", padding: "12px 40px", fontSize: "12px", color: "#64748b", fontFamily: "sans-serif" }}>
          📢 Advertisement — 728×90 Leaderboard Ad Placement
        </div>
      </div>

      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px 20px", display: "grid", gridTemplateColumns: "1fr 320px", gap: "32px" }}>
        {/* Left Column - Articles */}
        <div>
          {isLoading && (
            <div style={{ textAlign: "center", padding: "80px", color: "#64748b", fontFamily: "sans-serif" }}>Loading latest news...</div>
          )}

          {/* Featured Article */}
          {!isLoading && featured && (
            <div style={{ marginBottom: "40px" }}>
              <div style={{ background: "#b91c1c", color: "white", fontSize: "11px", fontWeight: "700", letterSpacing: "3px", padding: "4px 10px", display: "inline-block", marginBottom: "12px", fontFamily: "sans-serif" }}>
                ★ FEATURED STORY
              </div>
              <Link href={`/article/${featured.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "4px", overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", cursor: "pointer" }}>
                  <img
                    src={featured.imageUrl || "https://images.unsplash.com/photo-1495020632541-8cf3486be514?w=900&q=80"}
                    alt={featured.title}
                    style={{ width: "100%", height: "360px", objectFit: "cover", display: "block" }}
                  />
                  <div style={{ padding: "28px" }}>
                    <div style={{ fontSize: "11px", fontWeight: "700", letterSpacing: "2px", color: "#b91c1c", marginBottom: "10px", fontFamily: "sans-serif" }}>
                      {featured.category.toUpperCase()}
                    </div>
                    <h1 style={{ fontSize: "28px", fontWeight: "900", lineHeight: "1.2", color: "#1e293b", marginBottom: "14px" }}>
                      {featured.title}
                    </h1>
                    <p style={{ fontSize: "16px", color: "#475569", lineHeight: "1.7", marginBottom: "16px", fontFamily: "sans-serif" }}>{featured.summary}</p>
                    <div style={{ fontSize: "12px", color: "#94a3b8", fontFamily: "sans-serif" }}>
                      By <strong style={{ color: "#1e3a5f" }}>Don Matthews</strong> · {featured.publishedAt ? format(new Date(featured.publishedAt), "MMMM d, yyyy") : ""} · {featured.readTimeMinutes} min read
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          )}

          {/* Article Grid */}
          {!isLoading && rest.length > 0 && (
            <div>
              <div style={{ display: "flex", alignItems: "center", marginBottom: "24px", gap: "12px" }}>
                <div style={{ width: "4px", height: "24px", background: "#b91c1c", borderRadius: "2px" }}></div>
                <h2 style={{ fontSize: "18px", fontWeight: "800", color: "#1e293b", letterSpacing: "1px", textTransform: "uppercase", fontFamily: "sans-serif", margin: 0 }}>Latest News</h2>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "24px" }}>
                {rest.map((article: any) => (
                  <Link key={article.id} href={`/article/${article.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                    <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "4px", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", cursor: "pointer", transition: "transform .2s, box-shadow .2s" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 24px rgba(0,0,0,0.12)"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ""; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 8px rgba(0,0,0,0.05)"; }}
                    >
                      <img
                        src={article.imageUrl || "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&q=80"}
                        alt={article.title}
                        style={{ width: "100%", height: "180px", objectFit: "cover", display: "block" }}
                      />
                      <div style={{ padding: "18px" }}>
                        <div style={{ fontSize: "10px", fontWeight: "700", letterSpacing: "2px", color: "#b91c1c", marginBottom: "8px", fontFamily: "sans-serif" }}>
                          {article.category.toUpperCase()}
                        </div>
                        <h3 style={{ fontSize: "16px", fontWeight: "800", lineHeight: "1.3", color: "#1e293b", marginBottom: "10px" }}>
                          {article.title}
                        </h3>
                        <p style={{ fontSize: "13px", color: "#64748b", lineHeight: "1.6", marginBottom: "12px", fontFamily: "sans-serif" }}>
                          {article.summary.slice(0, 120)}...
                        </p>
                        <div style={{ fontSize: "11px", color: "#94a3b8", fontFamily: "sans-serif" }}>
                          {article.publishedAt ? format(new Date(article.publishedAt), "MMM d, yyyy") : ""} · {article.readTimeMinutes} min
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {!isLoading && articles.length === 0 && (
            <div style={{ textAlign: "center", padding: "80px", color: "#64748b", fontFamily: "sans-serif" }}>
              <p style={{ fontSize: "18px" }}>No articles yet.</p>
              <Link href="/admin" style={{ color: "#b91c1c" }}>Go to Admin to publish your first story →</Link>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <aside>
          {/* 300x250 Ad */}
          <div style={{ background: "#f1f5f9", border: "1px dashed #94a3b8", padding: "40px 20px", textAlign: "center", marginBottom: "28px", fontFamily: "sans-serif" }}>
            <div style={{ fontSize: "11px", color: "#94a3b8" }}>Advertisement</div>
            <div style={{ fontSize: "13px", color: "#64748b", marginTop: "8px" }}>300×250 Ad Placement</div>
          </div>

          {/* Newsletter */}
          <div style={{ background: "#1e3a5f", color: "white", padding: "28px", borderRadius: "4px", marginBottom: "28px" }}>
            <h3 style={{ fontSize: "20px", fontWeight: "900", marginBottom: "8px", lineHeight: "1.2" }}>Get the Truth<br />Delivered Daily.</h3>
            <p style={{ fontSize: "13px", color: "#94a3b8", marginBottom: "18px", lineHeight: "1.6", fontFamily: "sans-serif" }}>Join 50,000+ patriots. No censorship. No filters.</p>
            {subscribed ? (
              <div style={{ color: "#4ade80", fontSize: "14px", fontFamily: "sans-serif" }}>✓ You're subscribed!</div>
            ) : (
              <form onSubmit={e => { e.preventDefault(); subscribeMutation.mutate(email); }}>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Your email address"
                  required
                  style={{ width: "100%", padding: "10px 12px", marginBottom: "10px", border: "1px solid #334155", borderRadius: "3px", background: "#0f2342", color: "white", fontSize: "14px", boxSizing: "border-box", fontFamily: "sans-serif" }}
                />
                <button
                  type="submit"
                  disabled={subscribeMutation.isPending}
                  style={{ width: "100%", padding: "10px", background: "#b91c1c", color: "white", border: "none", borderRadius: "3px", fontSize: "13px", fontWeight: "700", letterSpacing: "1px", cursor: "pointer", fontFamily: "sans-serif" }}
                >
                  {subscribeMutation.isPending ? "SUBSCRIBING..." : "SUBSCRIBE NOW"}
                </button>
              </form>
            )}
          </div>

          {/* Support / Donate */}
          <div style={{ background: "white", border: "2px solid #b91c1c", padding: "24px", borderRadius: "4px", marginBottom: "28px", textAlign: "center" }}>
            <div style={{ fontSize: "22px", marginBottom: "8px" }}>🇺🇸</div>
            <h3 style={{ fontSize: "16px", fontWeight: "900", color: "#1e293b", marginBottom: "8px" }}>Support Independent Journalism</h3>
            <p style={{ fontSize: "12px", color: "#64748b", marginBottom: "16px", lineHeight: "1.6", fontFamily: "sans-serif" }}>Don Matthews relies on readers like you to keep the truth alive.</p>
            <a
              href="https://www.paypal.com/donate"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "block", background: "#b91c1c", color: "white", padding: "10px", borderRadius: "3px", fontSize: "13px", fontWeight: "700", textDecoration: "none", marginBottom: "8px", letterSpacing: "1px", fontFamily: "sans-serif" }}
            >
              💛 DONATE VIA PAYPAL
            </a>
            <a
              href="https://www.patreon.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "block", background: "#ff424d", color: "white", padding: "10px", borderRadius: "3px", fontSize: "13px", fontWeight: "700", textDecoration: "none", letterSpacing: "1px", fontFamily: "sans-serif" }}
            >
              🔥 BECOME A PATRON
            </a>
          </div>

          {/* Trending */}
          {articles.slice(0, 4).length > 0 && (
            <div style={{ background: "white", border: "1px solid #e2e8f0", padding: "20px", borderRadius: "4px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                <div style={{ width: "3px", height: "18px", background: "#b91c1c" }}></div>
                <h3 style={{ fontSize: "13px", fontWeight: "800", color: "#1e293b", letterSpacing: "2px", textTransform: "uppercase", fontFamily: "sans-serif", margin: 0 }}>Trending</h3>
              </div>
              {articles.slice(0, 4).map((article: any, i: number) => (
                <Link key={article.id} href={`/article/${article.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                  <div style={{ display: "flex", gap: "12px", marginBottom: "14px", paddingBottom: "14px", borderBottom: i < 3 ? "1px solid #f1f5f9" : "none", cursor: "pointer" }}>
                    <div style={{ fontSize: "24px", fontWeight: "900", color: "#e2e8f0", lineHeight: "1", minWidth: "28px", fontFamily: "sans-serif" }}>{i + 1}</div>
                    <div>
                      <div style={{ fontSize: "13px", fontWeight: "700", color: "#1e293b", lineHeight: "1.4", marginBottom: "4px" }}>{article.title.slice(0, 70)}...</div>
                      <div style={{ fontSize: "11px", color: "#94a3b8", fontFamily: "sans-serif" }}>{article.readTimeMinutes} min read</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </aside>
      </main>

      {/* Footer */}
      <footer style={{ background: "#1e3a5f", color: "#94a3b8", padding: "48px 20px 24px", fontFamily: "sans-serif" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "32px", marginBottom: "40px" }}>
            <div>
              <div style={{ fontSize: "22px", fontWeight: "900", color: "white", marginBottom: "8px", fontFamily: "Georgia, serif" }}>We The People News</div>
              <p style={{ fontSize: "13px", lineHeight: "1.7" }}>Independent journalism by Don Matthews. Fighting for truth, liberty, and the American way.</p>
            </div>
            <div>
              <h4 style={{ color: "white", fontWeight: "700", marginBottom: "12px", fontSize: "13px", letterSpacing: "2px" }}>CATEGORIES</h4>
              {["Politics", "Government", "Constitution", "Crime", "Economy", "World"].map(cat => (
                <div key={cat}>
                  <button onClick={() => setActiveCategory(cat)} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "13px", padding: "3px 0", display: "block" }}>
                    {cat}
                  </button>
                </div>
              ))}
            </div>
            <div>
              <h4 style={{ color: "white", fontWeight: "700", marginBottom: "12px", fontSize: "13px", letterSpacing: "2px" }}>SUPPORT</h4>
              <div><a href="https://www.paypal.com/donate" target="_blank" rel="noopener noreferrer" style={{ color: "#94a3b8", textDecoration: "none", fontSize: "13px" }}>Donate via PayPal</a></div>
              <div><a href="https://www.patreon.com" target="_blank" rel="noopener noreferrer" style={{ color: "#94a3b8", textDecoration: "none", fontSize: "13px" }}>Become a Patron</a></div>
              <div><Link href="/admin" style={{ color: "#94a3b8", textDecoration: "none", fontSize: "13px" }}>Admin Login</Link></div>
            </div>
          </div>
          <div style={{ borderTop: "1px solid #1e3a5f", paddingTop: "20px", textAlign: "center", fontSize: "12px" }}>
            © {new Date().getFullYear()} We The People News · All Rights Reserved · Don Matthews
          </div>
        </div>
      </footer>
    </div>
  );
}
