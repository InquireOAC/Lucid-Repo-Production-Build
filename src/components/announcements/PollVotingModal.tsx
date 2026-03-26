import React, { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Check, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePollVotes } from "@/hooks/usePollVotes";
import type { Announcement } from "@/hooks/useAnnouncements";

interface PollVotingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  announcement: Announcement;
  onDismiss: () => void;
}

const PollVotingModal: React.FC<PollVotingModalProps> = ({ open, onOpenChange, announcement, onDismiss }) => {
  const options: string[] = (announcement.metadata as any)?.options ?? [];
  const { myVote, results, isLoading, isSubmitting, fetchData, submitVote } = usePollVotes(announcement.id);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    if (open) fetchData();
  }, [open, fetchData]);

  const totalVotes = results.reduce((s, r) => s + r.vote_count, 0);
  const hasVoted = myVote !== null;

  const handleVote = async () => {
    if (!selected) return;
    await submitVote(selected);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden border-primary/15 bg-background">
        {/* Header */}
        <div className="relative px-6 pt-8 pb-5 bg-gradient-to-b from-indigo-500/15 via-indigo-500/5 to-transparent">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
          <div className="relative space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-400/70 mb-1">Poll</p>
              <h2 className="text-xl font-bold text-foreground leading-tight">{announcement.title}</h2>
            </div>
            {announcement.content && (
              <p className="text-sm text-muted-foreground">{announcement.content}</p>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="px-6 pb-6 space-y-4">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-14 rounded-xl bg-muted/30 animate-pulse" />
              ))}
            </div>
          ) : hasVoted ? (
            /* Results view */
            <AnimatePresence mode="wait">
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                {options.map((option) => {
                  const r = results.find(r => r.selected_option === option);
                  const count = r?.vote_count ?? 0;
                  const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
                  const isMyVote = myVote === option;

                  return (
                    <div key={option} className="relative rounded-xl border border-border/50 overflow-hidden bg-muted/20 p-3.5">
                      <motion.div
                        className="absolute inset-y-0 left-0 bg-primary/10"
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
                      />
                      <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {isMyVote && (
                            <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                              <Check className="w-3 h-3 text-primary" />
                            </div>
                          )}
                          <span className={cn("text-sm font-medium", isMyVote && "text-primary")}>{option}</span>
                        </div>
                        <span className="text-xs text-muted-foreground font-mono">{pct}%</span>
                      </div>
                    </div>
                  );
                })}
                <div className="flex items-center justify-center gap-1.5 pt-1">
                  <BarChart3 className="w-3.5 h-3.5 text-muted-foreground/50" />
                  <span className="text-xs text-muted-foreground/50">{totalVotes} vote{totalVotes !== 1 ? 's' : ''}</span>
                </div>
              </motion.div>
            </AnimatePresence>
          ) : (
            /* Voting view */
            <div className="space-y-2.5">
              {options.map((option) => (
                <button
                  key={option}
                  onClick={() => setSelected(option)}
                  className={cn(
                    "w-full text-left rounded-xl border p-3.5 transition-all duration-200",
                    selected === option
                      ? "border-primary bg-primary/10 shadow-[0_0_12px_-4px_hsl(var(--primary)/0.3)]"
                      : "border-border/50 bg-muted/20 hover:border-border hover:bg-muted/30"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
                      selected === option ? "border-primary bg-primary" : "border-muted-foreground/30"
                    )}>
                      {selected === option && <Check className="w-3 h-3 text-primary-foreground" />}
                    </div>
                    <span className="text-sm font-medium text-foreground">{option}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="space-y-2.5 pt-1">
            {!hasVoted && !isLoading && (
              <Button
                size="sm"
                className="w-full"
                disabled={!selected || isSubmitting}
                onClick={handleVote}
              >
                {isSubmitting ? "Submitting…" : "Vote"}
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              className="w-full text-muted-foreground"
              onClick={() => {
                onOpenChange(false);
                onDismiss();
              }}
            >
              Dismiss
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PollVotingModal;
