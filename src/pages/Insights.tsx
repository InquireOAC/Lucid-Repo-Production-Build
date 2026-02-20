import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SymbolTracker from "@/components/insights/SymbolTracker";
import TechniqueLibrary from "@/components/insights/TechniqueLibrary";
import { Sparkles } from "lucide-react";

const Insights: React.FC = () => {
  return (
    <div className="min-h-screen pt-safe-top">
      <div className="p-4 pb-2 flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-primary" />
        <h1 className="text-xl font-bold">Insights</h1>
      </div>

      <Tabs defaultValue="symbols" className="px-4">
        <TabsList className="w-full">
          <TabsTrigger value="symbols" className="flex-1">Symbols</TabsTrigger>
          <TabsTrigger value="techniques" className="flex-1">Techniques</TabsTrigger>
        </TabsList>
        <TabsContent value="symbols">
          <SymbolTracker />
        </TabsContent>
        <TabsContent value="techniques">
          <TechniqueLibrary />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Insights;
