type InputProps = {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  value?: string;
  id?: string;
  className?: string;
  defaultValue?: string;
  defaultChecked?: boolean;
  error?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export default function RegInput({
  label,
  name,
  type = "text",
  placeholder,
  value,
  id,
  className,
  defaultValue,
  defaultChecked,
  error,
  onChange,
}: Partial<InputProps>) {
  const inputId = id || name;
  const isCheckbox = type === "checkbox";

  return (
    <div className={`flex flex-col gap-1 ${className || ""}`}>
      <label htmlFor={inputId} className="text-sm font-medium text-stone-300">
        {label}
      </label>
      <input
        type={type}
        name={name}
        id={inputId}
        placeholder={placeholder}
        defaultValue={defaultValue}
        defaultChecked={defaultChecked}
        value={value ?? undefined}
        onChange={onChange}
        className={
          isCheckbox
            ? "w-4 h-4 accent-amber-500 cursor-pointer"
            : `w-full bg-stone-800/60 border ${
                error ? "border-red-500" : "border-stone-600"
              } rounded-lg px-3 py-2.5 text-sm text-stone-100 placeholder:text-stone-500
              focus:outline-none focus:ring-2 focus:ring-amber-500/60 focus:border-amber-500
              transition-all duration-200`
        }
      />
      {error && <p className="text-red-400 text-xs mt-0.5">{error}</p>}
    </div>
  );
}
