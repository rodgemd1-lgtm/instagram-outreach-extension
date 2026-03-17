export interface CoachPersona {
  id: string;
  name: string;
  description: string;
  evaluationPriority: string[];
  decisionSpeed: "instant" | "fast" | "medium" | "slow";
}

export interface ABVariantSpec {
  section: string;
  experimentName: string;
  variantA: string;
  variantB: string;
  hypothesis: string;
}
