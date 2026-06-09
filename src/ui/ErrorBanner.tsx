type ErrorBannerProps = {
  message: string;
};

export default function ErrorBanner({ message }: ErrorBannerProps) {
  return (
    <div className="w-full rounded-lg bg-red-900/30 border border-red-600/50 px-4 py-3 text-sm text-red-300 flex items-start gap-2">
      <span className="mt-0.5 text-red-400">⚠</span>
      <span>{message}</span>
    </div>
  );
}
