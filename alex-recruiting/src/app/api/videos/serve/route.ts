import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import { createReadStream, statSync } from "fs";
import path from "path";

// Allowlisted directories for security
const ALLOWED_DIRS = [
  `${process.env.HOME}/Desktop/2025 Football Videos`,
  `${process.env.HOME}/Library/CloudStorage`,
  "/tmp/alex-recruiting-export",
];

function isPathAllowed(filePath: string): boolean {
  const resolved = path.resolve(filePath);
  return ALLOWED_DIRS.some((dir) => resolved.startsWith(dir));
}

export async function GET(req: NextRequest) {
  try {
    const filePath = req.nextUrl.searchParams.get("path");

    if (!filePath) {
      return NextResponse.json(
        { error: "path parameter is required" },
        { status: 400 }
      );
    }

    const resolved = path.resolve(filePath);

    // Path traversal protection
    if (resolved !== filePath && !isPathAllowed(resolved)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    if (!isPathAllowed(resolved)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Verify file exists
    try {
      await fs.access(resolved);
    } catch {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const stat = statSync(resolved);
    const fileSize = stat.size;
    const ext = path.extname(resolved).toLowerCase();
    const mimeMap: Record<string, string> = {
      ".mp4": "video/mp4",
      ".mov": "video/quicktime",
      ".m4v": "video/x-m4v",
      ".avi": "video/x-msvideo",
      ".mkv": "video/x-matroska",
      ".wmv": "video/x-ms-wmv",
    };
    const contentType = mimeMap[ext] || "application/octet-stream";

    const rangeHeader = req.headers.get("range");

    if (rangeHeader) {
      const match = rangeHeader.match(/bytes=(\d+)-(\d*)/);
      if (match) {
        const start = parseInt(match[1], 10);
        const end = match[2] ? parseInt(match[2], 10) : fileSize - 1;
        const chunkSize = end - start + 1;

        const stream = createReadStream(resolved, { start, end });
        const readable = new ReadableStream({
          start(controller) {
            stream.on("data", (chunk) => controller.enqueue(typeof chunk === "string" ? Buffer.from(chunk) : chunk));
            stream.on("end", () => controller.close());
            stream.on("error", (err) => controller.error(err));
          },
        });

        return new NextResponse(readable, {
          status: 206,
          headers: {
            "Content-Range": `bytes ${start}-${end}/${fileSize}`,
            "Accept-Ranges": "bytes",
            "Content-Length": String(chunkSize),
            "Content-Type": contentType,
          },
        });
      }
    }

    // Full file response
    const stream = createReadStream(resolved);
    const readable = new ReadableStream({
      start(controller) {
        stream.on("data", (chunk) => controller.enqueue(typeof chunk === "string" ? Buffer.from(chunk) : chunk));
        stream.on("end", () => controller.close());
        stream.on("error", (err) => controller.error(err));
      },
    });

    return new NextResponse(readable, {
      status: 200,
      headers: {
        "Accept-Ranges": "bytes",
        "Content-Length": String(fileSize),
        "Content-Type": contentType,
      },
    });
  } catch (error) {
    console.error("Video serve failed:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
