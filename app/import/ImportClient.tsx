"use client";

import { useState, useRef, useTransition } from "react";
import { parseCsv } from "@/lib/csvImport";
import type { ParsedHotelRow } from "@/lib/csvImport";
import { importHotels } from "./actions";
import Link from "next/link";

type Step = "upload" | "preview" | "importing" | "done";

interface ImportState {
  rows: ParsedHotelRow[];
  warnings: string[];
  skipped: number;
}

const TIPO_LABELS: Record<string, { label: string; color: string }> = {
  grandes_marcas: { label: "Grandes marcas", color: "bg-blue-100 text-blue-800" },
  cadena_grande:  { label: "Cadena grande",  color: "bg-indigo-100 text-indigo-800" },
  cadena_mediana: { label: "Cadena mediana", color: "bg-violet-100 text-violet-800" },
  cadena_pequena: { label: "Cadena pequeña", color: "bg-gray-100 text-gray-700" },
  independiente:  { label: "Independiente",  color: "bg-green-100 text-green-800" },
};

function TipoNegocioBadge({ tipo }: { tipo: string | null }) {
  if (!tipo) return <span className="text-xs text-orange-500 font-medium">Sin clasificar</span>;
  const { label, color } = TIPO_LABELS[tipo] ?? { label: tipo, color: "bg-gray-100 text-gray-700" };
  return (
    <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${color}`}>
      {label}
    </span>
  );
}

function PreviewTable({ rows }: { rows: ParsedHotelRow[] }) {
  const preview = rows.slice(0, 8);
  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Nombre</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">★</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">CCAA</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Hab.</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">ADR</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Ocup.</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">% OTA</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tipo negocio</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Contacto</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {preview.map((r, i) => (
              <tr key={i} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-900 max-w-[200px] truncate">{r.nombre}</td>
                <td className="px-4 py-3 text-gray-500 text-sm">{r.estrellas ? `${r.estrellas}★` : "—"}</td>
                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{r.ccaa ?? "—"}</td>
                <td className="px-4 py-3 text-gray-700 text-right tabular-nums">{r.habitaciones ?? "—"}</td>
                <td className="px-4 py-3 text-gray-700 text-right tabular-nums">{r.adr ? `${r.adr}€` : "—"}</td>
                <td className="px-4 py-3 text-gray-700 text-right tabular-nums">{r.tasa_ocupacion ? `${r.tasa_ocupacion}%` : "—"}</td>
                <td className="px-4 py-3 text-gray-700 text-right tabular-nums">{r.porcentaje_ota != null ? `${r.porcentaje_ota}%` : "—"}</td>
                <td className="px-4 py-3">
                  <TipoNegocioBadge tipo={r.tipo_negocio} />
                </td>
                <td className="px-4 py-3 text-gray-500 max-w-[130px] truncate">
                  {r.contacto_nombre
                    ? `${r.contacto_nombre}${r.contacto_apellido ? ` ${r.contacto_apellido}` : ""}`
                    : r.tlf1
                      ? <span className="text-gray-400 italic text-xs">Solo teléfono</span>
                      : "—"
                  }
                </td>
                <td className="px-4 py-3 text-gray-400 max-w-[160px] truncate text-xs">{r.email ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length > 8 && (
        <div className="px-4 py-3 text-xs text-gray-400 border-t border-gray-100 bg-gray-50 text-center">
          y {rows.length - 8} hoteles más…
        </div>
      )}
    </div>
  );
}

const TIPO_OPTIONS = [
  { value: "independiente",  label: "Independiente" },
  { value: "cadena_pequena", label: "Cadena pequeña" },
  { value: "cadena_mediana", label: "Cadena mediana" },
  { value: "cadena_grande",  label: "Cadena grande" },
  { value: "grandes_marcas", label: "Grandes marcas" },
];

const COLUMNS_INFO = [
  { label: "Nombre", note: "obligatorio" },
  { label: "Habitaciones" }, { label: "ADR" }, { label: "Ocupacion" },
  { label: "Estrellas" }, { label: "Cadena" }, { label: "% OTA" },
  { label: "Contacto" }, { label: "Apellido" }, { label: "Cargo" },
  { label: "Email" }, { label: "Telefono" },
];

export function ImportClient({ savedChainOverrides = {} }: { savedChainOverrides?: Record<string, string> }) {
  const [step, setStep] = useState<Step>("upload");
  const [state, setState] = useState<ImportState | null>(null);
  const [chainOverrides, setChainOverrides] = useState<Record<string, string>>(savedChainOverrides);
  const [result, setResult] = useState<{ created: number; duplicates: number; errors: number } | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File) {
    setFileError(null);
    if (!file.name.endsWith(".csv") && !file.name.endsWith(".txt")) {
      setFileError("Solo se admiten archivos CSV. Exporta desde Excel o Google Sheets como CSV.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const parsed = parseCsv(text);
      if (parsed.rows.length === 0) {
        setFileError(parsed.warnings.join(" ") || "No se encontraron hoteles válidos en el archivo.");
        return;
      }
      setState(parsed);
      setChainOverrides(savedChainOverrides);
      setStep("preview");
    };
    reader.readAsText(file, "UTF-8");
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleConfirm() {
    if (!state) return;
    startTransition(async () => {
      setStep("importing");
      const res = await importHotels(state.rows, chainOverrides);
      setResult(res);
      setStep("done");
    });
  }

  // ── UPLOAD ──────────────────────────────────────────────────────────────
  if (step === "upload") {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Cómo exportar</p>
            <div className="space-y-3">
              {[
                { icon: "📊", title: "Google Sheets", sub: "Archivo → Descargar → CSV (.csv)" },
                { icon: "📗", title: "Excel", sub: "Guardar como → CSV UTF-8" },
              ].map(({ icon, title, sub }) => (
                <div key={title} className="flex items-start gap-3">
                  <span className="text-xl leading-none mt-0.5">{icon}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Columnas reconocidas</p>
            <div className="flex flex-wrap gap-1.5">
              {COLUMNS_INFO.map(({ label, note }) => (
                <span key={label} className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded font-mono">
                  {label}
                  {note && <span className="text-gray-400 font-sans text-xs">*</span>}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Drop zone */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onClick={() => inputRef.current?.click()}
          style={{
            border: isDragging ? "2px dashed #3b82f6" : "2px dashed #e5e7eb",
            borderRadius: "16px",
            backgroundColor: isDragging ? "#eff6ff" : "white",
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "72px 32px", textAlign: "center" }}>
            <div style={{
              width: 64, height: 64, borderRadius: 16,
              backgroundColor: isDragging ? "#dbeafe" : "#f9fafb",
              display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20,
              border: isDragging ? "1px solid #bfdbfe" : "1px solid #f3f4f6",
            }}>
              <svg style={{ width: 30, height: 30, color: isDragging ? "#2563eb" : "#9ca3af" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
            </div>
            <p style={{ fontWeight: 600, fontSize: 16, color: isDragging ? "#1d4ed8" : "#111827", marginBottom: 6 }}>
              {isDragging ? "Suelta el archivo aquí" : "Arrastra tu CSV aquí"}
            </p>
            <p style={{ fontSize: 13, color: "#9ca3af", marginBottom: 20 }}>o haz clic para seleccionarlo</p>
            <span style={{
              fontSize: 11, color: "#6b7280", backgroundColor: "#f3f4f6",
              padding: "3px 14px", borderRadius: 999, fontFamily: "monospace",
            }}>.csv</span>
          </div>
          <input ref={inputRef} type="file" accept=".csv,.txt" style={{ display: "none" }}
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
        </div>

        {fileError && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
            <svg style={{ width: 16, height: 16, flexShrink: 0, marginTop: 2, color: "#ef4444" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <p className="text-sm text-red-700">{fileError}</p>
          </div>
        )}
      </div>
    );
  }

  // ── PREVIEW ─────────────────────────────────────────────────────────────
  if (step === "preview" && state) {
    const withContact = state.rows.filter((r) => r.email || r.tlf1).length;
    // Solo cadenas que el catálogo no reconoce Y que aún no tienen override guardado
    const unknownChains: string[] = [...new Set(
      state.rows
        .filter((r) => r.cadena_nombre && !r.tipo_negocio && !chainOverrides[r.cadena_nombre])
        .map((r) => r.cadena_nombre as string)
    )];
    const pendingCount = unknownChains.length;

    return (
      <div className="space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-3xl font-bold text-gray-900">{state.rows.length}</p>
            <p className="text-sm text-gray-500 mt-1">Hoteles a importar</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-3xl font-bold text-gray-900">{withContact}</p>
            <p className="text-sm text-gray-500 mt-1">Con contacto</p>
          </div>
          <div className={`rounded-xl border p-5 ${pendingCount > 0 ? "bg-orange-50 border-orange-200" : "bg-white border-gray-200"}`}>
            <p className={`text-3xl font-bold ${pendingCount > 0 ? "text-orange-600" : "text-gray-900"}`}>{pendingCount}</p>
            <p className="text-sm text-gray-500 mt-1">Cadenas sin clasificar</p>
          </div>
        </div>

        {/* Cadenas desconocidas */}
        {unknownChains.length > 0 && (
          <div className="bg-white rounded-xl border border-orange-200 p-4">
            <p className="text-xs font-semibold text-orange-600 uppercase tracking-wide mb-3">
              Cadenas sin clasificar ({unknownChains.length})
            </p>
            <div className="space-y-2">
              {unknownChains.map((chain) => {
                const count = state.rows.filter((r) => r.cadena_nombre === chain).length;
                return (
                  <div key={chain} className="flex items-center gap-3">
                    <div className="flex-1 min-w-0 flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900 truncate">{chain}</span>
                      <span className="text-xs text-gray-400 flex-shrink-0">{count} hotel{count !== 1 ? "es" : ""}</span>
                    </div>
                    <select
                      value={chainOverrides[chain] ?? ""}
                      onChange={(e) => setChainOverrides((prev) => ({ ...prev, [chain]: e.target.value }))}
                      className="w-44 flex-shrink-0 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="">Sin clasificar</option>
                      {TIPO_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Warnings */}
        {state.warnings.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 space-y-1">
            {state.warnings.map((w, i) => (
              <p key={i} className="text-xs text-yellow-800">• {w}</p>
            ))}
          </div>
        )}

        {/* Tabla */}
        <PreviewTable rows={state.rows} />

        {/* Acciones */}
        <div className="flex items-center gap-3 pt-1">
          <button
            onClick={handleConfirm}
            disabled={isPending}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            Importar {state.rows.length} hoteles
          </button>
          <button
            onClick={() => { setStep("upload"); setState(null); }}
            className="border border-gray-300 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  // ── IMPORTING ────────────────────────────────────────────────────────────
  if (step === "importing") {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-6">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
        <div className="text-center">
          <p className="font-semibold text-gray-900 text-lg">Importando hoteles…</p>
          <p className="text-sm text-gray-400 mt-1">Esto puede tardar unos segundos</p>
        </div>
      </div>
    );
  }

  // ── DONE ─────────────────────────────────────────────────────────────────
  if (step === "done" && result) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-8">
        <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center mx-auto">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Importación completada</h2>
          <p className="text-sm text-gray-400 mt-1">Los hoteles ya están disponibles en la plataforma</p>
        </div>
        <div className="space-y-2 text-left">
          <div className="flex items-center justify-between bg-green-50 border border-green-100 rounded-xl px-5 py-3">
            <span className="text-sm text-gray-700">Hoteles creados</span>
            <span className="font-bold text-green-700 text-lg">{result.created}</span>
          </div>
          {result.duplicates > 0 && (
            <div className="flex items-center justify-between bg-yellow-50 border border-yellow-100 rounded-xl px-5 py-3">
              <span className="text-sm text-gray-700">Ya existían (omitidos)</span>
              <span className="font-bold text-yellow-600 text-lg">{result.duplicates}</span>
            </div>
          )}
          {result.errors > 0 && (
            <div className="flex items-center justify-between bg-red-50 border border-red-100 rounded-xl px-5 py-3">
              <span className="text-sm text-gray-700">Errores</span>
              <span className="font-bold text-red-600 text-lg">{result.errors}</span>
            </div>
          )}
        </div>
        <div className="flex gap-3 justify-center">
          <Link href="/" className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
            Ver hoteles
          </Link>
          <button
            onClick={() => { setStep("upload"); setState(null); setResult(null); }}
            className="border border-gray-300 text-gray-700 px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Importar otro archivo
          </button>
        </div>
      </div>
    );
  }

  return null;
}
