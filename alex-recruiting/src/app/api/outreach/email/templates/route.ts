import { NextRequest, NextResponse } from "next/server";
import {
  getAllTemplates,
  getTemplateByType,
  buildEmailFromTemplate,
  type EmailTemplateType,
} from "@/lib/outreach/email-templates";

// ---------------------------------------------------------------------------
// GET /api/outreach/email/templates — Get all email templates
// Query params: ?type=initial_introduction|film_update|camp_followup|academic_update|season_recap
//               ?preview=true&coachName=...&schoolName=... (returns a filled preview)
// ---------------------------------------------------------------------------

export async function GET(req: NextRequest) {
  try {
    const type = req.nextUrl.searchParams.get("type") as EmailTemplateType | null;
    const preview = req.nextUrl.searchParams.get("preview");

    // Return a single template by type
    if (type) {
      const template = getTemplateByType(type);
      if (!template) {
        return NextResponse.json(
          { error: `Unknown template type: ${type}` },
          { status: 404 }
        );
      }

      // If preview mode, fill merge fields with provided or sample data
      if (preview === "true") {
        const coachName = req.nextUrl.searchParams.get("coachName") ?? "Johnson";
        const schoolName = req.nextUrl.searchParams.get("schoolName") ?? "University of Wisconsin";

        const filled = buildEmailFromTemplate(type, {
          coachName,
          schoolName,
          hudlLink: req.nextUrl.searchParams.get("hudlLink") ?? "https://www.hudl.com/profile/jacob-rodgers",
          ncsaLink: req.nextUrl.searchParams.get("ncsaLink") ?? "https://www.ncsasports.org/jacob-rodgers",
          gpa: "3.25",
          campName: "[Camp Name]",
          campDetail: "[Your specific camp experience here]",
          newFilmTitle: "2026 Offseason Highlights",
          seasonRecord: "12-1",
          seasonStats: "11 pancake blocks, 3 sacks, 1 fumble recovery",
        });

        return NextResponse.json({
          template,
          preview: filled,
        });
      }

      return NextResponse.json({ template });
    }

    // Return all templates
    const templates = getAllTemplates();
    return NextResponse.json({
      templates,
      total: templates.length,
      types: templates.map((t) => t.type),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
