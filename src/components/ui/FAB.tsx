import React from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface FABProps {
  to?: string;
  onClick?: () => void;
  label?: string;
  icon?: React.ReactNode;
  className?: string;
}

const FAB: React.FC<FABProps> = ({
  to,
  onClick,
  label = "New Dream",
  icon = <Plus className="h-5 w-5" />,
  className,
}) => {
  const navigate = useNavigate();
  const handleClick = () => {
    if (onClick) onClick();
    else if (to) navigate(to);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={label}
      className={cn(
        "fixed z-40 right-4 flex items-center gap-2 rounded-full px-5 py-3",
        "bg-primary text-primary-foreground font-semibold text-sm",
        "shadow-[0_8px_24px_-4px_hsl(var(--primary)/0.6)]",
        "hover:scale-105 active:scale-95 transition-transform",
        "bottom-[calc(4.5rem+env(safe-area-inset-bottom))] md:bottom-6",
        className,
      )}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
};

export default FAB;
