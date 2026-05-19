import type { TipoNegocio } from "@/types/hotel";
import { lookupChainType } from "./knownChains";

export interface ParsedHotelRow {
  nombre: string;
  estrellas: number | null;
  ccaa: string | null;
  municipio: string | null;
  habitaciones: number | null;
  tipo: string | null;
  tipo_negocio: TipoNegocio | null;
  cadena_nombre: string | null;
  adr: number | null;
  tasa_ocupacion: number | null;
  porcentaje_ota: number | null;
  // contact fields
  email: string | null;
  tlf1: string | null;
  tlf2: string | null;
  tlf3: string | null;
  contacto_nombre: string | null;
  contacto_apellido: string | null;
  contacto_cargo: string | null;
}

type FieldKey = keyof ParsedHotelRow | "tipo_negocio_raw" | "skip";

function normalizeKey(h: string): string {
  return h
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

const HEADER_MAP: Record<string, FieldKey> = {
  // Nombre
  nombrehotel: "nombre",
  nombre: "nombre",
  hotel: "nombre",
  nobrehotel: "nombre",
  // Estrellas — acepta "Categoría", "Estrellas", número directo
  categoria: "estrellas",
  categora: "estrellas",
  estrellas: "estrellas",
  stars: "estrellas",
  // Tipo de negocio — columna directa
  tipodenegocio: "tipo_negocio_raw",
  tiponegocio: "tipo_negocio_raw",
  tipodenegocios: "tipo_negocio_raw",
  tiponegocios: "tipo_negocio_raw",
  // Cadena (si no hay tipo_negocio directo, se deriva)
  cadena: "cadena_nombre",
  nombrecadena: "cadena_nombre",
  cadenahotelera: "cadena_nombre",
  grupocadena: "cadena_nombre",
  grupo: "cadena_nombre",
  grupohotelero: "cadena_nombre",
  marca: "cadena_nombre",
  marcahotelera: "cadena_nombre",
  chain: "cadena_nombre",
  chainname: "cadena_nombre",
  // Ubicación
  ccaa: "ccaa",
  municipio: "municipio",
  // Habitaciones
  ndehabitaciones: "habitaciones",
  dehabitaciones: "habitaciones",
  habitaciones: "habitaciones",
  numhabitaciones: "habitaciones",
  hab: "habitaciones",
  // Tasa de ocupación
  tasadeocupacion: "tasa_ocupacion",
  tasaocupacion: "tasa_ocupacion",
  ocupacion: "tasa_ocupacion",
  ocupacionmedia: "tasa_ocupacion",
  ocupacionpromedio: "tasa_ocupacion",
  ocup: "tasa_ocupacion",
  // Plazas — ignorar
  ndeplazas: "skip",
  plazas: "skip",
  // Contacto
  email: "email",
  correo: "email",
  tlf1: "tlf1",
  telf1: "tlf1",
  telefono1: "tlf1",
  tel1: "tlf1",
  telefono: "tlf1",
  telfono: "tlf1",
  telef1: "tlf1",
  telef: "tlf1",
  tel: "tlf1",
  movil: "tlf1",
  movil1: "tlf1",
  tlf2: "tlf2",
  telf2: "tlf2",
  telefono2: "tlf2",
  tel2: "tlf2",
  telef2: "tlf2",
  movil2: "tlf2",
  tlf3: "tlf3",
  telf3: "tlf3",
  telefono3: "tlf3",
  tel3: "tlf3",
  telef3: "tlf3",
  movil3: "tlf3",
  // Modalidad / tipo
  modalidad: "tipo",
  tipologia: "tipo",
  tipo: "tipo",
  // ADR y OTA
  adr: "adr",
  ota: "porcentaje_ota",
  porcentajeota: "porcentaje_ota",
  // Contacto — nombre
  nombrecontacto: "contacto_nombre",
  contactonombre: "contacto_nombre",
  nombredecontacto: "contacto_nombre",
  contacto: "contacto_nombre",
  // Contacto — apellido
  apellidocontacto: "contacto_apellido",
  contactoapellido: "contacto_apellido",
  apellido: "contacto_apellido",
  // Contacto — cargo
  cargo: "contacto_cargo",
  puesto: "contacto_cargo",
  cargocontacto: "contacto_cargo",
  posicion: "contacto_cargo",
};

function parseRow(line: string, sep: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if (c === sep && !inQuotes) {
      result.push(current.trim().replace(/^"|"$/g, ""));
      current = "";
    } else {
      current += c;
    }
  }
  result.push(current.trim().replace(/^"|"$/g, ""));
  return result;
}

