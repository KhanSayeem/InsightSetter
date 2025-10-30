import Image from "next/image";
import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
};

export function Logo({ className }: LogoProps) {
  return (
    <div className={cn("flex items-center space-x-2 sm:space-x-3", className)}>
      <Image
        src="/logo-color.svg"
        alt="InsightSetter logo"
        width={32}
        height={32}
        priority
        sizes="(max-width: 640px) 24px, 32px"
        className="h-6 w-auto sm:h-8 dark:brightness-110 dark:contrast-110"
      />
      <span className="font-audiowide text-lg sm:text-xl">
        <span className="dark:text-white text-black">Insight</span>
        <span style={{ color: "#f59e0b" }}>Setter</span>
      </span>
    </div>
  );
}
