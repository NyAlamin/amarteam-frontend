"use client";

const styles: Record<string, string> = {
  success: "bg-green-600", error: "bg-red-500", warning: "bg-yellow-500",
};
const icons: Record<string, string> = { success: "✓", error: "✕", warning: "⚠" };

export default function Toast({ message, type }: { message: string; type: string }) {
  return (
    <div className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl text-white font-semibold animate-[slideUp_0.4s_ease-out] ${styles[type]}`}>
      <span className="text-lg">{icons[type]}</span>{message}
    </div>
  );
}