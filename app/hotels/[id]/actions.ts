"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { FLOW_STEPS, STEP_AFTER_LAST, calcDueDate, nextStepDef } from "@/lib/tasks";

// Start the sales prospection flow for a hotel (creates step 1 task)
export async function startProspectionFlow(hotelId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Get hotel's assigned_to
  const { data: hotel } = await supabase
    .from("hotels")
    .select("assigned_to")
    .eq("id", hotelId)
    .single();

  const step1 = FLOW_STEPS[0];
  await supabase.from("tasks").insert({
    hotel_id: hotelId,
    assigned_to: hotel?.assigned_to ?? user?.id ?? null,
    type: step1.type,
    step: step1.step,
    title: step1.title,
    description: step1.description,
    due_date: new Date().toISOString(),
    status: "pending",
  });

  revalidatePath(`/hotels/${hotelId}`);
  revalidatePath("/tasks");
}

// Complete or skip a task and auto-create the next one in the flow
export async function resolveTask(
  taskId: string,
  resolution: "done" | "skipped",
  hotelId: string,
) {
  const supabase = await createClient();

  const { data: task } = await supabase
    .from("tasks")
    .select("*")
    .eq("id", taskId)
    .single();

  if (!task) return;

  // Mark current task resolved
  await supabase
    .from("tasks")
    .update({ status: resolution, completed_at: new Date().toISOString() })
    .eq("id", taskId);

  // "done" = action completed (sent email / called) → create next step
  // "skipped" = prospect responded → flow ends
  if (resolution === "done" && task.step != null) {
    const nextDef = nextStepDef(task.step);
    if (nextDef) {
      const fromDate = new Date();
      const dueDate = calcDueDate(fromDate, {
        hoursAfterPrev: nextDef.hoursAfterPrev ?? 0,
        businessDays: nextDef.businessDays,
      });

      await supabase.from("tasks").insert({
        hotel_id: task.hotel_id,
        contact_id: task.contact_id,
        assigned_to: task.assigned_to,
        type: nextDef.type,
        step: "step" in nextDef ? nextDef.step : null,
        title: nextDef.title,
        description: nextDef.description,
        due_date: dueDate.toISOString(),
        status: "pending",
      });
    }
  }

  revalidatePath(`/hotels/${hotelId}`);
  revalidatePath("/tasks");
}

// Create a manual task
export async function createManualTask(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const hotelId = formData.get("hotel_id") as string;
  const title = (formData.get("title") as string).trim();
  const description = (formData.get("description") as string | null)?.trim() || null;
  const dueDate = formData.get("due_date") as string;
  const assignedTo = (formData.get("assigned_to") as string | null) || user?.id || null;

  if (!title || !dueDate) return;

  await supabase.from("tasks").insert({
    hotel_id: hotelId,
    assigned_to: assignedTo,
    type: "manual",
    step: null,
    title,
    description,
    due_date: new Date(dueDate).toISOString(),
    status: "pending",
  });

  revalidatePath(`/hotels/${hotelId}`);
  revalidatePath("/tasks");
}
