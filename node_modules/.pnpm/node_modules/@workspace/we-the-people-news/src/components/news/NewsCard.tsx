import { Link } from "wouter";
import { format } from "date-fns";
import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Article } from "@workspace/api-client-react";

export function NewsCard({ article }: { article: Article }) {
  return (
    <Link href={`/article/${article.id}`} className="group flex flex-col bg-card rounded-xl overflow-hidden shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.12)] hover:-translate-y-1 transition-all duration-300 border border-border">
      <div className="relative h-56 overflow-hidden bg-muted">
        {/* article fallback thumbnail */}
        <img 
          src={article.imageUrl || "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80"} 
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        <div className="absolute top-4 left-4">
          <Badge className="bg-primary hover:bg-primary text-white border-none shadow-md uppercase tracking-wider text-[10px] font-bold px-2 py-1">
            {article.category}
          </Badge>
        </div>
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex items-center text-xs text-muted-foreground mb-3 font-semibold tracking-wider uppercase">
          <span>{format(new Date(article.createdAt), "MMM d, yyyy")}</span>
          <span className="mx-2 text-gray-300">•</span>
          <span className="flex items-center gap-1 text-primary"><Clock className="w-3 h-3" /> {article.readTimeMinutes} min read</span>
        </div>
        <h3 className="text-xl md:text-2xl font-display font-bold text-navy mb-3 group-hover:text-primary transition-colors leading-tight line-clamp-3">
          {article.title}
        </h3>
        <p className="text-muted-foreground line-clamp-3 text-sm flex-grow leading-relaxed">
          {article.summary}
        </p>
      </div>
    </Link>
  );
}
