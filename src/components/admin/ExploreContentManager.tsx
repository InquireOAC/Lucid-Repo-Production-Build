import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Trash2, Plus, Video, FileText, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

function extractYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtu\.be\/|v=|\/embed\/|\/v\/|\/e\/|watch\?.*v=)([^&?\s#]+)/);
  return match?.[1] || null;
}

const ExploreContentManager = () => {
  const { user } = useAuth();
  const qc = useQueryClient();

  // ─── Videos ───
  const [videoUrl, setVideoUrl] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [videoDuration, setVideoDuration] = useState("");
  const [videoAuthor, setVideoAuthor] = useState("");
  const [videoCategory, setVideoCategory] = useState<string>("lucid-dreaming");

  const { data: videos = [], isLoading: loadingVideos } = useQuery({
    queryKey: ["admin-explore-videos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("explore_videos")
        .select("*")
        .order("category")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const addVideo = useMutation({
    mutationFn: async () => {
      const ytId = extractYouTubeId(videoUrl);
      if (!ytId) throw new Error("Invalid YouTube URL");
      const { error } = await supabase.from("explore_videos").insert({
        title: videoTitle || "Untitled",
        youtube_url: videoUrl,
        youtube_id: ytId,
        thumbnail_url: `https://img.youtube.com/vi/${ytId}/mqdefault.jpg`,
        duration: videoDuration,
        author: videoAuthor,
        category: videoCategory,
        created_by: user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-explore-videos"] });
      qc.invalidateQueries({ queryKey: ["explore-videos"] });
      setVideoUrl(""); setVideoTitle(""); setVideoDuration(""); setVideoAuthor("");
      toast.success("Video added");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggleVideo = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase.from("explore_videos").update({ is_active: active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-explore-videos"] });
      qc.invalidateQueries({ queryKey: ["explore-videos"] });
    },
  });

  const deleteVideo = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("explore_videos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-explore-videos"] });
      qc.invalidateQueries({ queryKey: ["explore-videos"] });
      toast.success("Video removed");
    },
  });

  // ─── Articles ───
  const [artTitle, setArtTitle] = useState("");
  const [artJournal, setArtJournal] = useState("");
  const [artYear, setArtYear] = useState("");
  const [artAuthors, setArtAuthors] = useState("");
  const [artFinding, setArtFinding] = useState("");
  const [artUrl, setArtUrl] = useState("");
  const [artCategory, setArtCategory] = useState<string>("lucid-dreaming");

  const { data: articles = [], isLoading: loadingArticles } = useQuery({
    queryKey: ["admin-explore-articles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("explore_articles")
        .select("*")
        .order("category")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const addArticle = useMutation({
    mutationFn: async () => {
      if (!artTitle || !artUrl) throw new Error("Title and URL required");
      const { error } = await supabase.from("explore_articles").insert({
        title: artTitle,
        journal: artJournal || null,
        year: artYear ? parseInt(artYear) : null,
        authors: artAuthors,
        key_finding: artFinding,
        url: artUrl,
        category: artCategory,
        created_by: user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-explore-articles"] });
      qc.invalidateQueries({ queryKey: ["explore-articles"] });
      setArtTitle(""); setArtJournal(""); setArtYear(""); setArtAuthors(""); setArtFinding(""); setArtUrl("");
      toast.success("Article added");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteArticle = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("explore_articles").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-explore-articles"] });
      qc.invalidateQueries({ queryKey: ["explore-articles"] });
      toast.success("Article removed");
    },
  });

  return (
    <Tabs defaultValue="videos" className="w-full">
      <TabsList className="w-full bg-muted/30">
        <TabsTrigger value="videos" className="flex-1 gap-1.5 text-xs">
          <Video className="h-3.5 w-3.5" /> Videos
        </TabsTrigger>
        <TabsTrigger value="articles" className="flex-1 gap-1.5 text-xs">
          <FileText className="h-3.5 w-3.5" /> Articles
        </TabsTrigger>
      </TabsList>

      {/* ─── Videos Tab ─── */}
      <TabsContent value="videos" className="space-y-4 mt-4">
        <div className="glass-card rounded-xl p-4 space-y-3">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Add Video</h4>
          <div className="space-y-2">
            <Input placeholder="YouTube URL *" value={videoUrl} onChange={e => setVideoUrl(e.target.value)} className="text-sm" />
            <Input placeholder="Title" value={videoTitle} onChange={e => setVideoTitle(e.target.value)} className="text-sm" />
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="Author" value={videoAuthor} onChange={e => setVideoAuthor(e.target.value)} className="text-sm" />
              <Input placeholder="Duration (e.g. 12:30)" value={videoDuration} onChange={e => setVideoDuration(e.target.value)} className="text-sm" />
            </div>
            <Select value={videoCategory} onValueChange={setVideoCategory}>
              <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="lucid-dreaming">Lucid Dreaming</SelectItem>
                <SelectItem value="meditation">Meditation</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" className="w-full" onClick={() => addVideo.mutate()} disabled={!videoUrl || addVideo.isPending}>
              <Plus className="h-4 w-4 mr-1" /> Add Video
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          {loadingVideos ? (
            <p className="text-xs text-muted-foreground text-center py-4">Loading...</p>
          ) : videos.map(v => (
            <div key={v.id} className="glass-card rounded-lg p-3 flex items-center gap-3">
              <img src={v.thumbnail_url || `https://img.youtube.com/vi/${v.youtube_id}/mqdefault.jpg`} alt="" className="w-16 h-10 rounded object-cover" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground truncate">{v.title}</p>
                <p className="text-[10px] text-muted-foreground">{v.author} · {v.category}</p>
              </div>
              <Switch checked={v.is_active} onCheckedChange={(active) => toggleVideo.mutate({ id: v.id, active })} />
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteVideo.mutate(v.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </TabsContent>

      {/* ─── Articles Tab ─── */}
      <TabsContent value="articles" className="space-y-4 mt-4">
        <div className="glass-card rounded-xl p-4 space-y-3">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Add Article / Study</h4>
          <div className="space-y-2">
            <Input placeholder="Title *" value={artTitle} onChange={e => setArtTitle(e.target.value)} className="text-sm" />
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="Journal" value={artJournal} onChange={e => setArtJournal(e.target.value)} className="text-sm" />
              <Input placeholder="Year" type="number" value={artYear} onChange={e => setArtYear(e.target.value)} className="text-sm" />
            </div>
            <Input placeholder="Authors" value={artAuthors} onChange={e => setArtAuthors(e.target.value)} className="text-sm" />
            <Textarea placeholder="Key Finding" value={artFinding} onChange={e => setArtFinding(e.target.value)} className="text-sm min-h-[60px]" />
            <Input placeholder="URL (DOI or link) *" value={artUrl} onChange={e => setArtUrl(e.target.value)} className="text-sm" />
            <Select value={artCategory} onValueChange={setArtCategory}>
              <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="lucid-dreaming">Lucid Dreaming</SelectItem>
                <SelectItem value="meditation">Meditation</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" className="w-full" onClick={() => addArticle.mutate()} disabled={!artTitle || !artUrl || addArticle.isPending}>
              <Plus className="h-4 w-4 mr-1" /> Add Article
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          {loadingArticles ? (
            <p className="text-xs text-muted-foreground text-center py-4">Loading...</p>
          ) : articles.map(a => (
            <div key={a.id} className="glass-card rounded-lg p-3 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground truncate">{a.title}</p>
                <p className="text-[10px] text-muted-foreground">{a.journal} · {a.year} · {a.category}</p>
              </div>
              <a href={a.url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}>
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </a>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteArticle.mutate(a.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default ExploreContentManager;
