interface ByteRange {
  start: number;
  end: number;
  chunkSize: number;
}

export function parseByteRange(
  rangeHeader: string | null,
  fileSize: number
): ByteRange | null | "unsatisfiable" {
  if (!rangeHeader) {
    return null;
  }

  const match = rangeHeader.match(/bytes=(\d+)-(\d*)/);
  if (!match) {
    return null;
  }

  const start = Number.parseInt(match[1], 10);
  if (!Number.isFinite(start) || Number.isNaN(start) || start < 0) {
    return "unsatisfiable";
  }

  let end = match[2] ? Number.parseInt(match[2], 10) : fileSize - 1;
  if (!Number.isFinite(end) || Number.isNaN(end)) {
    return "unsatisfiable";
  }

  if (start >= fileSize) {
    return "unsatisfiable";
  }

  end = Math.min(end, fileSize - 1);
  if (end < start) {
    return "unsatisfiable";
  }

  return {
    start,
    end,
    chunkSize: end - start + 1,
  };
}
