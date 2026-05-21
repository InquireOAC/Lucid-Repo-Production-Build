import logoImage from "@/assets/LogoForFramer.png";

interface LucidSigilProps {
  size?: "sm" | "md" | "lg";
  animate?: "breathe" | "unlock" | "none";
  className?: string;
}

const sizeMap = {
  sm: "w-16 h-16",
  md: "w-24 h-24",
  lg: "w-32 h-32",
};

const LucidSigil = ({ size = "md", animate = "breathe", className = "" }: LucidSigilProps) => {
  return (
    <div className={`relative ${className}`}>
      <div
        className="absolute inset-0 rounded-full bg-primary/25 blur-2xl"
        style={{ transform: "scale(1.6)", animation: animate !== "none" ? "onb-glow-pulse-soft 3s ease-in-out infinite" : undefined }}
      />
      <div
        className="absolute inset-0 rounded-full bg-primary/10 blur-xl"
        style={{ transform: "scale(1.25)" }}
      />
      <div
        className={`relative ${sizeMap[size]} flex items-center justify-center`}
        style={{
          animation:
            animate === "breathe"
              ? "onb-sigil-breathe 3.2s ease-in-out infinite"
              : animate === "unlock"
                ? "onb-sigil-unlock 1.4s cubic-bezier(.22,1,.36,1) both, onb-sigil-breathe 3.2s 1.4s ease-in-out infinite"
                : undefined,
        }}
      >
        <img
          src={logoImage}
          alt="Lucid Repo"
          className="w-full h-full object-contain"
          style={{ filter: "drop-shadow(0 0 28px hsl(var(--primary) / 0.65))" }}
        />
      </div>

      {animate === "unlock" && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-primary"
              style={{
                animation: `onb-particle-burst 1.2s ${0.4 + i * 0.05}s ease-out both`,
                transform: `rotate(${i * 36}deg) translateY(-46px)`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default LucidSigil;