"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Profile = { id: string; email: string };

export function AssignSelect({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (v: string | null) => void;
}) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const supabase = createClient();

  useEffect(() => {
    supabase.from("profiles").select("id, email").then(({ data }) => {
      if (data) setProfiles(data);
    });
  }, []);

  return (
    <select
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value || null)}
      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <option value="">— Sin asignar —</option>
      {profiles.map((p) => (
        <option key={p.id} value={p.email}>
          {p.email}
        </option>
      ))}
    </select>
  );
}
