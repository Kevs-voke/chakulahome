type DividerProps = {
  children: React.ReactNode;
  className?: string;
};

export default function Divider({ children, className = "" }: DividerProps) {
  return (
    <div className={`flex items-center my-5 ${className}`}>
      <div className="flex-1 border-t border-stone-700" />
      <span className="px-4 text-xs font-semibold tracking-widest text-amber-500/80 uppercase">
        {children}
      </span>
      <div className="flex-1 border-t border-stone-700" />
    </div>
  );
}
