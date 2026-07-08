import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { CalendarDays, Save, Send, X } from "lucide-react";
import { toast } from "sonner";
import { useEvents, type CommunityEvent } from "@/hooks/useEvents";
import AdminBannerUpload from "./AdminBannerUpload";

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

interface Props {
  onCreated?: () => void;
  editing?: CommunityEvent | null;
  onCancelEdit?: () => void;
}

const EventComposer: React.FC<Props> = ({ onCreated, editing, onCancelEdit }) => {
  const { createEvent, updateEvent } = useEvents({ adminView: true });
  const isEdit = !!editing?.id;

  const [title, setTitle] = useState(editing?.title || "");
  const [description, setDescription] = useState(editing?.description || "");
  const [bannerUrl, setBannerUrl] = useState<string | null>(editing?.banner_image_url || null);
  const [location, setLocation] = useState(editing?.location || "");
  const [linkUrl, setLinkUrl] = useState(editing?.link_url || "");
  const [ctaLabel, setCtaLabel] = useState(editing?.cta_label || "");
  const [startsAt, setStartsAt] = useState(toLocalInputValue(editing?.starts_at));
  const [endsAt, setEndsAt] = useState(toLocalInputValue(editing?.ends_at));
  const [tagsStr, setTagsStr] = useState(tagsToString(editing?.tags));
  const [notifyUsers, setNotifyUsers] = useState(editing?.notify_users ?? true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editing) {
      setTitle(editing.title || "");
      setDescription(editing.description || "");
      setBannerUrl(editing.banner_image_url || null);
      setLocation(editing.location || "");
      setLinkUrl(editing.link_url || "");
      setCtaLabel(editing.cta_label || "");
      setStartsAt(toLocalInputValue(editing.starts_at));
      setEndsAt(toLocalInputValue(editing.ends_at));
      setTagsStr(tagsToString(editing.tags));
      setNotifyUsers(editing.notify_users ?? true);
    }
  }, [editing]);

  const resetForm = () => {
    setTitle(""); setDescription(""); setBannerUrl(null); setLocation("");
    setLinkUrl(""); setCtaLabel(""); setStartsAt(""); setEndsAt("");
    setTagsStr(""); setNotifyUsers(true);
  };

  const submit = async (status: "draft" | "published") => {
    if (!title.trim() || !startsAt || !endsAt) {
      toast.error("Title and start/end times are required");
      return;
    }
    if (new Date(endsAt) <= new Date(startsAt)) {
      toast.error("End time must be after start time");
      return;
    }
    setSubmitting(true);
    const payload = {
      title: title.trim(),
      description: description.trim() || null,
      banner_image_url: bannerUrl,
      location: location.trim() || null,
      link_url: linkUrl.trim() || null,
      cta_label: ctaLabel.trim() || null,
      starts_at: new Date(startsAt).toISOString(),
      ends_at: new Date(endsAt).toISOString(),
      tags: stringToTags(tagsStr),
      notify_users: notifyUsers,
      status,
    };

    let result;
    if (isEdit && editing?.id) {
      result = await updateEvent(editing.id, payload);
    } else {
      result = await createEvent(payload);
    }
    setSubmitting(false);

    if (result?.error) {
      console.error(result.error);
      toast.error(`Failed to ${isEdit ? "update" : "create"} event`);
    } else {
      toast.success(
        isEdit
          ? "Event updated"
          : status === "published"
          ? "Event published"
          : "Draft saved",
      );
      if (!isEdit) resetForm();
      onCreated?.();
    }
  };

  return (
    <Card variant="glass">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">{isEdit ? "Edit Event" : "New Event"}</h3>
          </div>
          {isEdit && onCancelEdit && (
            <Button variant="ghost" size="sm" onClick={onCancelEdit} className="h-7 px-2">
              <X className="h-3 w-3 mr-1" /> Cancel
            </Button>
          )}
        </div>

        <AdminBannerUpload value={bannerUrl} onChange={setBannerUrl} kind="event" aspect="wide" />

        <div className="space-y-2">
          <div>
            <Label className="text-xs">Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Event name" />
          </div>
          <div>
            <Label className="text-xs">Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="What's happening?" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Starts at</Label>
              <Input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Ends at</Label>
              <Input type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Location</Label>
              <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Online · Discord · …" />
            </div>
            <div>
              <Label className="text-xs">Link URL (optional)</Label>
              <Input value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="https://..." />
            </div>
          </div>
          <div>
            <Label className="text-xs">CTA label (optional)</Label>
            <Input value={ctaLabel} onChange={(e) => setCtaLabel(e.target.value)} placeholder="Join Event" />
          </div>
          <div>
            <Label className="text-xs">Tags (comma-separated)</Label>
            <Input value={tagsStr} onChange={(e) => setTagsStr(e.target.value)} placeholder="workshop, lucid, live" />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-md border border-border/50 px-3 py-2">
          <div>
            <p className="text-xs font-medium">Notify all users</p>
            <p className="text-[10px] text-muted-foreground">Surface in carousel + Notifications feed.</p>
          </div>
          <Switch checked={notifyUsers} onCheckedChange={setNotifyUsers} />
        </div>

        <div className="flex gap-2">
          <Button type="button" variant="outline" disabled={submitting} onClick={() => submit("draft")} className="flex-1">
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          <Button type="button" disabled={submitting} onClick={() => submit("published")} className="flex-1">
            <Send className="h-4 w-4 mr-2" />
            {isEdit ? "Update & Publish" : "Publish & Notify"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EventComposer;
