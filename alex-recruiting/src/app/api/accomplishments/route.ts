import { NextRequest, NextResponse } from "next/server";
import {
  addAccomplishment,
  getAccomplishments,
  markPosted,
} from "@/lib/accomplishments/store";
import { postTweet } from "@/lib/integrations/x-api";

export const dynamic = "force-dynamic";

// GET — List all accomplishments
export async function GET() {
  const accomplishments = await getAccomplishments();
  return NextResponse.json({ accomplishments, total: accomplishments.length });
}

// POST — Add new accomplishment (optionally post to X)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { type, title, value, unit, mediaUrl, mediaPath, postToX } = body;

    if (!type || !title || !value || !unit) {
      return NextResponse.json(
        { error: "Missing required fields: type, title, value, unit" },
        { status: 400 }
      );
    }

    if (!["pr", "award", "milestone"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid type. Must be pr, award, or milestone" },
        { status: 400 }
      );
    }

    const accomplishment = await addAccomplishment({
      type,
      title,
      value,
      unit,
      mediaUrl: mediaUrl ?? null,
      mediaPath: mediaPath ?? null,
    });

    // Optionally post to X
    if (postToX) {
      const caption = generateCaption(type, title, value, unit);
      const result = await postTweet(caption);

      if (result) {
        await markPosted(accomplishment.id, result.id);
        accomplishment.postedToX = true;
        accomplishment.tweetId = result.id;
      }
    }

    return NextResponse.json(accomplishment, { status: 201 });
  } catch (error) {
    console.error("Failed to add accomplishment:", error);
    return NextResponse.json(
      { error: "Failed to add accomplishment" },
      { status: 500 }
    );
  }
}

// PATCH — Mark an accomplishment as posted to X
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, type, title, value, unit } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Missing required field: id" },
        { status: 400 }
      );
    }

    const caption = generateCaption(
      type ?? "pr",
      title ?? "",
      value ?? "",
      unit ?? ""
    );
    const result = await postTweet(caption);

    if (!result) {
      return NextResponse.json(
        { error: "Failed to post to X" },
        { status: 500 }
      );
    }

    await markPosted(id, result.id);

    return NextResponse.json({ success: true, tweetId: result.id });
  } catch (error) {
    console.error("Failed to post accomplishment to X:", error);
    return NextResponse.json(
      { error: "Failed to post to X" },
      { status: 500 }
    );
  }
}

function generateCaption(
  type: string,
  title: string,
  value: string,
  unit: string
): string {
  if (type === "pr") {
    return `New PR! ${title}: ${value} ${unit} \u{1F4AA}\n\nJacob Rodgers | #79 | OL | Pewaukee HS '29\n#ClassOf2029 #OLine #StrengthTraining`;
  }

  if (type === "award") {
    return `${title}: ${value} ${unit} \u{1F3C6}\n\nJacob Rodgers | #79 | OL | Pewaukee HS '29\n#ClassOf2029 #OLine #Football`;
  }

  // milestone
  return `Milestone reached! ${title}: ${value} ${unit} \u{1F4A5}\n\nJacob Rodgers | #79 | OL | Pewaukee HS '29\n#ClassOf2029 #OLine #RecruitingJourney`;
}
