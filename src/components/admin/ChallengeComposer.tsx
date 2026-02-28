import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Trophy } from "lucide-react";
import { toast } from "sonner";
import { useChallenges } from "@/hooks/useChallenges";

interface ChallengeComposerProps {
  onCreated?: () => void;
}

const ChallengeComposer = ({ onCreated }: ChallengeComposerProps) => {
  const { createChallenge } = useChallenges();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [requiredTag, setRequiredTag] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [prize, setPrize] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !requiredTag.trim() || !startDate || !endDate) {
      toast.error("Title, tag, start and end dates are required");
      return;
    }
    setSubmitting(true);
    const tag = requiredTag.startsWith("#") ? requiredTag : `#${requiredTag}`;
    const result = await createChallenge({
      title: title.trim(),
      description: description.trim(),
      required_tag: tag,
      start_date: new Date(startDate).toISOString(),
      end_date: new Date(endDate).toISOString(),
      prize_description: prize.trim() || undefined,
      status: "active",
    });
    setSubmitting(false);

    if (result?.error) {
      toast.error("Failed to create challenge");
    } else {
      toast.success("Challenge created!");
      setTitle("");
      setDescription("");
      setRequiredTag("");
      setStartDate("");
      setEndDate("");
      setPrize("");
      onCreated?.();
    }
  };

  return (
    <Card variant="glass">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <Trophy className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">New Challenge</h3>
        </div>

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
        </div>

        <Button onClick={handleSubmit} disabled={submitting} className="w-full" size="sm">
          {submitting ? "Creating..." : "Create Challenge"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ChallengeComposer;
