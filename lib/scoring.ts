import type { Hotel, HotelTier, Contact } from "@/types/hotel";

// ─── Pesos (suma = 100) ───────────────────────────────────────────────────────
const W_VOLUMEN      = 30; // habitaciones + ADR + tasa ocupación → revenue estimado
const W_TIPO_NEGOCIO = 30;
const W_ESTRELLAS    = 10;
const W_CONTACTO     = 10;
const W_OTA          = 20;

// ─── Tablas de ratios ─────────────────────────────────────────────────────────
const TIPO_NEGOCIO_RATIO: Record<string, number> = {
  "independiente":  1.00,
  "cadena_pequena": 0.75,
  "cadena_mediana": 0.50,
  "cadena_grande":  0.25,
  "grandes_marcas": 0.00,
};

const CARGOS_RANKING: { keywords: string[]; ratio: number }[] = [
  { keywords: ["director general", "ceo", "general manager", "gm", "gerente general"], ratio: 1.0 },
  { keywords: ["director de marketing", "marketing director", "director marketing"], ratio: 0.8 },
  { keywords: ["director de revenue", "revenue manager", "director revenue", "revenue director"], ratio: 0.7 },
  { keywords: ["jefe de recepción", "jefe recepcion", "front office manager", "jefe de recepcion"], ratio: 0.5 },
  { keywords: ["director de operaciones", "operations director", "director operaciones"], ratio: 0.5 },
];

// ─── Funciones de scoring ─────────────────────────────────────────────────────

function scoreVolumen(
  habitaciones: number | null,
  adr: number | null,
  tasa_ocupacion: number | null,
): number {
  // Con los 3 datos calculamos la facturación estimada anual
  if (habitaciones != null && adr != null && tasa_ocupacion != null) {
    const revenue = habitaciones * adr * (tasa_ocupacion / 100) * 365;
    if (revenue >= 8_000_000) return W_VOLUMEN;
    if (revenue >= 3_000_000) return W_VOLUMEN * 0.75;
    if (revenue >= 1_000_000) return W_VOLUMEN * 0.50;
    if (revenue >= 300_000)   return W_VOLUMEN * 0.30;
    return W_VOLUMEN * 0.15;
  }
  // Solo habitaciones: puntuación parcial (incentivo a completar ADR y ocupación)
  if (habitaciones != null) {
    if (habitaciones > 300) return W_VOLUMEN * 0.55;
    if (habitaciones > 100) return W_VOLUMEN * 0.35;
    if (habitaciones > 30)  return W_VOLUMEN * 0.20;
    return W_VOLUMEN * 0.10;
  }
  return 0;
}

function scoreEstrellas(n: number | null): number {
  if (n == null) return 0;
  if (n >= 5)  return W_ESTRELLAS;
  if (n === 4) return W_ESTRELLAS * 0.65;
  if (n === 3) return W_ESTRELLAS * 0.30;
  return 0;
}

function scoreTipoNegocio(tipo: string | null): number {
  if (!tipo) return 0;
  const ratio = TIPO_NEGOCIO_RATIO[tipo.toLowerCase().trim()];
  return ratio != null ? W_TIPO_NEGOCIO * ratio : 0;
}

function scoreOta(pct: number | null): number {
  if (pct == null) return 0;
  if (pct >= 60) return W_OTA;
  if (pct >= 40) return W_OTA * 0.7;
  if (pct >= 20) return W_OTA * 0.4;
  return W_OTA * 0.1;
}

export function scoreContacto(contacts: Partial<Contact>[]): number {
  if (!contacts || contacts.length === 0) return 0;

  let best = 0.15;
  for (const contact of contacts) {
    const cargo = (contact.cargo ?? "").toLowerCase().trim();
    if (!cargo) continue;
    for (const { keywords, ratio } of CARGOS_RANKING) {
      if (keywords.some((k) => cargo.includes(k))) {
        best = Math.max(best, ratio);
        break;
      }
    }
    if (best < 0.25) best = 0.25;
  }
  return Math.round(W_CONTACTO * best * 10) / 10;
}

// ─── API pública ──────────────────────────────────────────────────────────────

function tier(score: number): HotelTier {
  if (score >= 75) return "A";
  if (score >= 50) return "B";
  if (score >= 25) return "C";
  return "D";
}

export function computeScore(
  h: Partial<Hotel>,
  contacts: Partial<Contact>[] = [],
): { score: number; tier: HotelTier } {
  const total = Math.min(
    Math.round(
      (scoreVolumen(h.habitaciones ?? null, h.adr ?? null, h.tasa_ocupacion ?? null) +
        scoreEstrellas(h.estrellas ?? null) +
        scoreTipoNegocio(h.tipo_negocio ?? null) +
        scoreOta(h.porcentaje_ota ?? null) +
        scoreContacto(contacts)) * 10
    ) / 10,
    100
  );
  return { score: total, tier: tier(total) };
}

export function scoreBreakdown(h: Partial<Hotel>, contacts: Partial<Contact>[] = []) {
  return {
    volumen:      scoreVolumen(h.habitaciones ?? null, h.adr ?? null, h.tasa_ocupacion ?? null),
    estrellas:    scoreEstrellas(h.estrellas ?? null),
    tipo_negocio: scoreTipoNegocio(h.tipo_negocio ?? null),
    ota:          scoreOta(h.porcentaje_ota ?? null),
    contacto:     scoreContacto(contacts),
  };
}

export const SCORING_MAXES = {
  volumen:      W_VOLUMEN,
  estrellas:    W_ESTRELLAS,
  tipo_negocio: W_TIPO_NEGOCIO,
  ota:          W_OTA,
  contacto:     W_CONTACTO,
};

// Utilidad: facturación estimada anual a partir de los 3 KPIs
export function facturacionEstimada(
  habitaciones: number | null,
  adr: number | null,
  tasa_ocupacion: number | null,
): number | null {
  if (habitaciones == null || adr == null || tasa_ocupacion == null) return null;
  return Math.round(habitaciones * adr * (tasa_ocupacion / 100) * 365);
}
