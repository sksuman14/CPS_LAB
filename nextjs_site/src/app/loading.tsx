export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-surface">
      <div className="w-16 h-16 border-4 border-primary-container/30 border-t-primary-container rounded-full animate-spin"></div>
      <p className="mt-8 font-headline font-medium text-base text-on-surface-variant animate-pulse">
        Initializing the Lab...
      </p>
    </div>
  );
}
