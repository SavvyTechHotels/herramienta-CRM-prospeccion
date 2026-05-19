"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { AssignSelect } from "@/components/AssignSelect";

export function AssignedToSelect({ hotelId, current }: { hotelId: string; current: string | null }) {
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleChange(email: string | null) {
    setSaving(true);
    await supabase.from("hotels").update({ assigned_to: email }).eq("id", hotelId);
    setSaving(false);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1">
        <AssignSelect value={current} onChange={handleChange} />
      </div>
      {saving && <span className="text-xs text-gray-400">Guardando...</span>}
    </div>
  );
}
