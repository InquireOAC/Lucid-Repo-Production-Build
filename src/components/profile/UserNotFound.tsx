
import React from "react";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const UserNotFound = () => {
  const navigate = useNavigate();
  
  const handleGoBack = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen dream-background flex items-center justify-center safe-area-inset-top">
      <div className="text-center px-4">
        <User size={48} className="mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-xl font-medium mb-2">User not found</h3>
        <Button variant="outline" onClick={handleGoBack}>
          Go back home
        </Button>
      </div>
    </div>
  );
};

export default UserNotFound;
