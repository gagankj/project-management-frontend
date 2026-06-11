import React from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  isSubmitting?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel = 'Delete',
  isSubmitting = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
   
      <div 
        className="fixed inset-0 bg-black/50" 
        onClick={isSubmitting ? undefined : onCancel}
      ></div>

      
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 shadow-2xl relative z-10 space-y-4 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-red-50 text-red-650 rounded-full shrink-0">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900">{title}</h3>
            <p className="text-sm text-slate-500">{message}</p>
          </div>
        </div>

       
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onCancel}
            className="cursor-pointer px-4 py-2 rounded-lg text-sm font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-white"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onConfirm}
            className="cursor-pointer flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-red-500/10"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
