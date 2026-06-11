import type { CategoryInfo } from "./service-categories";

export type ServiceLike = {
  id: string;
  name: string;
  category: string;
  price_fcfa: number;
};

export type ServiceCopy = {
  tagline: string;
  intro: string;
  whatItIs: string;
  forWhom: string;
  finalNote: string;
};

/**
 * Auto-derive a focused, editorial copy block for an individual service
 * from its parent category. Adds light keyword-based variation so two
 * services in the same category don't read identically.
 */
export function buildServiceCopy(service: ServiceLike, info: CategoryInfo): ServiceCopy {
  const n = service.name.toLowerCase();

  const flavor: string[] = [];
  if (/\bspa\b/.test(n)) flavor.push("Une parenthèse plus enveloppante, pensée pour la détente profonde.");
  if (/remplissage|retouche/.test(n)) flavor.push("Idéale pour entretenir une pose existante et prolonger sa tenue.");
  if (/construction|gel|polygel|extension|rallonge|gel x/.test(n)) flavor.push("Sculptée à la main pour une forme nette et un porter léger.");
  if (/semi-permanent|vernis/.test(n)) flavor.push("Finition longue tenue, brillance signature jusqu'à trois semaines.");
  if (/biab/.test(n)) flavor.push("Gel autolissant souple, respectueux de l'ongle naturel.");
  if (/gainage/.test(n)) flavor.push("Une fine couche protectrice qui renforce sans alourdir.");
  if (/strass|chrome|effet|dessin|nail art/.test(n)) flavor.push("Un détail couture posé à la main, jamais deux fois identique.");
  if (/dépose|depose/.test(n)) flavor.push("Réalisée dans les règles pour préserver l'ongle naturel.");
  if (/français|french|baby boomer/.test(n)) flavor.push("Une finition classique, intemporelle, toujours élégante.");

  const whatItIs = `${service.name} fait partie de notre carte ${info.title.toLowerCase()}. ${info.intro}`;
  const forWhom = `Pensée ${info.bestFor.toLowerCase()}`;
  const finalNote = flavor[0] ?? "Chaque geste est exécuté avec soin, dans le respect du temps et de l'ongle.";

  return {
    tagline: info.tagline,
    intro: info.intro,
    whatItIs,
    forWhom,
    finalNote,
  };
}
