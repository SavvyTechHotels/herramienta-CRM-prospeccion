import type { TaskType } from "@/types/hotel";

export interface StepDef {
  step: number;
  type: TaskType;
  title: string;
  description: string;
  hoursAfterPrev: number | null; // null = immediate (step 1)
  businessDays: boolean;
}

export const FLOW_STEPS: StepDef[] = [
  {
    step: 1,
    type: "email_cold",
    title: "Primer correo en frío",
    description: "Enviar el primer correo de prospección al contacto principal.",
    hoursAfterPrev: null,
    businessDays: false,
  },
  {
    step: 2,
    type: "email_followup",
    title: "Correo de seguimiento",
    description: "Sin respuesta al primer correo. Enviar seguimiento a las 48h.",
    hoursAfterPrev: 48,
    businessDays: false,
  },
  {
    step: 3,
    type: "call",
    title: "Llamada de seguimiento",
    description: "Sin respuesta al seguimiento. Llamar a las 24h.",
    hoursAfterPrev: 24,
    businessDays: false,
  },
  {
    step: 4,
    type: "email_followup",
    title: "Segundo correo de seguimiento",
    description: "Sin respuesta a la llamada. Buscar otro contacto y enviar nuevo correo en 2 días laborables.",
    hoursAfterPrev: 2,
    businessDays: true, // treated as business days, not hours
  },
  {
    step: 5,
    type: "call",
    title: "Segunda llamada",
    description: "Sin respuesta al segundo correo. Llamar a las 72h.",
    hoursAfterPrev: 72,
    businessDays: false,
  },
];

export const STEP_AFTER_LAST: Omit<StepDef, "step"> = {
  type: "reassign",
  title: "Reasignar o cambiar dominio",
  description: "Sin respuesta tras 5 intentos. Pasar a otro compañero o enviar desde otro dominio.",
  hoursAfterPrev: null,
  businessDays: false,
};

function addBusinessDays(date: Date, days: number): Date {
  const result = new Date(date);
  let added = 0;
  while (added < days) {
    result.setDate(result.getDate() + 1);
    const dow = result.getDay();
    if (dow !== 0 && dow !== 6) added++;
  }
  return result;
}

export function calcDueDate(from: Date, stepDef: Pick<StepDef, "hoursAfterPrev" | "businessDays">): Date {
  const { hoursAfterPrev, businessDays } = stepDef;
  if (hoursAfterPrev == null) return from;
  if (businessDays) return addBusinessDays(from, hoursAfterPrev);
  return new Date(from.getTime() + hoursAfterPrev * 60 * 60 * 1000);
}

export function nextStepDef(currentStep: number): StepDef | typeof STEP_AFTER_LAST | null {
  const next = FLOW_STEPS.find((s) => s.step === currentStep + 1);
  if (next) return next;
  if (currentStep === 5) return STEP_AFTER_LAST;
  return null;
}

export function urgencyLabel(dueDate: string): { label: string; color: string } {
  const now = new Date();
  const due = new Date(dueDate);

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfTomorrow = new Date(startOfToday.getTime() + 86400_000);
  const startOfDayAfter = new Date(startOfTomorrow.getTime() + 86400_000);

  if (due < startOfToday) return { label: "Vencida", color: "text-red-600 bg-red-50" };
  if (due < startOfTomorrow) return { label: "Hoy", color: "text-yellow-700 bg-yellow-50" };
  if (due < startOfDayAfter) return { label: "Mañana", color: "text-blue-600 bg-blue-50" };
  return { label: "Próxima", color: "text-gray-600 bg-gray-100" };
}

export function taskTypeIcon(type: TaskType | "reassign"): string {
  switch (type) {
    case "email_cold":
    case "email_followup": return "✉";
    case "call": return "📞";
    case "manual": return "✓";
    case "reassign": return "↗";
  }
}
