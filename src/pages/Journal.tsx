import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Pencil, Book, Moon, Calendar, Globe, Lock } from "lucide-react";
import { format } from "date-fns";
import { useDreamStore } from "@/store/dreamStore";
import DreamCard from "@/components/DreamCard";
import DreamEntryForm from "@/components/DreamEntryForm";
import DreamDetail from "@/components/DreamDetail";
import { DreamEntry } from "@/types/dream";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

const inspirationalDreamQuotes = [
  "Dreams are illustrations from the book your soul is writing about you.",
  "Dreams are the touchstones of our character.",
  "All that we see or seem is but a dream within a dream.",
  "Dreams are today's answers to tomorrow's questions.",
  "The future belongs to those who believe in the beauty of their dreams.",
  "A dream you dream alone is only a dream. A dream you dream together is reality.",
  "All our dreams can come true, if we have the courage to pursue them.",
  "Dreams are the seedlings of realities.",
  "The best way to make your dreams come true is to wake up.",
  "Within your dreams lies a world of infinite possibilities.",
  "Dreams reflect the soul's deepest desires and fears.",
  "When you cease to dream, you cease to live.",
  "Dream big and dare to fail.",
  "In dreams, we enter a world that is entirely our own.",
  "Your dreams are the whispers of your soul."
];

