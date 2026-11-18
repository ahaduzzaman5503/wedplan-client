export default function PlaceholderPage({
  title,
  description = "This page will be built in a later step.",
}) {
  return (
    <div className="px-1 py-6 sm:px-2">
      <h1 className="font-heading text-3xl font-bold text-primary">{title}</h1>
      <p className="mt-2 text-muted-foreground">{description}</p>
    </div>
  );
}