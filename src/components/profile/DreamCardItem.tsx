
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Moon } from "lucide-react";
import SymbolAvatar from "./SymbolAvatar";

interface DreamCardItemProps {
  dream: any;
  isLiked?: boolean;
  onClick: () => void;
}

const DreamCardItem: React.FC<DreamCardItemProps> = ({
  dream,
  isLiked = false,
  onClick,
}) => (
  <Card 
    key={dream.id} 
    className="overflow-hidden cursor-pointer hover:shadow-md transition-all relative"
    onClick={onClick}
  >
    <CardContent className="p-0">
      {dream.generatedImage ? (
        <div className="relative">
          <img 
            src={dream.generatedImage} 
            alt={dream.title}
            className="aspect-square object-cover w-full"
          />
        </div>
      ) : (
        <div className="aspect-square flex items-center justify-center bg-dream-purple/10 relative">
          <Moon size={32} className="text-dream-purple opacity-50" />
        </div>
      )}
      <div className="p-2">
        <p className="text-sm font-semibold truncate">{dream.title}</p>
        <div className="flex items-center justify-between mt-1">
          {isLiked ? (
            <div className="flex items-center gap-1">
              <SymbolAvatar
                symbol={dream.profiles?.avatar_symbol}
                color={dream.profiles?.avatar_color}
                fallbackLetter={
                  (
                    dream.profiles?.display_name?.[0] ||
                    dream.profiles?.username?.[0] ||
                    "U"
                  ).toUpperCase()
                }
                size={16}
                className="h-4 w-4"
              />
              <span className="text-xs text-muted-foreground truncate max-w-[70px]">
                {dream.profiles?.display_name || dream.profiles?.username || "User"}
              </span>
            </div>
          ) : (
            <Badge variant="outline" className="text-xs">
              {new Date(dream.created_at).toLocaleDateString()}
            </Badge>
          )}
          {isLiked && (
            <Badge variant="outline" className="text-xs">
              {new Date(dream.created_at).toLocaleDateString()}
            </Badge>
          )}
        </div>
      </div>
    </CardContent>
  </Card>
);

export default DreamCardItem;
