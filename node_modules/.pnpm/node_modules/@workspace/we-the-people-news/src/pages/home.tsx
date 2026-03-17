import React, { useState } from "react";
import { Link } from "wouter";
import { ArrowRight, Mail } from "lucide-react";
import { useArticles } from "@/hooks/use-articles";
import { useSubscribeNewsletterMutation } from "@/hooks/use-newsletter";
import { NewsCard } from "@/components/news/NewsCard";
import { AdPlaceholder } from "@/components/news/AdPlaceholder";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-32 w-full">
      <div className="w-12 h-12 border-4 border-gray-200 border-t-primary rounded-full animate-spin shadow-md"></div>
      <p className="mt-4 text-navy font-bold uppercase tracking-[0.2em] text-sm animate-pulse">Loading Articles...</p>
    </div>
  )
}

function NewsletterSidebar() {
  const [email, setEmail] = useState("");
  const mutation = useSubscribeNewsletterMutation();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    mutation.mutate({ data: { email } }, {
      onSuccess: () => setEmail("")
    });
  }

  return (
    <div className="bg-navy p-8 rounded-2xl shadow-xl border border-gray-800 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Mail className="w-24 h-24 text-white" />
      </div>
      <div className="relative z-10">
        <h3 className="text-2xl font-display font-black text-white mb-2 leading-tight">Get the Truth<br/>Delivered.</h3>
        <p className="text-gray-400 text-sm mb-6 leading-relaxed">Join 50,000+ patriots receiving unfiltered independent news directly from Don Matthews.</p>
        <form onSubmit={handleSubscribe} className="flex flex-col gap-3">
          <Input 
            type="email" 
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Your email address" 
            className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 h-12"
            required
          />
          <Button 
            type="submit" 
            disabled={mutation.isPending}
            className="h-12 bg-primary hover:bg-red-700 text-white font-bold tracking-widest text-sm transition-all"
          >
            {mutation.isPending ? "SUBSCRIBING..." : "SUBSCRIBE NOW"}
          </Button>
        </form>
        {mutation.isSuccess && <p className="text-green-400 text-sm mt-4 font-medium flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-400"></div> Successfully subscribed!</p>}
      </div>
    </div>
  )
}

export default function Home({ category }: { category?: string }) {
  const { data, isLoading } = useArticles({ limit: 20, category });

  if (isLoading) return <LoadingSpinner />;
  
  const articles = data?.articles || [];
  const heroArticle = articles.find(a => a.featured) || articles[0];
  const gridArticles = heroArticle ? articles.filter(a => a.id !== heroArticle.id) : articles;
  const trendingArticles = [...articles].sort((a, b) => b.readTimeMinutes - a.readTimeMinutes).slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      
      {category && (
        <div className="mb-8">
          <h2 className="text-3xl font-display font-black text-navy border-l-4 border-primary pl-4 uppercase tracking-wider">
            {category} News
          </h2>
        </div>
      )}

      {/* Hero Section */}
      {!category && heroArticle && (
        <section className="mb-12 md:mb-16 relative rounded-2xl overflow-hidden shadow-2xl group flex flex-col min-h-[500px] lg:min-h-[600px] bg-navy border border-gray-800">
          <img 
            src={heroArticle.imageUrl || "https://images.unsplash.com/photo-1495020632541-8cf3486be514?w=1200&q=80"} 
            alt={heroArticle.title} 
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-[10s] ease-out opacity-60 mix-blend-luminosity" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/80 to-transparent"></div>
          
          <div className="relative z-20 p-6 md:p-12 mt-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div className="max-w-4xl">
                <Badge className="mb-4 bg-primary text-white border-none text-xs font-bold tracking-[0.2em] px-3 py-1">
                  FEATURED STORY
                </Badge>
                <h2 className="text-3xl md:text-5xl lg:text-6xl font-display font-black text-white mb-4 leading-[1.1] drop-shadow-lg">
                  {heroArticle.title}
                </h2>
                <p className="text-lg md:text-xl text-gray-300 mb-0 line-clamp-2 md:line-clamp-3 font-medium leading-relaxed max-w-3xl">
                  {heroArticle.summary}
                </p>
              </div>
              <div className="shrink-0">
                <Link href={`/article/${heroArticle.id}`}>
                  <Button size="lg" className="w-full md:w-auto bg-primary hover:bg-white hover:text-primary text-white font-bold tracking-widest px-8 py-7 text-sm rounded-none transition-all flex items-center gap-2 group/btn">
                    READ FULL STORY
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {articles.length === 0 ? (
        <div className="py-20 text-center text-gray-500 font-medium">
          No articles published in this category yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Main Content Area */}
          <div className="lg:col-span-8">
            <div className="flex items-center justify-between border-b-2 border-gray-200 pb-4 mb-8">
              <h2 className="text-2xl font-display font-black text-navy uppercase tracking-widest">
                Latest Reports
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {gridArticles.map(article => (
                <NewsCard key={article.id} article={article} />
              ))}
            </div>
            
            {gridArticles.length > 0 && (
              <div className="mt-12 text-center">
                <Button variant="outline" className="border-2 border-navy text-navy hover:bg-navy hover:text-white font-bold tracking-widest px-10 py-6 rounded-none">
                  LOAD MORE ARTICLES
                </Button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-10">
            
            {/* Ad */}
            <div className="flex justify-center bg-white p-4 rounded-xl border shadow-sm">
              <AdPlaceholder width="300px" height="250px" />
            </div>

            {/* Support Banner using generated bg image */}
            <div className="relative rounded-2xl overflow-hidden shadow-lg h-72 border border-gray-800 group">
              <img src={`${import.meta.env.BASE_URL}images/hero-bg.png`} alt="Patriotic Banner" className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/60 to-transparent flex flex-col justify-end p-8">
                <Badge className="w-fit mb-3 bg-white text-navy hover:bg-white border-none text-[10px] uppercase font-black tracking-widest">Support Us</Badge>
                <h3 className="text-white font-display font-black text-2xl mb-4 leading-tight">Keep Independent Journalism Alive</h3>
                <Button className="w-full bg-primary hover:bg-red-700 text-white rounded font-bold tracking-widest shadow-lg">
                  DONATE NOW
                </Button>
              </div>
            </div>

            <NewsletterSidebar />

            {/* Trending / Most Read */}
            <div className="bg-card rounded-2xl shadow-lg border border-border p-6">
              <h3 className="text-lg font-display font-black text-navy mb-6 uppercase tracking-widest border-b border-gray-100 pb-4">Most Read</h3>
              <div className="space-y-6">
                {trendingArticles.map((article, idx) => (
                  <Link key={article.id} href={`/article/${article.id}`} className="group flex gap-4">
                    <div className="text-4xl font-display font-black text-gray-200 group-hover:text-primary transition-colors leading-none">
                      0{idx + 1}
                    </div>
                    <div>
                      <h4 className="font-bold text-navy text-sm mb-1 group-hover:text-primary transition-colors leading-snug line-clamp-2">
                        {article.title}
                      </h4>
                      <p className="text-xs text-muted-foreground font-semibold uppercase">{article.category}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

          </aside>
        </div>
      )}
    </div>
  );
}
