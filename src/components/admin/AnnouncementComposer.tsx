import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Send } from "lucide-react";

const AnnouncementComposer = ({ onCreated }: { onCreated?: () => void }) => {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState("announcement");
  const [priority, setPriority] = useState("normal");
  const [linkUrl, setLinkUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !title.trim() || !content.trim()) return;

    setIsSubmitting(true);
    const { error } = await supabase.from("platform_announcements").insert({
      created_by: user.id,
      type,
      title: title.trim(),
      content: content.trim(),
      link_url: linkUrl.trim() || null,
      priority,
    });

    if (error) {
      toast.error("Failed to create announcement");
    } else {
      toast.success("Announcement pushed to all users!");
      setTitle(""); setContent(""); setLinkUrl("");
      onCreated?.();
    }
    setIsSubmitting(false);
  };

  return (
    <Card variant="glass">
      <CardHeader>
        <CardTitle className="text-lg">New Announcement</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Select value={type} onValueChange={setType}>
              <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="announcement">📢 Announcement</SelectItem>
                <SelectItem value="reminder">🔔 Reminder</SelectItem>
                <SelectItem value="celebration">🎉 Celebration</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger><SelectValue placeholder="Priority" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} required />
          <Textarea placeholder="Message content..." value={content} onChange={e => setContent(e.target.value)} required rows={3} />
          <Input placeholder="Link URL (optional)" value={linkUrl} onChange={e => setLinkUrl(e.target.value)} />
          <Button type="submit" disabled={isSubmitting} className="w-full">
            <Send className="h-4 w-4 mr-2" />
            {isSubmitting ? "Pushing..." : "Push Announcement"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AnnouncementComposer;
