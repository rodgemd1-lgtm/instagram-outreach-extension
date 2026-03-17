import { describe, it, expect } from "vitest";
import { buildIngestionPayload, validateUrl } from "@/lib/research/ingest";

describe("research ingestion", () => {
  it("builds valid ingestion payload for coach_psychology", () => {
    const payload = buildIngestionPayload(
      "https://www.ncsasports.org/how-to-get-recruited",
      "coach_psychology"
    );
    expect(payload.url).toBe("https://www.ncsasports.org/how-to-get-recruited");
    expect(payload.data_type).toBe("coach_psychology");
    expect(payload.company_id).toBe("alex-recruiting");
  });

  it("validates URLs correctly", () => {
    expect(validateUrl("https://example.com")).toBe(true);
    expect(validateUrl("not-a-url")).toBe(false);
    expect(validateUrl("")).toBe(false);
  });

  it("rejects disallowed domains", () => {
    expect(validateUrl("https://localhost:3000")).toBe(false);
  });
});
