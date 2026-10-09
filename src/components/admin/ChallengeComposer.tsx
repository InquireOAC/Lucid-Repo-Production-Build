import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Trophy, Save, Send, X } from "lucide-react";
import { toast } from "sonner";
import { useChallenges, type Challenge } from "@/hooks/useChallenges";
import AdminBannerUpload from "./AdminBannerUpload";

const toLocalDateValue = (iso: string | null | undefined): string => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const tagsToString = (tags: string[] | null | undefined) =>
  (tags || []).filter(Boolean).join(", ");

const stringToTags = (s: string): string[] =>
  s.split(",").map((t) => t.trim()).filter(Boolean);

interface Props {
  onCreated?: () => void;
  editing?: Challenge | null;
  onCancelEdit?: () => void;
}

const ChallengeComposer: React.FC<Props> = ({ onCreated, editing, onCancelEdit }) => {
  const { createChallenge, updateChallenge } = useChallenges();
  const isEdit = !!editing?.id;

  const [title, setTitle] = useState(editing?.title || "");
  const [description, setDescription] = useState(editing?.description || "");
  const [requiredTag, setRequiredTag] = useState(editing?.required_tag || "");
  const [startDate, setStartDate] = useState(toLocalDateValue(editing?.start_date));
  const [endDate, setEndDate] = useState(toLocalDateValue(editing?.end_date));
  const [prize, setPrize] = useState(editing?.prize_description || "");
  const [bannerUrl, setBannerUrl] = useState<string | null>(editing?.banner_image_url || null);
  const [tagsStr, setTagsStr] = useState(tagsToString(editing?.tags));
  const [ctaLabel, setCtaLabel] = useState(editing?.cta_label || "");
  const [notifyUsers, setNotifyUsers] = useState(editing?.notify_users ?? true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editing) {
      setTitle(editing.title || "");
      setDescription(editing.description || "");
      setRequiredTag(editing.required_tag || "");
      setStartDate(toLocalDateValue(editing.start_date));
      setEndDate(toLocalDateValue(editing.end_date));
      setPrize(editing.prize_description || "");
      setBannerUrl(editing.banner_image_url || null);
      setTagsStr(tagsToString(editing.tags));
      setCtaLabel(editing.cta_label || "");
      setNotifyUsers(editing.notify_users ?? true);
    }
  }, [editing]);

  const resetForm = () => {
    setTitle(""); setDescription(""); setRequiredTag(""); setStartDate(""); setEndDate("");
    setPrize(""); setBannerUrl(null); setTagsStr(""); setCtaLabel("");
    setNotifyUsers(true);
  };

  const submit = async (status: "draft" | "active") => {
    if (!title.trim() || !requiredTag.trim() || !startDate || !endDate) {
      toast.error("Title, tag, start and end dates are required");
      return;
    }
    setSubmitting(true);
    const tag = requiredTag.startsWith("#") ? requiredTag : `#${requiredTag}`;
    const payload = {
      title: title.trim(),
      description: description.trim(),
      required_tag: tag,
      start_date: new Date(startDate).toISOString(),
      end_date: new Date(endDate).toISOString(),
      prize_description: prize.trim() || null,
      banner_image_url: bannerUrl,
      tags: stringToTags(tagsStr),
      cta_label: ctaLabel.trim() || null,
      notify_users: notifyUsers,
      status,
    };

    let result;
    if (isEdit && editing?.id) {
      result = await updateChallenge(editing.id, payload);
    } else {
      result = await createChallenge(payload as any);
    }
    setSubmitting(false);

    if (result?.error) {
      toast.error(`Failed to ${isEdit ? "update" : "create"} challenge`);
    } else {
      toast.success(
        isEdit
          ? "Challenge updated"
          : status === "active"
          ? "Challenge published"
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
            <Trophy className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">{isEdit ? "Edit Challenge" : "New Challenge"}</h3>
          </div>
          {isEdit && onCancelEdit && (
            <Button variant="ghost" size="sm" onClick={onCancelEdit} className="h-7 px-2">
              <X className="h-3 w-3 mr-1" /> Cancel
            </Button>
          )}
        </div>

        <AdminBannerUpload value={bannerUrl} onChange={setBannerUrl} kind="challenge" aspect="wide" />

        <div className="space-y-2">
          <div>
            <Label className="text-xs">Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Dream Challenge Name" />
          </div>
          <div>
            <Label className="text-xs">Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the challenge..." rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Required Tag</Label>
              <Input value={requiredTag} onChange={(e) => setRequiredTag(e.target.value)} placeholder="#Dreamer" />
            </div>
            <div>
              <Label className="text-xs">Prize (optional)</Label>
              <Input value={prize} onChange={(e) => setPrize(e.target.value)} placeholder="Featured on homepage" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Start Date</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">End Date</Label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>
          <div>
            <Label className="text-xs">Categories / tags (comma-separated)</Label>
            <Input value={tagsStr} onChange={(e) => setTagsStr(e.target.value)} placeholder="weekly, beginner" />
          </div>
          <div>
            <Label className="text-xs">CTA label (optional)</Label>
            <Input value={ctaLabel} onChange={(e) => setCtaLabel(e.target.value)} placeholder="Join Challenge" />
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
          <Button type="button" disabled={submitting} onClick={() => submit("active")} className="flex-1">
            <Send className="h-4 w-4 mr-2" />
            {isEdit ? "Update & Publish" : "Publish & Notify"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChallengeComposer;
