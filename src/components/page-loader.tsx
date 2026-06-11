export function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-6">
        <div className="relative h-16 w-16">
          <div className="absolute inset-0 rounded-full border-2 border-gold-soft/30" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin" />
          <div className="absolute inset-2 rounded-full border-2 border-transparent border-b-gold animate-spin [animation-duration:1.5s] [animation-direction:reverse]" />
        </div>
        <p className="font-serif text-lg tracking-wide text-foreground/70 animate-pulse">
          NailHouse
        </p>
      </div>
    </div>
  );
}
