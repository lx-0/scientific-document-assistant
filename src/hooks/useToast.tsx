import React from 'react';
import * as Toast from '@radix-ui/react-toast';
import { X } from 'lucide-react';
import { clsx } from 'clsx';

interface ToastProps {
  title: string;
  description?: string;
  variant?: 'default' | 'success' | 'error';
}

interface ToastContextType {
  toast: (props: ToastProps) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(
  undefined,
);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<(ToastProps & { id: string })[]>(
    [],
  );

  const toast = React.useCallback(
    ({ title, description, variant = 'default' }: ToastProps) => {
      setToasts((prev) => [
        ...prev,
        {
          id: Math.random().toString(36).slice(2),
          title,
          description,
          variant,
        },
      ]);
    },
    [],
  );

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <Toast.Provider swipeDirection="right">
        {toasts.map(({ id, title, description, variant }) => (
          <Toast.Root
            key={id}
            className={clsx(
              'fixed bottom-4 right-4 z-50 flex w-96 items-start gap-4 rounded-lg p-4 shadow-lg',
              'data-[state=open]:animate-in data-[state=closed]:animate-out',
              'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
              'data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-right-full',
              {
                'bg-white text-gray-900': variant === 'default',
                'bg-green-50 text-green-900': variant === 'success',
                'bg-red-50 text-red-900': variant === 'error',
              },
            )}
            duration={5000}
            onOpenChange={(open) => {
              if (!open) {
                setTimeout(() => removeToast(id), 100);
              }
            }}
          >
            <div className="flex-1">
              <Toast.Title className="text-sm font-semibold">
                {title}
              </Toast.Title>
              {description && (
                <Toast.Description className="mt-1 text-sm">
                  {description}
                </Toast.Description>
              )}
            </div>
            <Toast.Close className="rounded-lg p-1 hover:bg-black/5">
              <X className="h-4 w-4" />
            </Toast.Close>
          </Toast.Root>
        ))}
        <Toast.Viewport />
      </Toast.Provider>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
