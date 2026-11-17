import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-24">
      <h1 className="font-heading text-5xl font-bold text-primary">WedPlan</h1>
      <p className="text-muted-foreground">Your dream wedding starts here</p>
      <div className="flex gap-3">
        <Button>Rose Button</Button>
        <Button variant="secondary">Secondary</Button>
      </div>
    </div>
  );
}
