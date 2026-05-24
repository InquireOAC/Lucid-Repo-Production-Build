import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Send, Save, X } from "lucide-react";
import AdminBannerUpload from "./AdminBannerUpload";

interface AnnouncementForm {
  id?: string;
  title?: string;
  content?: string;
  type?: string;
  priority?: string;
  link_url?: string | null;
  cta_label?: string | null;
  image_url?: string | null;
  tags?: string[] | null;
  starts_at?: string | null;
  expires_at?: string | null;
  notify_users?: boolean;
  status?: "draft" | "published" | "archived";
}

interface Props {
  onCreated?: () => void;
  editing?: AnnouncementForm | null;
  onCancelEdit?: () => void;
}

const toLocalInputValue = (iso: string | null | undefined): string => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const tagsToString = (tags: string[] | null | undefined) =>
  (tags || []).filter(Boolean).join(", ");

const stringToTags = (s: string): string[] =>
  s.split(",").map((t) => t.trim()).filter(Boolean);

const AnnouncementComposer: React.FC<Props> = ({ onCreated, editing, onCancelEdit }) => {
  const { user } = useAuth();
  const isEdit = !!editing?.id;

  const [title, setTitle] = useState(editing?.title || "");
  const [content, setContent] = useState(editing?.content || "");
  const [type, setType] = useState(editing?.type || "announcement");
  const [priority, setPriority] = useState(editing?.priority || "normal");
  const [linkUrl, setLinkUrl] = useState(editing?.link_url || "");
  const [ctaLabel, setCtaLabel] = useState(editing?.cta_label || "");
  const [imageUrl, setImageUrl] = useState<string | null>(editing?.image_url || null);
  const [tagsStr, setTagsStr] = useState(tagsToString(editing?.tags));
  const [startsAt, setStartsAt] = useState(toLocalInputValue(editing?.starts_at));
  const [expiresAt, setExpiresAt] = useState(toLocalInputValue(editing?.expires_at));
  const [notifyUsers, setNotifyUsers] = useState(editing?.notify_users ?? true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync state when the `editing` prop changes
  useEffect(() => {
    if (editing) {
      setTitle(editing.title || "");
      setContent(editing.content || "");
      setType(editing.type || "announcement");
      setPriority(editing.priority || "normal");
      setLinkUrl(editing.link_url || "");
      setCtaLabel(editing.cta_label || "");
      setImageUrl(editing.image_url || null);
      setTagsStr(tagsToString(editing.tags));
      setStartsAt(toLocalInputValue(editing.starts_at));
      setExpiresAt(toLocalInputValue(editing.expires_at));
      setNotifyUsers(editing.notify_users ?? true);
    }
  }, [editing]);

  const resetForm = () => {
    setTitle(""); setContent(""); setLinkUrl(""); setCtaLabel("");
    setImageUrl(null); setTagsStr("");
    setStartsAt(""); setExpiresAt("");
    setNotifyUsers(true);
  };

  const submit = async (status: "draft" | "published") => {
    if (!user || !title.trim() || !content.trim()) {
      toast.error("Title and content are required");
      return;
    }
    setIsSubmitting(true);

    const payload: any = {
      title: title.trim(),
      content: content.trim(),
      type,
      priority,
      link_url: linkUrl.trim() || null,
      cta_label: ctaLabel.trim() || null,
      image_url: imageUrl,
      tags: stringToTags(tagsStr),
      notify_users: notifyUsers,
      status,
      is_active: status === "published",
    };
    if (startsAt) payload.starts_at = new Date(startsAt).toISOString();
    if (expiresAt) payload.expires_at = new Date(expiresAt).toISOString();

    let error;
    if (isEdit && editing?.id) {
      ({ error } = await supabase.from("platform_announcements").update(payload).eq("id", editing.id));
    } else {
      payload.created_by = user.id;
      ({ error } = await supabase.from("platform_announcements").insert(payload));
    }

    if (error) {
      console.error(error);
      toast.error(`Failed to ${isEdit ? "update" : "create"} announcement`);
    } else {
      toast.success(
        isEdit
          ? "Announcement updated"
          : status === "published"
          ? "Announcement published"
          : "Draft saved",
      );
      if (!isEdit) resetForm();
      onCreated?.();
    }
    setIsSubmitting(false);
  };

  return (
    <Card variant="glass">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">
            {isEdit ? "Edit Announcement" : "New Announcement"}
          </h3>
          {isEdit && onCancelEdit && (
            <Button variant="ghost" size="sm" onClick={onCancelEdit} className="h-7 px-2">
              <X className="h-3 w-3 mr-1" /> Cancel
            </Button>
          )}
        </div>

        <AdminBannerUpload value={imageUrl} onChange={setImageUrl} kind="announcement" aspect="wide" />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="announcement">📢 Announcement</SelectItem>
                <SelectItem value="reminder">🔔 Reminder</SelectItem>
                <SelectItem value="celebration">🎉 Celebration</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Priority</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label className="text-xs">Title</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
        </div>

        <div>
          <Label className="text-xs">Content</Label>
          <Textarea value={content} onChange={(e) => setContent(e.target.value)} rows={3} placeholder="What do you want to tell everyone?" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Link URL (optional)</Label>
            <Input value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="https://..." />
          </div>
          <div>
            <Label className="text-xs">CTA label (optional)</Label>
            <Input value={ctaLabel} onChange={(e) => setCtaLabel(e.target.value)} placeholder="Learn more" />
          </div>
        </div>

        <div>
          <Label className="text-xs">Tags (comma-separated)</Label>
          <Input value={tagsStr} onChange={(e) => setTagsStr(e.target.value)} placeholder="winter, update, new-feature" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Starts at</Label>
            <Input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs">Expires at</Label>
            <Input type="datetime-local" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-md border border-border/50 px-3 py-2">
          <div>
            <p className="text-xs font-medium">Notify all users</p>
            <p className="text-[10px] text-muted-foreground">Surface in carousel + banner + Notifications feed.</p>
          </div>
          <Switch checked={notifyUsers} onCheckedChange={setNotifyUsers} />
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={() => submit("draft")}
            className="flex-1"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          <Button
            type="button"
            disabled={isSubmitting}
            onClick={() => submit("published")}
            className="flex-1"
          >
            <Send className="h-4 w-4 mr-2" />
            {isEdit ? "Update & Publish" : "Publish & Notify"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AnnouncementComposer;
