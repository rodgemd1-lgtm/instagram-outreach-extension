import Anthropic from "@anthropic-ai/sdk";
import { jacobProfile } from "../data/jacob-profile";
import { constitutionRules } from "../data/constitution";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const ALEX_SYSTEM_PROMPT = `You are Alex, a sports recruiting intelligence assistant. Your athlete is Jacob Rodgers — Class of 2029 Offensive Lineman, 6'4" 285 lbs, Pewaukee High School, Wisconsin.

You manage Jacob's entire X/Twitter recruiting presence using the Double Black Box framework.

JACOB'S PROFILE:
- Name: ${jacobProfile.name}
- Position: ${jacobProfile.positionFull} (${jacobProfile.position})
- Size: ${jacobProfile.height}, ${jacobProfile.weight}
- School: ${jacobProfile.school}, ${jacobProfile.state}
- Class: ${jacobProfile.classYear}
- Handle: ${jacobProfile.xHandle}
- Training: IMG Academy

CONTENT PILLARS:
1. On-Field Performance (40%) — Film clips, game highlights, stat updates
2. Work Ethic & Training (40%) — Training videos, camp content, IMG footage
3. Character & Personal Brand (20%) — Academic achievements, team moments, community

POSTING CONSTITUTION — Jacob NEVER posts:
${constitutionRules.map((r, i) => `${i + 1}. ${r}`).join("\n")}

COMPETITIVE ADVANTAGES:
${jacobProfile.competitiveAdvantages.map((a) => `- ${a}`).join("\n")}

CORE MESSAGE: ${jacobProfile.coreMessage}

YOUR TOOLS: Exa (coach discovery), Firecrawl (school data scraping), Brave (trend monitoring), X API (social data), Amplify (engagement alerts), Jib CRM (database).

RULES:
- Draft every post and DM for review before sending — nothing posts without explicit user approval
- Enforce the posting constitution — flag any draft that violates the rules
- Present coach intelligence in ranked priority order (Tier 3 first for DMs, Tier 1 for engagement)
- When suggesting posts, include: content, pillar tag, hashtags, best posting time, and media suggestion
- When generating DMs, personalize each one with specific school/coach details
- Track the Double Black Box phases and indicate which phase current work belongs to
- Be direct, actionable, and data-driven in all responses`;

export async function streamAlexResponse(
  messages: { role: "user" | "assistant"; content: string }[]
) {
  const stream = await client.messages.stream({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    system: ALEX_SYSTEM_PROMPT,
    messages,
  });

  return stream;
}

export async function generatePostDrafts(context: string): Promise<string> {
  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2048,
    system: ALEX_SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Generate 3 post draft options for Jacob based on the following context. For each draft include: the post text, content pillar, hashtags (3-5), best posting time, and media suggestion.

Context: ${context}`,
      },
    ],
  });

  return response.content[0].type === "text" ? response.content[0].text : "";
}

export async function checkConstitution(postContent: string): Promise<{
  compliant: boolean;
  message: string;
}> {
  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 512,
    messages: [
      {
        role: "user",
        content: `Check this post against Jacob Rodgers' posting constitution. Rules:
${constitutionRules.map((r, i) => `${i + 1}. ${r}`).join("\n")}

Post: "${postContent}"

If compliant, respond: COMPLIANT
If violation, respond: VIOLATION: [rule number] — [explanation]`,
      },
    ],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  const compliant = text.startsWith("COMPLIANT");

  return { compliant, message: text };
}

export async function generateDMDraft(
  coachName: string,
  schoolName: string,
  templateType: string,
  context: string
): Promise<string> {
  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    system: ALEX_SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Generate a personalized DM for Coach ${coachName} at ${schoolName}. Template type: ${templateType}. Additional context: ${context}. Keep it under 280 characters if possible, professional, and genuine.`,
      },
    ],
  });

  return response.content[0].type === "text" ? response.content[0].text : "";
}

export async function generateIntelligenceReport(data: string): Promise<string> {
  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    system: ALEX_SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Generate a weekly recruiting intelligence report based on this data:\n${data}\n\nInclude: coach engagement summary, post performance analysis, DM response rates, recommended next actions, and any alerts.`,
      },
    ],
  });

  return response.content[0].type === "text" ? response.content[0].text : "";
}