function parseNum(s: string): number | null {
  if (!s || s.trim() === "" || s.trim() === "-") return null;
  const clean = s.replace(/[^0-9.,]/g, "").replace(",", ".");
  const n = parseFloat(clean);
  return isNaN(n) ? null : n;
}

function parseIntVal(s: string): number | null {
  const n = parseNum(s);
  return n != null ? Math.round(n) : null;
}

function parseEstrellas(s: string): number | null {
  if (!s) return null;
  const norm = s.toLowerCase().trim().normalize("NFD").replace(/[̀-ͯ]/g, "");
  if (norm.includes("gl") || norm.includes("gran lujo")) return 5;
  const match = norm.match(/\d/);
  if (match) {
    const n = parseIntVal(match[0]);
    if (n != null && n >= 1 && n <= 5) return n;
  }
  return null;
}

// Acepta tanto el slug exacto como texto libre
function parseTipoNegocioRaw(s: string): TipoNegocio | null {
  const v = s.toLowerCase().trim().normalize("NFD").replace(/[̀-ͯ]/g, "");
  if (!v || v === "-") return null;
  if (v === "independiente" || v.startsWith("indep")) return "independiente";
  if (v === "cadena_pequena" || v.includes("peque")) return "cadena_pequena";
  if (v === "cadena_mediana" || v.includes("median")) return "cadena_mediana";
  if (v === "cadena_grande" || (v.includes("grande") && !v.includes("grandes"))) return "cadena_grande";
  if (v === "grandes_marcas" || v.includes("grandes") || v.includes("marca")) return "grandes_marcas";
  return null;
}

function deriveTipoNegocioFromCadena(cadena: string): TipoNegocio | null {
  const v = cadena.trim();
  if (!v || v === "-") return "independiente";
  return lookupChainType(v); // null = desconocida, se clasifica en la UI
}

export function parseCsv(text: string): { rows: ParsedHotelRow[]; skipped: number; warnings: string[] } {
  const warnings: string[] = [];

  const firstLine = text.split("\n")[0] ?? "";
  const semicolons = (firstLine.match(/;/g) ?? []).length;
  const commas = (firstLine.match(/,/g) ?? []).length;
  const sep = semicolons > commas ? ";" : ",";

  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) return { rows: [], skipped: 0, warnings: ["El archivo está vacío o no tiene datos."] };

  const rawHeaders = parseRow(lines[0], sep);
  const fieldMapping = rawHeaders.map((h) => HEADER_MAP[normalizeKey(h)] ?? "skip");

  rawHeaders.forEach((h, i) => {
    const norm = normalizeKey(h);
    if (fieldMapping[i] === "skip" && norm !== "ndeplazas" && norm !== "plazas") {
      warnings.push(`Columna ignorada: "${h}"`);
    }
  });

  if (!fieldMapping.includes("nombre")) {
    return { rows: [], skipped: 0, warnings: ["No se encontró la columna de nombre del hotel."] };
  }

  const get = (mapping: FieldKey[], values: string[], field: FieldKey) => {
    const idx = mapping.lastIndexOf(field);
    return idx >= 0 ? (values[idx] ?? "") : "";
  };

  const rows: ParsedHotelRow[] = [];
  let skipped = 0;

  for (let i = 1; i < lines.length; i++) {
    const values = parseRow(lines[i], sep);
    const g = (field: FieldKey) => get(fieldMapping, values, field);

    const nombre = g("nombre").trim();
    if (!nombre) { skipped++; continue; }

    const cadenaRaw = g("cadena_nombre");
    const tipoNegocioRawStr = g("tipo_negocio_raw");

    let tipo_negocio: TipoNegocio | null;
    if (tipoNegocioRawStr) {
      tipo_negocio = parseTipoNegocioRaw(tipoNegocioRawStr);
    } else {
      tipo_negocio = deriveTipoNegocioFromCadena(cadenaRaw);
    }

    rows.push({
      nombre,
      estrellas: parseEstrellas(g("estrellas")),
      ccaa: g("ccaa") || null,
      municipio: g("municipio") || null,
      habitaciones: parseIntVal(g("habitaciones")),
      tipo: g("tipo") || null,
      tipo_negocio,
      cadena_nombre: cadenaRaw.trim() || null,
      adr: parseNum(g("adr")),
      tasa_ocupacion: parseNum(g("tasa_ocupacion")),
      porcentaje_ota: parseNum(g("porcentaje_ota")),
      email: g("email") || null,
      tlf1: g("tlf1") || null,
      tlf2: g("tlf2") || null,
      tlf3: g("tlf3") || null,
      contacto_nombre: g("contacto_nombre") || null,
      contacto_apellido: g("contacto_apellido") || null,
      contacto_cargo: g("contacto_cargo") || null,
    });
  }

  return { rows, skipped, warnings };
}
