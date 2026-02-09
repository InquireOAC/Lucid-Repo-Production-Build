import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Award, Star, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AchievementNotificationProps {
  achievement: {
    id: string;
    title: string;
    emoji: string;
    xp: number;
  } | null;
  onClose: () => void;
}

export const AchievementNotification: React.FC<AchievementNotificationProps> = ({
  achievement,
  onClose,
}) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (achievement) {
      setShow(true);
      // Auto-close after 5 seconds
      const timer = setTimeout(() => {
        setShow(false);
        setTimeout(onClose, 300); // Wait for animation
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [achievement, onClose]);

  return (
    <AnimatePresence>
      {show && achievement && (
        <motion.div
          initial={{ opacity: 0, y: -100, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -100, scale: 0.8 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4"
        >
          <Card className="glass-card border-2 border-primary bg-gradient-to-br from-primary/20 to-purple-500/20 shadow-2xl">
            <CardContent className="pt-6 pb-6 relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2"
                onClick={() => {
                  setShow(false);
                  setTimeout(onClose, 300);
                }}
              >
                <X className="w-4 h-4" />
              </Button>

              <div className="flex items-start gap-4">
                <div className="relative">
                  <Award className="w-16 h-16 text-primary" />
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute -top-1 -right-1"
                  >
                    <Star className="w-6 h-6 text-yellow-500" />
                  </motion.div>
                </div>

                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-1">
                    Achievement Unlocked!
                  </h3>
                  <p className="text-2xl font-bold gradient-text mb-2">
                    {achievement.emoji} {achievement.title}
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="px-3 py-1 rounded-full bg-primary/30 text-primary font-semibold">
                      +{achievement.xp} XP
                    </div>
                  </div>
                </div>
              </div>

              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 5, ease: "linear" }}
                className="absolute bottom-0 left-0 h-1 bg-primary"
              />
            </CardContent>
          </Card>

          {/* Confetti-like particles */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  opacity: 1,
                  x: "50%",
                  y: "50%",
                }}
                animate={{
                  opacity: 0,
                  x: `${50 + (Math.random() - 0.5) * 200}%`,
                  y: `${50 + (Math.random() - 0.5) * 200}%`,
                }}
                transition={{
                  duration: 1.5,
                  delay: i * 0.05,
                }}
                className="absolute text-2xl"
              >
                {["⭐", "✨", "🎉", "🏆", "💫"][Math.floor(Math.random() * 5)]}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
