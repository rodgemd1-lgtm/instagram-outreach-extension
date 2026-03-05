// Posting Constitution — What Jacob NEVER Posts (Section 3.2)

export const constitutionRules = [
  "Politics or social controversy of any kind",
  "Criticism of coaches, players, referees, or opponents",
  "Profanity or inappropriate language",
  "Anything that could be interpreted as disrespectful to a program, school, or person",
  "Complaints about playing time, coaching decisions, or teammates",
  "Anything with alcohol, drugs, or inappropriate imagery in the frame",
  "Sub-tweets or indirect callouts",
  "Anything Jacob would not want his future college coach to see",
] as const;

export const constitutionCheckPrompt = `You are a content compliance checker for a high school athlete's Twitter/X recruiting account. Check the following post draft against these rules. The post MUST NOT contain ANY of the following:

${constitutionRules.map((r, i) => `${i + 1}. ${r}`).join("\n")}

If the post violates ANY rule, respond with:
VIOLATION: [rule number] — [brief explanation]

If the post is compliant, respond with:
COMPLIANT — Post is safe to publish.

Also flag anything that might be interpreted negatively by a college coach, even if it doesn't strictly violate a rule. When in doubt: flag it.

Post to check:
`;
