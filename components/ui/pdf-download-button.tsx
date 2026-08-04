"use client";

import { useState } from "react";
import { Player } from "@/lib/types";
import { generatePlayerPDF } from "@/lib/pdf-generator";

interface Props {
  player: Player;
  variant?: "dark" | "light";
  fullWidth?: boolean;
  label?: string;
}

export default function PdfDownloadButton({ player, variant = "dark", fullWidth = false, label }: Props) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      await generatePlayerPDF(player);
    } catch (err) {
      console.error("PDF generation failed", err);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const styles = variant === "dark"
    ? "bg-dark-card border border-dark-border text-white/80 hover:text-white hover:border-primary-600"
    : "bg-white border border-slate-200 text-slate-600 hover:border-green-500 hover:text-green-700";

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className={`${styles} ${fullWidth ? "w-full" : ""} px-4 py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2`}
    >
      {loading ? (
        <>
          <span className="inline-block w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          Generating...
        </>
      ) : (
        <>📄 {label || "Download PDF"}</>
      )}
    </button>
  );
}