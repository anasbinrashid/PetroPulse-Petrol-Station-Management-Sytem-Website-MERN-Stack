import { ReactNode } from "react";
import { VideoBackground } from "@/components/VideoBackground";

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <div className="relative flex h-screen w-full flex-col items-center justify-center">
      <VideoBackground />
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      <div className="relative z-10 mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <div className="mb-4 flex justify-center">
            <img src="/logo.png" alt="PetroPulse Logo" className="h-12" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
        {children}
      </div>
    </div>
  );
}
