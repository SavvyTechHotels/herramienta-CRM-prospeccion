"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function DeleteHotelButton({ hotelId }: { hotelId: string }) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleDelete() {
    setLoading(true);
    await Promise.all([
      supabase.from("contacts").delete().eq("hotel_id", hotelId),
      supabase.from("notes").delete().eq("hotel_id", hotelId),
      supabase.from("email_logs").delete().eq("hotel_id", hotelId),
    ]);
    await supabase.from("hotels").delete().eq("id", hotelId);
    router.push("/");
    router.refresh();
  }

  if (confirming) {
    return (
      <div className="flex flex-col items-end gap-1.5">
        <span className="text-xs text-gray-500 whitespace-nowrap">¿Eliminar este hotel?</span>
        <div className="flex gap-2">
          <button
            onClick={() => setConfirming(false)}
            disabled={loading}
            className="border border-gray-300 text-gray-600 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            {loading ? "Eliminando..." : "Sí, eliminar"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
    >
      Eliminar
    </button>
  );
}
