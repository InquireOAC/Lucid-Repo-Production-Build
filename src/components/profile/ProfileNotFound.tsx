
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
const ProfileNotFound = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen dream-background flex items-center justify-center">
      <div className="text-center">
        <h3 className="text-xl font-medium mb-2">This user doesn’t exist or has a private profile.</h3>
        <p className="text-muted-foreground mb-2">They may have deleted or restricted their account.</p>
        <Button variant="outline" onClick={() => navigate("/")}>Go Home</Button>
      </div>
    </div>
  );
};
export default ProfileNotFound;