const Journal = () => {
  const { entries, tags, addEntry, updateEntry, deleteEntry } = useDreamStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddingDream, setIsAddingDream] = useState(false);
  const [selectedDream, setSelectedDream] = useState<DreamEntry | null>(null);
  const [dailyQuote, setDailyQuote] = useState("");
  const { user } = useAuth();
  
  // Set daily quote based on the date
  useEffect(() => {
    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 0);
    const diff = Number(today) - Number(startOfYear);
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
    const quoteIndex = dayOfYear % inspirationalDreamQuotes.length;
    setDailyQuote(inspirationalDreamQuotes[quoteIndex]);
  }, []);
  
  // When the user is logged in, sync their dreams from the database
  useEffect(() => {
    if (user) {
      syncDreamsFromDb();
    }
  }, [user]);
  
  const syncDreamsFromDb = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("dream_entries")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      
      // Convert the database dreams to the local format and merge
      if (data && data.length > 0) {
        const formattedDreams = data.map((dream: any) => ({
          id: dream.id,
          date: dream.date,
          title: dream.title,
          content: dream.content,
          tags: dream.tags || [],
          mood: dream.mood,
          lucid: dream.lucid || false,
          imagePrompt: dream.imagePrompt,
          generatedImage: dream.generatedImage,
          analysis: dream.analysis,
          is_public: dream.is_public || false,
          isPublic: dream.is_public || false, // Map is_public to isPublic
          like_count: dream.like_count || 0,
          likeCount: dream.like_count || 0,
          comment_count: dream.comment_count || 0,
          commentCount: dream.comment_count || 0
        }));
        
        // We'll sync them if the local store doesn't have them yet
        // In a real application, you would implement a proper sync strategy
      }
    } catch (error) {
      console.error("Error syncing dreams from database:", error);
    }
  };
  
  const handleAddDream = async (dreamData: {
    title: string;
    content: string;
    tags: string[];
    lucid: boolean;
    mood: string;
  }) => {
    setIsSubmitting(true);
    
    try {
      // First add to local store
      const newDream = addEntry({
        ...dreamData,
        date: new Date().toISOString(),
      });
      
      // If user is logged in, also save to database
      if (user) {
        const { error } = await supabase
          .from("dream_entries")
          .insert({
            id: newDream.id,
            user_id: user.id,
            title: newDream.title,
            content: newDream.content,
            tags: newDream.tags,
            mood: newDream.mood,
            lucid: newDream.lucid,
            date: newDream.date,
            is_public: false // Use is_public in database
          });
        
        if (error) throw error;
      }
      
      setIsAddingDream(false);
      toast.success("Dream saved successfully!");
    } catch (error) {
      console.error("Error adding dream:", error);
      toast.error("Failed to save dream");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleUpdateDream = async (id: string, updates: Partial<DreamEntry>) => {
    try {
      // Update local store
      updateEntry(id, updates);
      
      // If user is logged in, also update in database
      if (user) {
        // Convert the updates to database format
        const dbUpdates: any = { ...updates };
        
        // Remove isPublic from database updates and use is_public instead
        if ('isPublic' in dbUpdates) {
          dbUpdates.is_public = dbUpdates.isPublic;
          delete dbUpdates.isPublic;
        }
        
        const { error } = await supabase
          .from("dream_entries")
          .update(dbUpdates)
          .eq("id", id)
          .eq("user_id", user.id);
        
        if (error) throw error;
      }
      
      if (updates.is_public || updates.isPublic) {
        toast.success("Dream shared to Lucid Repo!");
      }
    } catch (error) {
      console.error("Error updating dream:", error);
      toast.error("Failed to update dream");
    }
  };
  
  const handleDeleteDream = async (id: string) => {
    try {
      // Delete from local store
      deleteEntry(id);
      
      // If user is logged in, also delete from database
      if (user) {
        const { error } = await supabase
          .from("dream_entries")
          .delete()
          .eq("id", id)
          .eq("user_id", user.id);
        
        if (error) throw error;
      }
      
      setSelectedDream(null);
      toast.success("Dream deleted successfully");
    } catch (error) {
      console.error("Error deleting dream:", error);
      toast.error("Failed to delete dream");
    }
  };

  return (
    <div className="min-h-screen dream-background p-4 md:p-6">
      <header className="mb-6">
        <h1 className="text-3xl md:text-4xl font-bold gradient-text flex items-center gap-2">
          <Moon className="animate-float" />
          <span className="italic">{dailyQuote}</span>
        </h1>
      </header>

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Calendar size={16} />
          <span className="text-sm text-muted-foreground">
            {format(new Date(), "EEEE, MMMM d, yyyy")}
          </span>
        </div>
        <Button 
          onClick={() => setIsAddingDream(true)}
          className="bg-gradient-to-r from-dream-lavender to-dream-purple hover:opacity-90 flex items-center gap-2"
        >
          <Pencil size={16} />
          <span>Record Dream</span>
        </Button>
      </div>

      <Tabs defaultValue="all" className="mb-6">
        <TabsList className="grid w-full md:w-[400px] grid-cols-2">
          <TabsTrigger value="all" className="text-sm">
            All Dreams
          </TabsTrigger>
          <TabsTrigger value="recent" className="text-sm">
            Recent Dreams
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          {entries.length === 0 ? (
            <div className="text-center py-12">
              <Book size={32} className="mx-auto mb-2 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-1">Your dream journal is empty</h3>
              <p className="text-muted-foreground">
                Record your first dream to get started
              </p>
              <Button 
                onClick={() => setIsAddingDream(true)}
                variant="outline"
                className="mt-4 border-dream-lavender text-dream-lavender hover:bg-dream-lavender/10"
              >
                Record Dream
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {entries.map((dream) => (
                <div key={dream.id} className="relative">
                  {(dream.is_public || dream.isPublic) && (
                    <div className="absolute top-2 right-2 z-10">
                      <Badge className="bg-dream-purple text-white flex items-center gap-1">
                        <Globe size={12} /> Shared
                      </Badge>
                    </div>
                  )}
                  <DreamCard
                    dream={dream}
                    tags={tags}
                    onClick={() => setSelectedDream(dream)}
                  />
                </div>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="recent">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {entries
              .slice(0, 6)
              .map((dream) => (
                <div key={dream.id} className="relative">
                  {(dream.is_public || dream.isPublic) && (
                    <div className="absolute top-2 right-2 z-10">
                      <Badge className="bg-dream-purple text-white flex items-center gap-1">
                        <Globe size={12} /> Shared
                      </Badge>
                    </div>
                  )}
                  <DreamCard
                    key={dream.id}
                    dream={dream}
                    tags={tags}
                    onClick={() => setSelectedDream(dream)}
                  />
                </div>
              ))}
            {entries.length === 0 && (
              <div className="text-center py-12 col-span-3">
                <p className="text-muted-foreground">
                  No recent dreams yet
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Dream Dialog */}
      <Dialog open={isAddingDream} onOpenChange={setIsAddingDream}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="gradient-text">Record New Dream</DialogTitle>
          </DialogHeader>
          <DreamEntryForm
            onSubmit={handleAddDream}
            tags={tags}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>

      {/* Dream Detail Dialog */}
      {selectedDream && (
        <DreamDetail
          dream={selectedDream}
          tags={tags}
          onClose={() => setSelectedDream(null)}
          onUpdate={handleUpdateDream}
          onDelete={handleDeleteDream}
          isAuthenticated={!!user}
        />
      )}
    </div>
  );
};

export default Journal;