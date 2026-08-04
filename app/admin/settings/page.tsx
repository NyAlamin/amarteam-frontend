"use client";

import Toast from "@/components/ui/toast";
import { useToast } from "@/lib/hooks";

export default function AdminSettingsPage() {
  const { toast, showToast } = useToast();

  return (
    <div className="max-w-lg mx-auto bg-white rounded-xl shadow-sm p-4 sm:p-6">
      <h2 className="font-bold text-lg mb-4">Settings</h2>
      <div className="space-y-4">
        <div><label className="block text-sm font-semibold mb-1">Platform Name</label><input defaultValue="আমার টিম — Amar Team" className="w-full px-3 py-2.5 border rounded-lg text-sm" /></div>
        <div><label className="block text-sm font-semibold mb-1">Contact Email</label><input defaultValue="admin@amarteam.com.bd" className="w-full px-3 py-2.5 border rounded-lg text-sm" /></div>
        <div><label className="block text-sm font-semibold mb-1">Contact Phone</label><input defaultValue="+880-17XX-XXXXXX" className="w-full px-3 py-2.5 border rounded-lg text-sm" /></div>
        <button onClick={() => showToast("Settings saved!")} className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700">💾 Save</button>
      </div>
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}