import React, { useState } from "react";
import { Moon, Heart, BookOpen, Plus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import DreamGrid from "./DreamGrid";
import { useDreamSeries, DreamSeries } from "@/hooks/useDreamSeries";
import CreateSeriesDialog from "@/components/series/CreateSeriesDialog";
import SeriesDetailPage from "@/components/series/SeriesDetailPage";

interface ProfileTabsProps {
  publicDreams: any[];
  likedDreams: any[];
  isOwnProfile: boolean;
  refreshDreams?: () => void;
  userId?: string;
}

const ProfileTabs = ({ publicDreams, likedDreams, isOwnProfile, refreshDreams, userId }: ProfileTabsProps) => {
  const { series, isLoading: seriesLoading, createSeries, updateSeries, deleteSeries } = useDreamSeries(userId);
  const [createOpen, setCreateOpen] = useState(false);
  const [editSeries, setEditSeries] = useState<DreamSeries | null>(null);
  const [viewSeries, setViewSeries] = useState<DreamSeries | null>(null);

  return (
    <>
      <Tabs defaultValue="dreams" className="mt-4">
        <TabsList className="w-full justify-start border-b border-primary/10 bg-transparent rounded-none p-0 h-auto">
          <TabsTrigger 
            value="dreams"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
          >
            Dreams
          </TabsTrigger>
          <TabsTrigger 
            value="series"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
          >
            Series
          </TabsTrigger>
          <TabsTrigger 
            value="likes"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
          >
            Likes
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="dreams" className="mt-4">
          <DreamGrid 
            dreams={publicDreams}
            isOwnProfile={isOwnProfile}
            emptyTitle="No public dreams yet"
            emptyMessage={{
              own: "Share your dreams to the Lucid Repo to see them here",
              other: "This user hasn't shared any dreams yet"
            }}
            emptyIcon={<Moon size={32} className="mx-auto mb-2 text-muted-foreground" />}
            actionLink="/"
            actionText="Go to Journal"
            refreshDreams={refreshDreams}
          />
        </TabsContent>

        <TabsContent value="series" className="mt-4">
          {isOwnProfile && (
            <div className="mb-4">
              <Button onClick={() => setCreateOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Series
              </Button>
            </div>
          )}

          {seriesLoading ? (
            <p className="text-center text-muted-foreground py-8">Loading series...</p>
          ) : series.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen size={32} className="mx-auto mb-2 text-muted-foreground" />
              <p className="text-muted-foreground">
                {isOwnProfile ? "Create your first dream series" : "No series yet"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {series.map(s => (
                <div
                  key={s.id}
                  className="cursor-pointer group rounded-xl overflow-hidden border border-border/20 hover:border-primary/30 transition-all"
                  onClick={() => setViewSeries(s)}
                >
                  <div className="aspect-[2/3] relative">
                    {s.cover_image_url ? (
                      <img src={s.cover_image_url} alt={s.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                        <BookOpen className="h-10 w-10 text-primary/40" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <h3 className="text-sm font-semibold text-white line-clamp-2">{s.title}</h3>
                      <div className="flex items-center gap-2 text-white/70 mt-1 text-xs">
                        <span>{s.chapter_count} ch.</span>
                        <span className="capitalize">{s.status}</span>
                        {!s.is_public && <span className="text-yellow-400">Draft</span>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="likes" className="mt-4">
          <DreamGrid 
            dreams={likedDreams}
            isLiked={true}
            isOwnProfile={isOwnProfile}
            emptyTitle="No liked dreams yet"
            emptyMessage={{
              own: "Explore the Lucid Repo to discover and like dreams",
              other: "This user hasn't liked any dreams yet"
            }}
            emptyIcon={<Heart size={32} className="mx-auto mb-2 text-muted-foreground" />}
            actionLink="/lucid-repo"
            actionText="Explore Dreams"
            refreshDreams={refreshDreams}
          />
        </TabsContent>
      </Tabs>

      <CreateSeriesDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={createSeries}
      />

      {editSeries && (
        <CreateSeriesDialog
          open={!!editSeries}
          onOpenChange={(o) => { if (!o) setEditSeries(null); }}
          onSubmit={createSeries}
          editSeries={editSeries}
          onUpdate={updateSeries}
        />
      )}

      {viewSeries && (
        <SeriesDetailPage
          series={viewSeries}
          open={!!viewSeries}
          onClose={() => setViewSeries(null)}
          isOwner={isOwnProfile}
        />
      )}
    </>
  );
};

export default ProfileTabs;
