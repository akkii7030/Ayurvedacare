import Image from "next/image";
import { stethoscopeIcon } from "@/components/branding/MedicalIcons";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type HeroMediaProps = {
  src: string;
  alt: string;
  className?: string;
  badge?: string;
  orientation?: "right" | "left";
};

const HeroMedia = ({
  src,
  alt,
  className,
  badge,
  orientation = "right",
}: HeroMediaProps) => {
  return (
    <div
      className={cn(
        "mt-8 flex justify-center",
        orientation === "right" ? "lg:justify-end" : "lg:justify-start",
        className,
      )}
    >
      <div className="relative inline-flex max-w-xs overflow-hidden rounded-3xl border border-white/60 bg-white/80 p-2 shadow-card backdrop-blur-sm sm:max-w-sm md:max-w-md">
        <div className="pointer-events-none absolute inset-0 rounded-[1.4rem] bg-gradient-to-br from-primary/8 via-teal-50/40 to-cyan-100/40" />
        <div className="relative overflow-hidden rounded-2xl">
          <Image
            src={src}
            alt={alt}
            width={640}
            height={420}
            className="h-full w-full object-cover"
            sizes="(max-width: 768px) 90vw, 480px"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/10 via-slate-900/0 to-transparent" />
        </div>

        <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-primary/15" />

        <div
          className={cn(
            "absolute top-3 flex items-center gap-2",
            orientation === "right" ? "left-3" : "right-3 flex-row-reverse",
          )}
        >
          <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/80 shadow-card backdrop-blur">
            {stethoscopeIcon}
          </div>
          {badge && (
            <Badge
              variant="secondary"
              className="bg-emerald-50/90 text-emerald-700 shadow-sm ring-1 ring-emerald-100"
            >
              {badge}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};

export default HeroMedia;
