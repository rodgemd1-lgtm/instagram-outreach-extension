import { NextRequest, NextResponse } from "next/server";
import {
  generateEmail,
  createEmailSequence,
  listEmails,
  processEmailQueue,
  getEmailAnalytics,
  markEmailOpened,
  markEmailResponded,
  type EmailStatus,
} from "@/lib/outreach/email-sequences";
import type { EmailTemplateType } from "@/lib/outreach/email-templates";

// ---------------------------------------------------------------------------
// GET /api/outreach/email — List email outreach history
// Query params: ?status=draft|queued|sent|opened|responded
//               ?coachName=...
//               ?sequenceId=...
//               ?analytics=true (returns analytics instead of list)
//               ?process=true (processes the send queue)
// ---------------------------------------------------------------------------

export async function GET(req: NextRequest) {
  try {
    const analyticsFlag = req.nextUrl.searchParams.get("analytics");
    const processFlag = req.nextUrl.searchParams.get("process");

    // Return analytics dashboard
    if (analyticsFlag === "true") {
      const analytics = await getEmailAnalytics();
      return NextResponse.json({ analytics });
    }

    // Process the send queue
    if (processFlag === "true") {
      const result = await processEmailQueue();
      return NextResponse.json({ result });
    }

    // List emails with optional filters
    const status = req.nextUrl.searchParams.get("status") as EmailStatus | null;
    const coachName = req.nextUrl.searchParams.get("coachName");
    const sequenceId = req.nextUrl.searchParams.get("sequenceId");

    const emails = await listEmails({
      status: status ?? undefined,
      coachName: coachName ?? undefined,
      sequenceId: sequenceId ?? undefined,
    });

    return NextResponse.json({ emails, total: emails.length });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// POST /api/outreach/email — Send/draft an email or create a sequence
// Body:
//   { action: "single", coachName, schoolName, templateType, coachEmail?, coachId?, mergeVars?, status? }
//   { action: "sequence", coachName, schoolName, coachEmail?, coachId?, mergeVars? }
//   { action: "mark_opened", emailId }
//   { action: "mark_responded", emailId }
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = body.action ?? "single";

    switch (action) {
      case "single": {
        if (!body.coachName || !body.schoolName || !body.templateType) {
          return NextResponse.json(
            { error: "coachName, schoolName, and templateType are required" },
            { status: 400 }
          );
        }

        const email = await generateEmail({
          coachId: body.coachId,
          coachName: body.coachName,
          schoolName: body.schoolName,
          coachEmail: body.coachEmail,
          templateType: body.templateType as EmailTemplateType,
          mergeVars: body.mergeVars,
          status: body.status ?? "draft",
        });

        return NextResponse.json({ email }, { status: 201 });
      }

      case "sequence": {
        if (!body.coachName || !body.schoolName) {
          return NextResponse.json(
            { error: "coachName and schoolName are required for sequence creation" },
            { status: 400 }
          );
        }

        const emails = await createEmailSequence({
          coachId: body.coachId,
          coachName: body.coachName,
          schoolName: body.schoolName,
          coachEmail: body.coachEmail,
          mergeVars: body.mergeVars,
        });

        return NextResponse.json(
          {
            sequenceId: emails[0]?.sequenceId,
            emails,
            total: emails.length,
            message: `Created ${emails.length}-step email sequence for ${body.coachName} at ${body.schoolName}`,
          },
          { status: 201 }
        );
      }

      case "mark_opened": {
        if (!body.emailId) {
          return NextResponse.json(
            { error: "emailId is required" },
            { status: 400 }
          );
        }
        const success = await markEmailOpened(body.emailId);
        return NextResponse.json({ success });
      }

      case "mark_responded": {
        if (!body.emailId) {
          return NextResponse.json(
            { error: "emailId is required" },
            { status: 400 }
          );
        }
        const success = await markEmailResponded(body.emailId);
        return NextResponse.json({ success });
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}. Use "single", "sequence", "mark_opened", or "mark_responded".` },
          { status: 400 }
        );
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
