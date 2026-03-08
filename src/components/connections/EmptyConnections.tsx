import React from "react";
import { Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const EmptyConnections: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-6">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        <Link2 className="w-8 h-8 text-primary" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">No connections yet</h3>
      <p className="text-sm text-muted-foreground max-w-xs mb-6">
        Dream Connections finds moments when you and other dreamers experience similar dreams. Keep journaling — synchronicities reveal themselves over time.
      </p>
      <Button onClick={() => navigate("/journal/new")} variant="luminous" size="sm">
        Record a Dream
      </Button>
    </div>
  );
};

export default EmptyConnections;
