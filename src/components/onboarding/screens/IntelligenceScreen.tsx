import { useEffect, useState } from "react";
import { FlowDiagram } from "../components";

const IntelligenceScreen = () => {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShow(true), 150);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className={`flex flex-col items-center justify-start md:justify-center min-h-[60vh] md:min-h-[70vh] px-4 md:px-6 py-4 md:py-8 transition-all duration-1000 ${
        show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}
    >
      <div className="text-center mb-6 md:mb-10">
        <h2 className="text-2xl md:text-4xl font-bold mb-2">How Dreams Become Insight</h2>
        <p className="text-sm md:text-base text-muted-foreground max-w-lg mx-auto">
          From the raw fragment of a dream to the pattern your waking mind couldn't see.
        </p>
      </div>
      <FlowDiagram />
    </div>
  );
};

export default IntelligenceScreen;