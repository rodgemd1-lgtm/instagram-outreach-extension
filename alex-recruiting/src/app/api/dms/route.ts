import { NextRequest, NextResponse } from "next/server";
import type { DMMessage } from "@/lib/types";
import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin";
import { sendDM, verifyHandle } from "@/lib/integrations/x-api";

const dmStore: DMMessage[] = [];

interface DMMessageRow {
  id: string;
  coach_id: string | null;
  coach_name: string;
  school_name: string;
  template_type: string;
  content: string;
  status: string | null;
  sent_at: string | null;
  responded_at: string | null;
  response_content: string | null;
  created_at: string;
}

function mapRow(row: DMMessageRow): DMMessage {
  return {
    id: row.id,
    coachId: row.coach_id ?? "",
    coachName: row.coach_name,
    schoolName: row.school_name,
    templateType: row.template_type,
    content: row.content,
    status: (row.status ?? "drafted") as DMMessage["status"],
    sentAt: row.sent_at,
    respondedAt: row.responded_at,
    responseContent: row.response_content,
    createdAt: row.created_at,
  };
}

export async function GET() {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createAdminClient();
      const { data, error } = await supabase
        .from("dm_messages")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("[GET /api/dms] Supabase error, falling back to memory:", error.message);
        // fall through to in-memory path below
      } else {
        const dms = ((data ?? []) as DMMessageRow[]).map(mapRow);
        return NextResponse.json({ dms, total: dms.length });
      }
    } catch (error) {
      console.error("[GET /api/dms] Supabase error, falling back to memory:", error);
    }
  }

  const sorted = [...dmStore].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  return NextResponse.json({ dms: sorted, total: sorted.length });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const now = new Date().toISOString();
  const sendNow = body.sendNow === true;

  if (isSupabaseConfigured()) {
    try {
      const supabase = createAdminClient();

      let recipientId: string | null = body.xUserId ?? null;
      let coachHandle: string | null = body.xHandle ?? null;

      if ((!recipientId || !coachHandle) && body.coachId) {
        const { data: coachRow } = await supabase
          .from("coaches")
          .select("name, school_name, x_handle")
          .eq("id", body.coachId)
          .single();

        if (coachRow) {
          coachHandle = coachHandle ?? coachRow.x_handle ?? null;
          body.coachName = body.coachName ?? coachRow.name;
          body.schoolName = body.schoolName ?? coachRow.school_name;
        }
      }

      if (!recipientId && coachHandle) {
        const user = await verifyHandle(coachHandle.replace("@", ""));
        recipientId = user?.id ?? null;
      }

      let status: DMMessage["status"] = "drafted";
      let sentAt: string | null = null;

      if (sendNow) {
        if (!recipientId) {
          return NextResponse.json(
            { error: "Coach X handle could not be resolved for DM delivery" },
            { status: 400 }
          );
        }

        const sent = await sendDM(recipientId, body.content);
        if (!sent) {
          return NextResponse.json(
            { error: "X DM send failed" },
            { status: 502 }
          );
        }

        status = "sent";
        sentAt = now;
      }

      const insertPayload = {
        coach_id: body.coachId ?? null,
        coach_name: body.coachName,
        school_name: body.schoolName,
        template_type: body.templateType ?? "manual",
        content: body.content,
        status,
        sent_at: sentAt,
        responded_at: null,
        response_content: null,
        created_at: now,
      };

      const { data, error } = await supabase
        .from("dm_messages")
        .insert(insertPayload)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      if (body.coachId && sendNow) {
        await supabase
          .from("coaches")
          .update({
            dm_status: "sent",
            last_engaged: now,
            updated_at: now,
          })
          .eq("id", body.coachId);
      }

      return NextResponse.json({ dm: mapRow(data as DMMessageRow) }, { status: 201 });
    } catch (error) {
      console.error("[POST /api/dms] Supabase error, falling back to memory:", error);
    }
  }

  const dm: DMMessage = {
    id: `dm-${Date.now()}`,
    coachId: body.coachId,
    coachName: body.coachName,
    schoolName: body.schoolName,
    templateType: body.templateType,
    content: body.content,
    status: sendNow ? "sent" : "drafted",
    sentAt: sendNow ? now : null,
    respondedAt: null,
    responseContent: null,
    createdAt: now,
  };

  dmStore.push(dm);
  return NextResponse.json({ dm }, { status: 201 });
}
