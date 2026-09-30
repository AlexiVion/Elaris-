import { Card, CardContent } from "@/components/ui/card";

/** Temporary empty-state used by routes not yet built out in the current phase. */
export function Placeholder({ note }: { note: string }) {
  return (
    <Card>
      <CardContent className="py-16 text-center text-sm text-muted-foreground">{note}</CardContent>
    </Card>
  );
}
