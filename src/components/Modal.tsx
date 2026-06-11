import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
     
      <div 
        className="fixed inset-0 bg-black/50 transition-opacity" 
        onClick={onClose}
      />
      
      
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in-50 zoom-in-95 duration-200">
       
        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-white">
          <h2 className="text-xl font-bold text-slate-900">
            {title}
          </h2>
          <button 
            type="button"
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer focus:outline-none p-1 hover:bg-slate-100 rounded-full"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

       
        <div className="overflow-y-auto flex-1 bg-white">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
