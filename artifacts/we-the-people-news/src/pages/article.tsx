import React, { useEffect } from "react";
import { format } from "date-fns";
import { Clock, Facebook, Twitter, Link as LinkIcon, ChevronLeft } from "lucide-react";
import { Link } from "wouter";
import { useArticle, useArticles } from "@/hooks/use-articles";
import { AdPlaceholder } from "@/components/news/AdPlaceholder";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "./home";

function AuthorBio() {
  return (
    <div className="bg-card rounded-2xl p-6 md:p-8 shadow-xl border border-border flex flex-col items-center text-center">
      <img 
        src={`${import.meta.env.BASE_URL}images/don-matthews.png`} 
        alt="Don Matthews" 
        className="w-24 h-24 rounded-full object-cover border-4 border-primary shadow-lg mb-4" 
      />
      <h3 className="font-display font-black text-xl text-navy mb-1">Don Matthews</h3>
      <p className="text-sm text-primary font-bold tracking-widest uppercase mb-4">Investigative Journalist</p>
      <p className="text-muted-foreground text-sm leading-relaxed mb-6">
        Don Matthews has spent over 30 years uncovering the truth behind the headlines. Committed to the Constitution and the American people, he provides fearless, independent reporting you won't find in mainstream media.
      </p>
      <Button variant="outline" className="w-full font-bold tracking-widest text-xs">
        VIEW ALL ARTICLES
      </Button>
    </div>
  );
}

export default function ArticleView({ id }: { id: number }) {
  const { data: article, isLoading, error } = useArticle(id);
  const { data: relatedData } = useArticles({ limit: 3, category: article?.category });

  useEffect(() => {
    if (article) {
      document.title = `${article.title} | We The People News`;
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute("name", "description");
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute("content", article.summary);
    }
  }, [article]);

  if (isLoading) return <LoadingSpinner />;
  
  if (error || !article) {
    return (
      <div className="py-32 text-center flex flex-col items-center">
        <h1 className="text-4xl font-display font-black text-navy mb-4">Article Not Found</h1>
        <p className="text-muted-foreground mb-8">The story you are looking for has been moved or deleted.</p>
        <Link href="/">
          <Button className="bg-primary hover:bg-red-700 font-bold tracking-widest">RETURN HOME</Button>
        </Link>
      </div>
    );
  }

  const relatedArticles = relatedData?.articles.filter(a => a.id !== article.id).slice(0, 2) || [];

  return (
    <article className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16">
      <Link href="/" className="inline-flex items-center text-sm font-bold tracking-widest text-muted-foreground hover:text-primary transition-colors uppercase mb-8 md:mb-12">
        <ChevronLeft className="w-4 h-4 mr-1" /> Back to News
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
        
        {/* Main Article Column */}
        <div className="lg:col-span-8">
          <header className="mb-10">
            <div className="flex items-center gap-3 mb-6">
              <Badge className="bg-primary hover:bg-primary text-white border-none uppercase tracking-widest font-bold px-3 py-1">
                {article.category}
              </Badge>
              <span className="text-muted-foreground text-sm font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4" /> {article.readTimeMinutes} min read
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-black text-navy mb-6 leading-[1.1] tracking-tight">
              {article.title}
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 font-medium italic leading-relaxed mb-8 border-l-4 border-gray-300 pl-6">
              {article.summary}
            </p>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between py-6 border-y border-gray-200 gap-4">
              <div className="flex items-center gap-4">
                <img src={`${import.meta.env.BASE_URL}images/don-matthews.png`} alt="Author" className="w-12 h-12 rounded-full border border-gray-300 object-cover shadow-sm" />
                <div>
                  <p className="font-bold text-navy uppercase tracking-wider text-sm">By {article.author}</p>
                  <p className="text-xs text-muted-foreground font-semibold">{format(new Date(article.createdAt), "MMMM d, yyyy 'at' h:mm a")}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" className="rounded-full w-10 h-10 border-gray-300 text-gray-500 hover:text-[#1877F2] hover:border-[#1877F2]">
                  <Facebook className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" className="rounded-full w-10 h-10 border-gray-300 text-gray-500 hover:text-[#1DA1F2] hover:border-[#1DA1F2]">
                  <Twitter className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" className="rounded-full w-10 h-10 border-gray-300 text-gray-500 hover:text-navy hover:border-navy">
                  <LinkIcon className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </header>

          <div className="my-8 flex justify-center">
             <AdPlaceholder width="100%" height="90px" />
          </div>

          {article.imageUrl && (
            <div className="mb-12 rounded-xl overflow-hidden shadow-xl border border-gray-200">
              <img src={article.imageUrl} alt={article.title} className="w-full h-auto object-cover max-h-[600px]" />
              <div className="bg-gray-50 p-3 text-xs text-center text-muted-foreground border-t border-gray-200">
                Staff Photo / We The People News
              </div>
            </div>
          )}

          <div 
            className="prose prose-lg md:prose-xl prose-headings:font-display prose-headings:font-black prose-headings:text-navy prose-p:text-gray-800 prose-p:leading-relaxed prose-a:text-primary hover:prose-a:text-red-700 max-w-none article-content selection:bg-primary selection:text-white"
            dangerouslySetInnerHTML={{ __html: article.content }} 
          />

          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-bold text-navy uppercase tracking-widest mr-2 flex items-center">Filed Under:</span>
              {article.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-xs font-semibold px-3 py-1">
                  #{tag}
                </Badge>
              ))}
            </div>
          </div>
          
          <div className="my-12 flex justify-center bg-gray-50 p-6 rounded-xl border border-gray-200">
             <AdPlaceholder width="100%" height="250px" />
          </div>
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-4 space-y-10">
          <AuthorBio />
          
          <div className="flex justify-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
             <AdPlaceholder width="300px" height="600px" />
          </div>

          {relatedArticles.length > 0 && (
            <div className="bg-navy p-6 rounded-2xl shadow-xl">
              <h3 className="text-white font-display font-black text-xl mb-6 uppercase tracking-widest border-b border-gray-800 pb-4">
                Related Reports
              </h3>
              <div className="space-y-6">
                {relatedArticles.map(rel => (
                  <Link key={rel.id} href={`/article/${rel.id}`} className="block group">
                    <h4 className="text-gray-200 font-bold leading-tight group-hover:text-primary transition-colors mb-2">
                      {rel.title}
                    </h4>
                    <span className="text-xs text-gray-500 font-bold tracking-wider uppercase flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {rel.readTimeMinutes} MIN
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </aside>
        
      </div>
    </article>
  );
}
