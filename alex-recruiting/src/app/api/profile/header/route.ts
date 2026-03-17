import fs from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import {
  updateProfileBanner,
} from "@/lib/integrations/x-api";

export const dynamic = "force-dynamic";

async function loadHeaderFromPublicDir(): Promise<string | null> {
  try {
    const filePath = path.join(process.cwd(), "public", "header-image.png");
    const buffer = await fs.readFile(filePath);
    return buffer.toString("base64");
  } catch {
    return null;
  }
}

async function loadHeaderFromStaticAsset(req: NextRequest): Promise<string | null> {
  try {
    const assetUrl = new URL("/header-image.png", req.url);
    const response = await fetch(assetUrl, { cache: "no-store" });
    if (!response.ok) {
      return null;
    }
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer).toString("base64");
  } catch {
    return null;
  }
}

async function tryGenerateHeaderImage(): Promise<{
  outputPath: string;
  base64: string;
} | null> {
  try {
    const mod = await import("@/lib/header/generate-header");
    const outputPath = await mod.generateHeaderImage();
    const base64 = (await fs.readFile(outputPath)).toString("base64");
    return { outputPath, base64 };
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const upload = req.nextUrl.searchParams.get("upload") === "true";

    if (upload) {
      const base64 =
        (await loadHeaderFromPublicDir()) ??
        (await loadHeaderFromStaticAsset(req)) ??
        (await tryGenerateHeaderImage())?.base64 ??
        null;

      if (!base64) {
        return NextResponse.json(
          {
            error:
              "No header image is available to upload. Generate one locally first or ensure /header-image.png is deployed.",
          },
          { status: 404 }
        );
      }

      const uploaded = await updateProfileBanner(base64);

      if (!uploaded) {
        return NextResponse.json(
          { error: "Failed to upload the current header image to X." },
          { status: 502 }
        );
      }

      return NextResponse.json({
        success: true,
        uploaded: true,
        path: "/header-image.png",
        uploadMessage: "Current header image uploaded to X profile.",
      });
    }

    const generated = await tryGenerateHeaderImage();
    if (!generated) {
      return NextResponse.json(
        {
          error:
            "Header generation requires a local browser runtime. Run this action on localhost, or use the current deployed header and choose upload instead.",
        },
        { status: 501 }
      );
    }

    return NextResponse.json({
      success: true,
      path: "/header-image.png",
      localPath: generated.outputPath,
      uploadMessage: "Header image generated locally.",
    });
  } catch (error) {
    console.error("Header generation error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to generate header image";
    const status = /profile-tools account|credentials are configured/i.test(message)
      ? 503
      : 500;
    return NextResponse.json(
      { error: message },
      { status }
    );
  }
}
