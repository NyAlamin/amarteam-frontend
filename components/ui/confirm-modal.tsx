"use client";

export default function ConfirmModal({ message, onConfirm, onCancel }: {
  message: string; onConfirm: () => void; onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9998]">
      <div className="bg-white rounded-xl p-8 max-w-md w-[90%] text-center animate-[scaleIn_0.3s_ease-out]">
        <p className="text-base mb-6 text-slate-700">{message}</p>
        <div className="flex gap-3 justify-center">
          <button onClick={onCancel} className="px-6 py-2.5 rounded-lg border text-slate-600 font-semibold hover:bg-slate-50">Cancel</button>
          <button onClick={onConfirm} className="px-6 py-2.5 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600">Confirm</button>
        </div>
      </div>
    </div>
  );
}