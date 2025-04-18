import { cn } from "@/lib/utils";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Spinner({ size = "md", className = "" }: SpinnerProps) {
  const getSizeClass = () => {
    switch (size) {
      case "sm": return "h-4 w-4";
      case "lg": return "h-8 w-8";
      default: return "h-6 w-6";
    }
  };

  return (
    <div
      className={`animate-spin rounded-full border-2 border-current border-t-transparent ${getSizeClass()} ${className}`}
    />
  );
} 