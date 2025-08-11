import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Share, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Dream {
  id: string;
  title: string;
  content: string;
  date: string;
  tags: string[];
  mood?: string;
  is_public: boolean;
}

interface DreamShareSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDream: (dreamId: string) => void;
}

const DreamShareSelector = ({ isOpen, onClose, onSelectDream }: DreamShareSelectorProps) => {
  const { user } = useAuth();
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      fetchUserDreams();
    }
  }, [isOpen, user]);

  const fetchUserDreams = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("dream_entries")
        .select("id, title, content, date, tags, mood, is_public")
        .eq("user_id", user.id)
        .order("date", { ascending: false });

      if (error) throw error;
      setDreams(data || []);
    } catch (error) {
      console.error("Error fetching dreams:", error);
      toast.error("Failed to load dreams");
    } finally {
      setLoading(false);
    }
  };

  const filteredDreams = dreams.filter(dream =>
    dream.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dream.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dream.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSelectDream = (dreamId: string) => {
    onSelectDream(dreamId);
    onClose();
    setSearchTerm("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl glass-card border-white/20 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="gradient-text text-xl font-semibold flex items-center gap-2">
            <Share className="h-5 w-5" />
            Share a Dream
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
            <Input
              placeholder="Search your dreams..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/5 border-white/20 text-white/90 placeholder:text-white/50 focus:border-white/40"
            />
          </div>

          {/* Dreams List */}
          <ScrollArea className="h-96">
            <div className="space-y-3">
              {loading ? (
                <div className="text-center py-8 text-white/70">Loading dreams...</div>
              ) : filteredDreams.length === 0 ? (
                <div className="text-center py-8">
                  <div className="glass-card rounded-xl p-6 border-white/10">
                    <h3 className="font-semibold mb-2 text-white/90">No dreams found</h3>
                    <p className="text-sm text-white/70">
                      {searchTerm ? "Try a different search term" : "Start journaling to share your dreams"}
                    </p>
                  </div>
                </div>
              ) : (
                filteredDreams.map((dream) => (
                  <div
                    key={dream.id}
                    onClick={() => handleSelectDream(dream.id)}
                    className="glass-card rounded-xl p-4 cursor-pointer border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/10"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium text-white/90 truncate">
                            {dream.title}
                          </h3>
                          {!dream.is_public && (
                            <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-1 rounded-full">
                              Private
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-white/70 line-clamp-2 mb-2">
                          {dream.content}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-white/50">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(dream.date).toLocaleDateString()}
                          </div>
                          {dream.mood && (
                            <span className="capitalize">{dream.mood}</span>
                          )}
                        </div>
                        {dream.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {dream.tags.slice(0, 3).map((tag, index) => (
                              <span
                                key={index}
                                className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                            {dream.tags.length > 3 && (
                              <span className="text-xs text-white/50">
                                +{dream.tags.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="hover:bg-white/10 text-white/70"
                      >
                        Share
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DreamShareSelector;