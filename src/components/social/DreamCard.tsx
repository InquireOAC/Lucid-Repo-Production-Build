
import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SocialDream } from "@/types/social";
import { Avatar, AvatarImage } from "@/components/ui/avatar";

export default function DreamCard({
  dream,
  onLike,
  onComment,
  liked,
  likeCount,
  commentCount,
  onCardClick,
}) {
  return (
    <Card className="mb-3" onClick={onCardClick}>
      <CardHeader className="flex flex-row items-center gap-2">
        <Avatar className="h-8 w-8">
          <AvatarImage src={dream.profiles?.profile_picture} />
        </Avatar>
        <div>
          <div className="font-semibold">{dream.profiles?.username || "User"}</div>
          <div className="text-xs text-muted-foreground">{new Date(dream.created_at).toLocaleDateString()}</div>
        </div>
      </CardHeader>
      <CardContent>
        <h4 className="font-bold">{dream.title}</h4>
        <p className="text-xs text-muted-foreground mb-2">{dream.content?.slice(0, 80) + (dream.content?.length > 80 ? "..." : "")}</p>
        {dream.image_url && (
          <img src={dream.image_url} alt="Dream visual" className="rounded w-full mb-2" />
        )}
        <div className="flex gap-3 text-sm my-1">
          <button onClick={e => { e.stopPropagation(); onLike?.(); }}>
            ❤️ {likeCount}
          </button>
          <button onClick={e => { e.stopPropagation(); onComment?.(); }}>
            💬 {commentCount}
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
