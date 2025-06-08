
import React from "react";
import { DreamEntry } from "@/types/dream";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Moon, Tag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

interface TherapyDreamListProps {
  dreams: DreamEntry[];
}

const TherapyDreamList = ({ dreams }: TherapyDreamListProps) => {
  const navigate = useNavigate();

  if (dreams.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Moon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No Dreams Found</h3>
        <p className="text-muted-foreground mb-4">
          Start by adding some dreams to your journal to explore them through therapy mode.
        </p>
        <Button onClick={() => navigate("/journal")}>Go to Journal</Button>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {dreams.map((dream) => (
        <Card key={dream.id} className="p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-medium mb-2">{dream.title}</h3>
              
              <p className="text-muted-foreground line-clamp-3 mb-4">
                {dream.content.substring(0, 200)}
                {dream.content.length > 200 && "..."}
              </p>

              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {formatDistanceToNow(new Date(dream.date), { addSuffix: true })}
                </div>
                
                {dream.mood && (
                  <div className="flex items-center gap-1">
                    <span>Mood: {dream.mood}</span>
                  </div>
                )}

                {dream.lucid && (
                  <div className="flex items-center gap-1">
                    <Moon className="h-4 w-4" />
                    <span>Lucid</span>
                  </div>
                )}
              </div>

              {dream.tags && dream.tags.length > 0 && (
                <div className="flex items-center gap-2 mb-4">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <div className="flex flex-wrap gap-1">
                    {dream.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-dream-purple/10 text-dream-purple rounded-full text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                    {dream.tags.length > 3 && (
                      <span className="text-xs text-muted-foreground">
                        +{dream.tags.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            <Button 
              onClick={() => navigate(`/therapy/${dream.id}`)}
              className="ml-4"
            >
              Analyze Dream
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default TherapyDreamList;
