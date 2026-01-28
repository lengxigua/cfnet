/**
 * Form Error Display Component
 * Displays error messages in forms with consistent styling
 */

interface FormErrorProps {
  message?: string;
  className?: string;
}

export function FormError({ message, className = '' }: FormErrorProps) {
  if (!message) return null;

  return (
    <div
      className={`rounded-md bg-destructive/15 p-3 text-sm text-destructive ${className}`}
      role="alert"
    >
      {message}
    </div>
  );
}
