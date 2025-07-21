import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type AboutProps = {
  title: string;
  description: string;
}

type AboutCardProps = AboutProps & {
  className?: string;
};

export function AboutCard({ title, description, className, ...props }: AboutCardProps) {
  return (
    <Card className={cn("bg-black/20 shadow-none", className)} {...props}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
      <p className="text-sm">{description}</p>
      </CardContent>
    </Card>
  )
}
