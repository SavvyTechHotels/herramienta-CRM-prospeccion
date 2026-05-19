"use client";

import { useState, useEffect } from "react";

export const CARGOS_PREDEFINIDOS = [
  "Director General",
  "Director de Marketing",
  "Director de Revenue",
  "Jefe de Recepción",
  "Director de Operaciones",
];

export function CargoSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const isOtro = value !== "" && !CARGOS_PREDEFINIDOS.includes(value);
  const [selectValue, setSelectValue] = useState(isOtro ? "Otro" : value);
  const [otroValue, setOtroValue] = useState(isOtro ? value : "");

  useEffect(() => {
    const isOtroNow = value !== "" && !CARGOS_PREDEFINIDOS.includes(value);
    setSelectValue(isOtroNow ? "Otro" : value);
    setOtroValue(isOtroNow ? value : "");
  }, [value]);

  function handleSelect(e: React.ChangeEvent<HTMLSelectElement>) {
    const v = e.target.value;
    setSelectValue(v);
    if (v !== "Otro") {
      setOtroValue("");
      onChange(v);
    } else {
      onChange("");
    }
  }

  function handleOtro(e: React.ChangeEvent<HTMLInputElement>) {
    setOtroValue(e.target.value);
    onChange(e.target.value);
  }

  return (
    <div className="space-y-2">
      <select
        value={selectValue}
        onChange={handleSelect}
        className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">— Sin cargo —</option>
        {CARGOS_PREDEFINIDOS.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
        <option value="Otro">Otro</option>
      </select>
      {selectValue === "Otro" && (
        <input
          value={otroValue}
          onChange={handleOtro}
          placeholder="Escribe el cargo..."
          className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      )}
    </div>
  );
}
