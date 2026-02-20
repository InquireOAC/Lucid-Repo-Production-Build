import React from "react";
import TechniqueCard from "./TechniqueCard";
import { techniques } from "./techniqueData";

const TechniqueLibrary: React.FC = () => {
  return (
    <div className="p-4 space-y-3">
      {techniques.map((tech, i) => (
        <TechniqueCard key={i} technique={tech} index={i} />
      ))}
    </div>
  );
};

export default TechniqueLibrary;
