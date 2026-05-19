"use server";

import { createClient } from "@/lib/supabase/server";
import { computeScore } from "@/lib/scoring";
import type { ParsedHotelRow } from "@/lib/csvImport";

export interface ImportResult {
  created: number;
  duplicates: number;
  errors: number;
}

export async function importHotels(rows: ParsedHotelRow[], chainOverrides: Record<string, string> = {}): Promise<ImportResult> {
  const supabase = await createClient();
  let created = 0;
  let duplicates = 0;
  let errors = 0;

  // Fetch existing hotel names to skip duplicates
  const { data: existing } = await supabase.from("hotels").select("nombre");
  const existingNames = new Set((existing ?? []).map((h: { nombre: string }) => h.nombre.toLowerCase().trim()));

  // Process in batches of 50
  const BATCH = 50;
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);

    for (const row of batch) {
      if (existingNames.has(row.nombre.toLowerCase().trim())) {
        duplicates++;
        continue;
      }

      // Build a minimal hotel object for scoring (contacts not available yet)
      // Apply chain override if user classified it manually in preview
      const tipo_negocio = row.tipo_negocio
        ?? (row.cadena_nombre && chainOverrides[row.cadena_nombre]
          ? chainOverrides[row.cadena_nombre] as import("@/types/hotel").TipoNegocio
          : null);

      const hotelForScore = {
        habitaciones: row.habitaciones,
        adr: row.adr,
        tasa_ocupacion: row.tasa_ocupacion,
        estrellas: row.estrellas,
        tipo_negocio,
        porcentaje_ota: row.porcentaje_ota,
      };

      const { score, tier } = computeScore(hotelForScore, []);

      // facturacion_anual can't be computed without tasa_ocupacion
      const { data: hotel, error } = await supabase.from("hotels").insert({
        nombre: row.nombre,
        estrellas: row.estrellas,
        segmento: row.ccaa,
        tipo: row.tipo,
        tipo_negocio,
        habitaciones: row.habitaciones,
        adr: row.adr,
        tasa_ocupacion: row.tasa_ocupacion,
        facturacion_anual: (row.habitaciones && row.adr && row.tasa_ocupacion)
          ? Math.round(row.habitaciones * row.adr * (row.tasa_ocupacion / 100) * 365)
          : null,
        porcentaje_ota: row.porcentaje_ota,
        presencia_ota: row.porcentaje_ota != null ? row.porcentaje_ota > 0 : false,
        status: "no_contactado",
        score,
        tier,
      }).select("id").single();

      if (error || !hotel) {
        errors++;
        continue;
      }

      existingNames.add(row.nombre.toLowerCase().trim());
      created++;

      // Create contacts if there's any contact data
      const hasContact = row.email || row.tlf1 || row.tlf2 || row.tlf3;
      if (hasContact) {
        const contactsToInsert = [];

        // Primary contact — use real name if available, fallback to "Contacto"
        if (row.email || row.tlf1) {
          contactsToInsert.push({
            hotel_id: hotel.id,
            nombre: row.contacto_nombre || "Contacto",
            apellido: row.contacto_apellido || null,
            email: row.email,
            numero: row.tlf1,
            cargo: row.contacto_cargo || null,
          });
        }

        // Additional phones as separate contacts (no name info available)
        if (row.tlf2) {
          contactsToInsert.push({
            hotel_id: hotel.id,
            nombre: "Contacto 2",
            apellido: null,
            email: null,
            numero: row.tlf2,
            cargo: null,
          });
        }
        if (row.tlf3) {
          contactsToInsert.push({
            hotel_id: hotel.id,
            nombre: "Contacto 3",
            apellido: null,
            email: null,
            numero: row.tlf3,
            cargo: null,
          });
        }

        if (contactsToInsert.length > 0) {
          await supabase.from("contacts").insert(contactsToInsert);
        }
      }
    }
  }

  // Save chain overrides to DB so future imports auto-classify the same chains
  const newOverrides = Object.entries(chainOverrides).filter(([, v]) => v);
  if (newOverrides.length > 0) {
    await supabase.from("chain_overrides").upsert(
      newOverrides.map(([cadena_nombre, tipo_negocio]) => ({ cadena_nombre, tipo_negocio })),
      { onConflict: "cadena_nombre" }
    );
  }

  return { created, duplicates, errors };
}
