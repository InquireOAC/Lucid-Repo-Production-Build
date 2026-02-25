import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Plus, Trash2, BarChart3 } from "lucide-react";

const PollComposer = ({ onCreated }: { onCreated?: () => void }) => {
  const { user } = useAuth();
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addOption = () => {
    if (options.length < 6) setOptions([...options, ""]);
  };

  const removeOption = (idx: number) => {
    if (options.length > 2) setOptions(options.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !question.trim()) return;
    const validOptions = options.filter(o => o.trim());
    if (validOptions.length < 2) { toast.error("Need at least 2 options"); return; }

    setIsSubmitting(true);
    const { error } = await supabase.from("platform_announcements").insert({
      created_by: user.id,
      type: "poll",
      title: question.trim(),
      content: "Vote in this poll!",
      priority: "normal",
      metadata: { options: validOptions },
    });

    if (error) {
      toast.error("Failed to create poll");
    } else {
      toast.success("Poll published!");
      setQuestion(""); setOptions(["", ""]);
      onCreated?.();
    }
    setIsSubmitting(false);
  };

  return (
    <Card variant="glass">
      <CardHeader>
        <CardTitle className="text-lg">New Poll</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input placeholder="Poll question..." value={question} onChange={e => setQuestion(e.target.value)} required />
          <div className="space-y-2">
            {options.map((opt, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  placeholder={`Option ${i + 1}`}
                  value={opt}
                  onChange={e => {
                    const newOpts = [...options];
                    newOpts[i] = e.target.value;
                    setOptions(newOpts);
                  }}
                />
                {options.length > 2 && (
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeOption(i)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
            ))}
          </div>
          {options.length < 6 && (
            <Button type="button" variant="outline" size="sm" onClick={addOption}>
              <Plus className="h-4 w-4 mr-1" /> Add Option
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting} className="w-full">
            <BarChart3 className="h-4 w-4 mr-2" />
            {isSubmitting ? "Publishing..." : "Publish Poll"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default PollComposer;
