import React, { useState } from 'react';
import { AlertTriangle, Loader2, X, Trash2, ShieldAlert } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useToast } from '../context/ToastContext';
import { Technician } from '../types';

interface DeleteTechnicianModalProps {
  technician: Technician | null;
  isOpen: boolean;
  onClose: () => void;
  onDeleted: (deletedId: string) => void;
}

export function DeleteTechnicianModal({
  technician,
  isOpen,
  onClose,
  onDeleted,
}: DeleteTechnicianModalProps) {
  const { showToast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmInput, setConfirmInput] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen || !technician) return null;

  const expectedText = 'DELETE';
  const isConfirmed = confirmInput.trim().toUpperCase() === expectedText;

  const handleDelete = async () => {
    if (!isConfirmed) return;

    setIsDeleting(true);
    setErrorMessage(null);

    try {
      const { error } = await supabase
        .from('technicians')
        .delete()
        .eq('id', technician.id);

      if (error) throw error;

      showToast({
        type: 'success',
        title: 'Technician Removed',
        description: `Technician "${technician.name}" has been removed from the roster.`,
      });

      onDeleted(technician.id);
      onClose();
    } catch (err: unknown) {
      console.error('Error deleting technician:', err);
      const msg = err instanceof Error ? err.message : 'Could not delete technician.';
      setErrorMessage(msg);
      showToast({
        type: 'error',
        title: 'Deletion Failed',
        description: msg,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white max-w-md w-full border border-rose-200 shadow-2xl rounded-sm overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-rose-50 p-4 border-b border-rose-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-rose-800">
            <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-tight">Remove Technician</h3>
              <p className="text-[11px] text-rose-600 font-mono">Irreversible Action</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-rose-400 hover:text-rose-700 rounded-sm transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-xs">
          <p className="text-[#1a1716]/80 leading-relaxed">
            Are you sure you want to remove <strong className="text-[#1a1716] font-semibold">{technician.name}</strong> ({technician.primary_sector}) from the active technicians roster?
          </p>

          <div className="p-3 bg-[#f2efeb] border border-[#1a1716]/10 space-y-1 font-mono text-[11px]">
            <div><span className="text-slate-500">ID:</span> <span className="font-bold">{technician.id || 'N/A'}</span></div>
            <div><span className="text-slate-500">Phone:</span> {technician.phone}</div>
            <div><span className="text-slate-500">Sector:</span> {technician.primary_sector}</div>
            <div><span className="text-slate-500">Status:</span> {technician.status} ({technician.verification_status})</div>
          </div>

          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 font-mono text-[11px] rounded-xs">
              {errorMessage}
            </div>
          )}

          <div className="space-y-1.5 pt-1">
            <label className="block text-[11px] font-mono text-slate-600 uppercase">
              Type <strong className="text-rose-600 font-bold">DELETE</strong> to confirm:
            </label>
            <input
              type="text"
              value={confirmInput}
              onChange={(e) => setConfirmInput(e.target.value)}
              placeholder="DELETE"
              className="w-full text-xs font-mono px-3 py-2 border border-slate-300 rounded-sm focus:outline-none focus:border-rose-600"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-1.5 text-xs font-mono uppercase bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-sm transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={!isConfirmed || isDeleting}
            className="px-4 py-1.5 text-xs font-mono uppercase tracking-wider font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-sm transition flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Removing...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                <span>Confirm Removal</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
