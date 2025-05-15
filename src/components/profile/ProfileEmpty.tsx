
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
const ProfileEmpty = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen dream-background flex items-center justify-center">
      <div className="text-center">
        <h3 className="text-xl font-medium mb-2">This user hasn&apos;t set up their profile yet.</h3>
        <p className="text-muted-foreground mb-2">No public profile information available.</p>
        <Button variant="outline" onClick={() => navigate("/")}>Go Home</Button>
      </div>
    </div>
  );
};
export default ProfileEmpty;
