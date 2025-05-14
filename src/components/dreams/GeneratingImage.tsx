
import React from "react";
import { Loader2 } from "lucide-react";

const GeneratingImage = () => {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <Loader2 className="h-8 w-8 animate-spin text-dream-purple" />
      <p className="mt-2 text-sm text-muted-foreground">
        Generating your dream image...
      </p>
    </div>
  );
};

export default GeneratingImage;
