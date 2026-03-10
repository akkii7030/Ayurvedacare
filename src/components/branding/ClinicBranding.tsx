import { cn } from "@/lib/utils";

type ClinicBrandingProps = {
  className?: string;
  showTagline?: boolean;
};

export const ClinicBranding = ({ className, showTagline = false }: ClinicBrandingProps) => {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl bg-white shadow-soft-xl border border-slate-100 flex items-center justify-center p-1">
        <img 
          src="/logo.png" 
          alt="Sharavat Pali Clinic Logo" 
          className="h-full w-full object-contain transform group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 ring-1 ring-inset ring-slate-900/5 rounded-2xl" />
      </div>
      <div className="flex flex-col">
        <span className="font-heading text-xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
          Sharavat Pali Clinic
        </span>
        {showTagline && (
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="h-1 w-1 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
              TeleCare · 24x7 Emergency
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClinicBranding;

