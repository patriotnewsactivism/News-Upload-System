import React, { useState } from "react";
import { Lock, LogOut, Plus, Edit2, Trash2, CheckCircle, FileText, UploadCloud, Eye } from "lucide-react";
import { useArticles, useCreateArticleMutation, useUpdateArticleMutation, useDeleteArticleMutation, useUploadArticleContentMutation } from "@/hooks/use-articles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import type { Article } from "@workspace/api-client-react";
import { UploadContentRequestContentType } from "@workspace/api-client-react";

function ArticleEditor({ article, onSaved, onCancel }: { article?: Article | null, onSaved: () => void, onCancel: () => void }) {
  const { toast } = useToast();
  const createMut = useCreateArticleMutation();
  const updateMut = useUpdateArticleMutation();

  const [formData, setFormData] = useState({
    title: article?.title || "",
    summary: article?.summary || "",
    content: article?.content || "",
    category: article?.category || "Politics",
    tags: article?.tags?.join(", ") || "",
    imageUrl: article?.imageUrl || "",
    published: article ? article.published : true,
    featured: article?.featured || false,
    metaTitle: article?.metaTitle || "",
    metaDescription: article?.metaDescription || ""
  });

  const handleSave = () => {
    const data = {
      ...formData,
      tags: formData.tags.split(",").map(t => t.trim()).filter(Boolean)
    };
    
    const onSuccess = () => {
      toast({ title: "Success", description: `Article successfully ${article ? 'updated' : 'created'}.` });
      onSaved();
    };

    if (article && article.id) {
      updateMut.mutate({ id: article.id, data }, { onSuccess });
    } else {
      createMut.mutate({ data }, { onSuccess });
    }
  };

  const isPending = createMut.isPending || updateMut.isPending;

  return (
    <div className="bg-card p-6 md:p-8 rounded-2xl shadow-xl border border-border animate-in fade-in zoom-in-95 duration-300">
      <div className="flex justify-between items-center mb-8 border-b pb-4">
        <h2 className="text-2xl font-display font-black text-navy flex items-center gap-2">
          <FileText className="text-primary" />
          {article ? "Edit Article" : "Create Manual Article"}
        </h2>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input type="checkbox" checked={formData.published} onChange={e => setFormData({...formData, published: e.target.checked})} className="w-4 h-4 text-primary rounded focus:ring-primary" />
            Publish Immediately
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <label className="block text-sm font-bold uppercase tracking-widest text-navy mb-2">Headline</label>
            <Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="text-lg font-bold" placeholder="Breaking news headline..." />
          </div>
          <div>
            <label className="block text-sm font-bold uppercase tracking-widest text-navy mb-2">Summary / Excerpt</label>
            <Textarea value={formData.summary} onChange={e => setFormData({...formData, summary: e.target.value})} rows={3} placeholder="Brief summary for cards and SEO..." />
          </div>
          <div>
            <label className="block text-sm font-bold uppercase tracking-widest text-navy mb-2">Full Content (HTML Supported)</label>
            <Textarea value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} rows={15} className="font-mono text-sm" placeholder="<p>Article content goes here...</p>" />
          </div>
        </div>
        
        <div className="space-y-6 bg-gray-50 p-6 rounded-xl border border-gray-200">
          <div>
            <label className="block text-sm font-bold uppercase tracking-widest text-navy mb-2">Category</label>
            <select 
              value={formData.category} 
              onChange={e => setFormData({...formData, category: e.target.value})}
              className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary"
            >
              <option value="Politics">Politics</option>
              <option value="Government">Government</option>
              <option value="Constitution">Constitution</option>
              <option value="Crime">Crime</option>
              <option value="Economy">Economy</option>
              <option value="World">World</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold uppercase tracking-widest text-navy mb-2">Tags</label>
            <Input value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} placeholder="scotus, election, finance (comma separated)" />
          </div>
          <div>
            <label className="block text-sm font-bold uppercase tracking-widest text-navy mb-2">Featured Image URL</label>
            <Input value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} placeholder="https://..." />
            {formData.imageUrl && <img src={formData.imageUrl} alt="Preview" className="mt-3 w-full h-32 object-cover rounded shadow-inner" />}
          </div>
          <div className="pt-4 border-t border-gray-200">
            <label className="flex items-center gap-2 text-sm font-bold text-navy cursor-pointer">
              <input type="checkbox" checked={formData.featured} onChange={e => setFormData({...formData, featured: e.target.checked})} className="w-5 h-5 text-primary rounded focus:ring-primary" />
              Featured Story (Hero Section)
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4 mt-10 pt-6 border-t border-gray-200">
        <Button variant="outline" onClick={onCancel} className="font-bold tracking-widest px-8">CANCEL</Button>
        <Button onClick={handleSave} disabled={isPending} className="bg-primary hover:bg-red-700 font-bold tracking-widest px-10">
          {isPending ? "SAVING..." : "SAVE ARTICLE"}
        </Button>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  
  const [activeTab, setActiveTab] = useState("list");
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Upload State
  const [rawContent, setRawContent] = useState("");
  const [contentType, setContentType] = useState<UploadContentRequestContentType>(UploadContentRequestContentType.text);
  const uploadMut = useUploadArticleContentMutation();

  const { data, isLoading } = useArticles({ limit: 100 });
  const deleteMut = useDeleteArticleMutation();
  const updateMut = useUpdateArticleMutation();
  const { toast } = useToast();

  if (!authenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 bg-gray-100">
        <div className="bg-white p-10 rounded-2xl shadow-2xl max-w-md w-full border-t-8 border-primary relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 pointer-events-none"></div>
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 text-primary shadow-inner">
            <Lock className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-display font-black text-center mb-2 text-navy">Editor Desk</h2>
          <p className="text-center text-muted-foreground mb-8 font-medium">Restricted access for Don Matthews</p>
          <form onSubmit={e => { 
            e.preventDefault(); 
            if(password === 'WTP2024admin') { setAuthenticated(true); toast({ title: "Access Granted" }); }
            else { toast({ title: "Access Denied", description: "Incorrect password", variant: "destructive" }); setPassword(""); }
          }}>
            <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter Passphrase" className="mb-6 h-12 text-center text-lg tracking-widest" autoFocus />
            <Button type="submit" className="w-full bg-navy hover:bg-navy/90 text-white h-12 font-bold tracking-[0.2em]">UNLOCK PANEL</Button>
          </form>
        </div>
      </div>
    );
  }

  const handleParseUpload = () => {
    if (!rawContent) return;
    uploadMut.mutate({ data: { rawContent, contentType } }, {
      onSuccess: (res) => {
        toast({ title: "Parsing Complete", description: "Content converted to article format." });
        setEditingArticle({
          id: 0, // temp
          title: res.suggestedTitle,
          summary: res.suggestedSummary,
          content: res.processedContent,
          category: res.suggestedCategory,
          tags: res.suggestedTags,
          slug: "",
          author: "Don Matthews",
          readTimeMinutes: 5,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          published: false,
          featured: false,
          metaTitle: res.suggestedMetaTitle,
          metaDescription: res.suggestedMetaDescription
        });
        setIsCreating(true);
        setActiveTab("list"); // Hide upload UI while editing
      }
    });
  };

  const handleTogglePublish = (article: Article) => {
    updateMut.mutate({ id: article.id, data: { published: !article.published } }, {
      onSuccess: () => toast({ title: `Article ${!article.published ? 'Published' : 'Drafted'}` })
    });
  };

  if (isCreating || editingArticle) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10 bg-gray-50 min-h-screen">
        <ArticleEditor 
          article={editingArticle?.id === 0 ? null : editingArticle} // if id 0, it's from parser (new)
          onSaved={() => { setEditingArticle(null); setIsCreating(false); }}
          onCancel={() => { setEditingArticle(null); setIsCreating(false); }}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-display font-black text-navy tracking-tight">Publisher Dashboard</h1>
          <p className="text-muted-foreground mt-1 font-medium">Manage your unfiltered truths and publications.</p>
        </div>
        <div className="flex items-center gap-4">
          <Button onClick={() => setIsCreating(true)} className="bg-primary hover:bg-red-700 font-bold tracking-widest">
            <Plus className="w-4 h-4 mr-2" /> NEW ARTICLE
          </Button>
          <Button variant="outline" onClick={() => setAuthenticated(false)} className="text-gray-500 font-bold tracking-widest">
            <LogOut className="w-4 h-4 mr-2" /> EXIT
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-8 p-1 bg-gray-100 border border-gray-200 rounded-lg">
          <TabsTrigger value="list" className="font-bold tracking-widest uppercase data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm py-2 px-6">
            <FileText className="w-4 h-4 mr-2" /> Article Directory
          </TabsTrigger>
          <TabsTrigger value="upload" className="font-bold tracking-widest uppercase data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm py-2 px-6">
            <UploadCloud className="w-4 h-4 mr-2" /> AI Auto-Publisher
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="font-bold text-navy uppercase tracking-wider">Status</TableHead>
                  <TableHead className="font-bold text-navy uppercase tracking-wider w-[40%]">Headline</TableHead>
                  <TableHead className="font-bold text-navy uppercase tracking-wider">Category</TableHead>
                  <TableHead className="font-bold text-navy uppercase tracking-wider">Date</TableHead>
                  <TableHead className="text-right font-bold text-navy uppercase tracking-wider">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-10 font-bold tracking-widest text-gray-400 animate-pulse">Loading articles...</TableCell></TableRow>
                ) : data?.articles.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-10 text-gray-500">No articles found.</TableCell></TableRow>
                ) : data?.articles.map(article => (
                  <TableRow key={article.id} className="hover:bg-blue-50/50">
                    <TableCell>
                      <button onClick={() => handleTogglePublish(article)} className="focus:outline-none transition-transform hover:scale-105">
                        {article.published ? 
                          <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-200"><CheckCircle className="w-3 h-3 mr-1" /> Published</Badge> : 
                          <Badge variant="outline" className="text-yellow-600 border-yellow-300 bg-yellow-50 hover:bg-yellow-100">Draft</Badge>}
                      </button>
                    </TableCell>
                    <TableCell className="font-bold text-navy">{article.title}</TableCell>
                    <TableCell><span className="text-xs uppercase font-bold tracking-widest text-gray-500">{article.category}</span></TableCell>
                    <TableCell className="text-sm text-gray-500">{format(new Date(article.createdAt), "MMM d, yyyy")}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => window.open(`/article/${article.id}`, '_blank')} title="View">
                        <Eye className="w-4 h-4 text-gray-500 hover:text-navy" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => { setEditingArticle(article); setIsCreating(true); }} title="Edit">
                        <Edit2 className="w-4 h-4 text-blue-600" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => { if(confirm('Delete this article permanently?')) deleteMut.mutate({id: article.id}); }} title="Delete">
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="upload">
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8 max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <UploadCloud className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-display font-black text-navy mb-2">Automated Article Generation</h2>
              <p className="text-muted-foreground text-sm">Paste raw HTML, raw text, or evidence notes. The system will parse it, fix formatting, assign tags, and generate a draft ready for your review.</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold uppercase tracking-widest text-navy mb-2">Source Material Type</label>
                <select 
                  value={contentType} 
                  onChange={e => setContentType(e.target.value as UploadContentRequestContentType)}
                  className="w-full h-12 px-4 rounded-md border border-gray-300 bg-gray-50 text-navy font-semibold ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <option value={UploadContentRequestContentType.html}>Raw HTML Code</option>
                  <option value={UploadContentRequestContentType.text}>Plain Text Article</option>
                  <option value={UploadContentRequestContentType.evidence}>Evidence / Field Notes</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold uppercase tracking-widest text-navy mb-2">Raw Content</label>
                <Textarea 
                  value={rawContent} 
                  onChange={e => setRawContent(e.target.value)} 
                  rows={12} 
                  className="font-mono text-sm bg-gray-900 text-green-400 p-4 rounded-lg focus-visible:ring-primary border-0" 
                  placeholder="Paste your source material here..." 
                />
              </div>

              <Button 
                onClick={handleParseUpload} 
                disabled={!rawContent || uploadMut.isPending} 
                className="w-full h-14 bg-primary hover:bg-red-700 text-white font-bold tracking-widest text-lg shadow-lg transition-transform active:scale-[0.98]"
              >
                {uploadMut.isPending ? "ANALYZING & PARSING..." : "GENERATE ARTICLE DRAFT"}
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
