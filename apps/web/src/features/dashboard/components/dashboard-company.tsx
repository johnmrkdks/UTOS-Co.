import { Logo } from "@/components/logo";

export function DashboardCompanyLogo() {
  return (
    <div className="flex items-center justify-center gap-2">
      <Logo className="h-12 w-auto" />
      <div className="flex flex-col items-start justify-center">
        <h1 className="text-sm font-bold">DownUnderChauffeurs</h1>
        <p className="text-xs font-medium text-muted-foreground">
          KD Prestige
        </p>
      </div>
    </div>
  );
}
