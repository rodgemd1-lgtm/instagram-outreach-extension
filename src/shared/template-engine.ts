export interface TemplateContext {
  firstName: string;
  name: string;
  username: string;
  [key: string]: string;
}

const KNOWN_VARS = ['firstName', 'name', 'username'];

export function renderTemplate(template: string, context: TemplateContext): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return context[key] ?? match;
  });
}

export function validateTemplate(template: string): {
  valid: boolean;
  unknownVars: string[];
  usedVars: string[];
} {
  const matches = template.match(/\{(\w+)\}/g) || [];
  const usedVars = matches.map((v) => v.slice(1, -1));
  const unknownVars = usedVars.filter((v) => !KNOWN_VARS.includes(v));
  return { valid: unknownVars.length === 0, unknownVars, usedVars };
}

export function previewTemplate(template: string): string {
  return renderTemplate(template, {
    firstName: 'Alex',
    name: 'Alex Johnson',
    username: 'alexj',
  });
}
