import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

const FFPROBE_PATH = "/opt/homebrew/bin/ffprobe";

export interface VideoProbeResult {
  duration: number;
  width: number;
  height: number;
  codec: string;
  bitrate: number;
}

export async function probeVideo(filePath: string): Promise<VideoProbeResult> {
  const { stdout } = await execFileAsync(FFPROBE_PATH, [
    "-v", "quiet",
    "-print_format", "json",
    "-show_format",
    "-show_streams",
    filePath,
  ]);

  const data = JSON.parse(stdout);
  const videoStream = data.streams?.find(
    (s: { codec_type: string }) => s.codec_type === "video"
  );

  return {
    duration: parseFloat(data.format?.duration ?? "0"),
    width: videoStream?.width ?? 0,
    height: videoStream?.height ?? 0,
    codec: videoStream?.codec_name ?? "unknown",
    bitrate: parseInt(data.format?.bit_rate ?? "0", 10),
  };
}
