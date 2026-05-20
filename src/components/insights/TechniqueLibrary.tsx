import React from "react";
import { motion } from "framer-motion";
import TechniqueCard from "./TechniqueCard";
import { techniques } from "./techniqueData";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05, delayChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

const TechniqueLibrary: React.FC = () => {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3"
    >
      {techniques.map((tech, i) => (
        <motion.div key={i} variants={item}>
          <TechniqueCard technique={tech} index={i} />
        </motion.div>
      ))}
    </motion.div>
  );
};

export default TechniqueLibrary;
