/**
 * Or Divider Component
 * A horizontal divider with text in the middle, commonly used between auth options
 */

interface OrDividerProps {
  text?: string;
  className?: string;
}

export function OrDivider({ text = 'Or continue with', className = '' }: OrDividerProps) {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t" />
      </div>
      <div className="relative flex justify-center text-xs uppercase">
        <span className="bg-background px-2 text-muted-foreground">{text}</span>
      </div>
    </div>
  );
}
