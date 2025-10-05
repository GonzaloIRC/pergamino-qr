export default function DashboardHeader({ title, description, ...props }) {
  return (
    <div className="mb-8" {...props}>
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      {description && (
        <p className="text-muted-foreground mt-2">{description}</p>
      )}
    </div>
  );
}