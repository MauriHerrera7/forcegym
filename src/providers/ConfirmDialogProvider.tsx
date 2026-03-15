'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ConfirmOptions {
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
  variant?: 'default' | 'destructive';
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => void;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmDialogProvider');
  }
  return context;
}

export function ConfirmDialogProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const confirm = (newOptions: ConfirmOptions) => {
    setOptions(newOptions);
    setOpen(true);
  };

  const handleConfirm = async () => {
    if (options?.onConfirm) {
      setIsLoading(true);
      try {
        await Promise.resolve(options.onConfirm());
      } finally {
        setIsLoading(false);
        setOpen(false);
      }
    } else {
      setOpen(false);
    }
  };

  const handleCancel = () => {
    if (options?.onCancel) {
      options.onCancel();
    }
    if (!isLoading) {
      setOpen(false);
    }
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <Dialog open={open} onOpenChange={(val) => !isLoading && setOpen(val)}>
        <DialogContent 
          className="sm:max-w-[425px]"
          onInteractOutside={(e) => {
            // Prevent close on outside click to force explicitly choosing Approve or Cancel
            e.preventDefault();
          }}
        >
          <DialogHeader>
            <DialogTitle>{options?.title}</DialogTitle>
            {options?.description && (
              <DialogDescription className="text-gray-300">
                {options.description}
              </DialogDescription>
            )}
          </DialogHeader>
          <DialogFooter className="mt-4 flex gap-2 sm:space-x-2">
            <Button 
              variant="outline" 
              onClick={handleCancel} 
              disabled={isLoading}
              className="text-white hover:text-white border-zinc-600 bg-transparent hover:bg-zinc-800"
            >
              {options?.cancelText || 'Cancelar'}
            </Button>
            <Button
              variant={options?.variant === 'destructive' ? 'destructive' : 'default'}
              className="bg-[#ff0400] hover:bg-red-700 text-white font-bold border-none"
              onClick={handleConfirm}
              disabled={isLoading}
            >
              {isLoading ? 'Procesando...' : (options?.confirmText || 'Confirmar')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ConfirmContext.Provider>
  );
}
