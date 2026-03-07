import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const upload = req.nextUrl.searchParams.get("upload") === "true";

    // Puppeteer requires a full Chrome binary — only works locally, not on Vercel serverless.
    let generateHeaderImage: typeof import("@/lib/header/generate-header").generateHeaderImage;
    let getHeaderImageBase64: typeof import("@/lib/header/generate-header").getHeaderImageBase64;
    try {
      const mod = await import("@/lib/header/generate-header");
      generateHeaderImage = mod.generateHeaderImage;
      getHeaderImageBase64 = mod.getHeaderImageBase64;
    } catch {
      return NextResponse.json(
        { error: "Header generation requires Puppeteer which is only available locally. Run this endpoint on localhost." },
        { status: 501 }
      );
    }

    const outputPath = await generateHeaderImage();

    const response: Record<string, unknown> = {
      success: true,
      path: "/header-image.png",
      localPath: outputPath,
    };

    if (upload) {
      const { updateProfileBanner } = await import("@/lib/integrations/x-api");
      const base64 = await getHeaderImageBase64();
      const uploaded = await updateProfileBanner(base64);
      response.uploaded = uploaded;
      response.uploadMessage = uploaded
        ? "Header image uploaded to X profile"
        : "Failed to upload header image to X";
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Header generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate header image" },
      { status: 500 }
    );
  }
}
