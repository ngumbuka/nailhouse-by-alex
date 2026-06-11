import { ASSETS } from "@/lib/assets";

export type CategoryInfo = {
  slug: string;
  category: string;
  title: string;
  tagline: string;
  intro: string;
  duration: string;
  image: string;
  highlights: string[];
  care: string[];
  ritual: { title: string; description: string }[];
  whyUs: string[];
  gallery: string[];
  faq: { q: string; a: string }[];
  bestFor: string;
};

export const CATEGORIES: CategoryInfo[] = [
  {
    slug: "mains",
    category: "Soins des mains",
    title: "Soins des mains",
    tagline: "Manucure boutique",
    intro:
      "Un rituel complet pour des mains soignées : limage sur-mesure, soin des cuticules, gommage et massage hydratant. La pose est précise, élégante et adaptée à la forme naturelle de vos ongles.",
    duration: "45 min – 1 h 15",
    image: ASSETS.burgundyManicure,
    highlights: [
      "Limage et mise en forme personnalisée",
      "Soin des cuticules au repousse-cuticules",
      "Massage des mains à l'huile nourrissante",
      "Finition vernis classique ou semi-permanent",
    ],
    care: [
      "Hydrater les cuticules quotidiennement avec une huile dédiée.",
      "Porter des gants pour les tâches ménagères pour préserver la pose.",
      "Éviter d'utiliser les ongles comme outils — privilégier la pulpe du doigt.",
    ],
  },
  {
    slug: "pieds",
    category: "Soins des pieds",
    title: "Soins des pieds",
    tagline: "Pédicure & spa",
    intro:
      "Bain tiède, gommage, soin des callosités et massage relaxant : une parenthèse bien-être pour des pieds doux et reposés. La finition est nette, durable et confortable.",
    duration: "45 min – 1 h 15",
    image: ASSETS.salonPedicure,
    highlights: [
      "Bain de pieds aromatique et gommage",
      "Soin des callosités et des ongles",
      "Massage des pieds détente",
      "Finition vernis classique, semi-permanent ou gainage",
    ],
    care: [
      "Hydrater chaque soir avec une crème pieds riche.",
      "Privilégier des chaussures confortables pendant 24 h après la pose.",
      "Pédicure d'entretien conseillée toutes les 4 à 6 semaines.",
    ],
  },
  {
    slug: "naturels-renforces",
    category: "Ongles naturels renforcés",
    title: "Ongles naturels renforcés",
    tagline: "Gainage, gel et renforcement",
    intro:
      "Une couche de gel travaillée sur l'ongle naturel pour le renforcer, le protéger et l'embellir — sans capsules. Idéal pour les ongles fins ou cassants, avec un rendu fin et lumineux.",
    duration: "1 h 15 – 2 h",
    image: ASSETS.workstation,
    highlights: [
      "Renforcement de l'ongle naturel sans capsule",
      "Pose discrète, fine et confortable",
      "Compatible vernis semi-permanent ou nail art",
      "Remplissage conseillé toutes les 3 à 4 semaines",
    ],
    care: [
      "Ne pas arracher la pose — toujours passer par une dépose en institut.",
      "Hydrater les cuticules pour favoriser la tenue.",
      "Prévoir un remplissage avant 4 semaines pour préserver la solidité.",
    ],
  },
  {
    slug: "biab",
    category: "Ongle naturel BIAB",
    title: "BIAB — Builder In A Bottle",
    tagline: "Renforcement naturel nouvelle génération",
    intro:
      "Le BIAB est un gel de construction souple et autolissant, parfait pour renforcer l'ongle naturel sans agresser. Très léger en porter, il offre une excellente tenue et un rendu naturel.",
    duration: "1 h 15 – 1 h 45",
    image: ASSETS.ledLamp,
    highlights: [
      "Renforcement naturel, sans capsule",
      "Tenue jusqu'à 3–4 semaines",
      "Compatible avec le semi-permanent",
      "Remplissage possible pour préserver vos longueurs",
    ],
    care: [
      "Toujours faire déposer en institut, jamais arracher.",
      "Huile cuticule quotidienne pour la souplesse.",
      "Remplissage toutes les 3 à 4 semaines.",
    ],
  },
  {
    slug: "capsules",
    category: "Capsule sur ongle",
    title: "Capsules & extensions",
    tagline: "Allonger, sculpter, sublimer",
    intro:
      "Pour rallonger vos ongles ou créer une forme dessinée — amande, ballerine, carré long. Pose précise sur capsules, finition gel, polygel ou pose américaine selon le rendu souhaité.",
    duration: "1 h 45 – 2 h 30",
    image: ASSETS.polkaDotNails,
    highlights: [
      "Pose de capsules sur-mesure",
      "Finition gel, polygel ou pose américaine",
      "Formes au choix : amande, ballerine, carré, stiletto",
      "Remplissage toutes les 3 à 4 semaines",
    ],
    care: [
      "Éviter les chocs les premières heures après la pose.",
      "Hydrater les cuticules quotidiennement.",
      "Dépose obligatoire en institut pour préserver l'ongle naturel.",
    ],
  },
  {
    slug: "supplements",
    category: "Supplément",
    title: "Suppléments & nail art",
    tagline: "Strass, chrome, effets, dessins",
    intro:
      "Personnalisez votre pose avec des finitions couture : strass posés un à un, chrome miroir, french élégante, dessins fins ou effets matières. Compatible avec toutes nos prestations.",
    duration: "+ 15 à 30 min",
    image: ASSETS.coffeeEasel,
    highlights: [
      "Strass premium posés à la main",
      "Effets chrome, miroir, holographique",
      "French, baby boomer, dessins fins",
      "Personnalisation sur une ou plusieurs nails",
    ],
    care: [
      "Top coat de protection inclus pour la tenue des décors.",
      "Éviter les détergents agressifs sans gants.",
      "Repassez nous voir si un strass se décolle — on le replace gracieusement.",
    ],
  },
  {
    slug: "depose",
    category: "Dépose",
    title: "Dépose en institut",
    tagline: "Gel, gainage, semi-permanent",
    intro:
      "Une dépose réalisée dans les règles pour préserver l'ongle naturel — limage doux, soin réparateur et conseils personnalisés. Indispensable entre deux poses.",
    duration: "30 – 45 min",
    image: ASSETS.basketsCorner,
    highlights: [
      "Dépose douce de toutes vos poses",
      "Soin réparateur de l'ongle naturel",
      "Conseils personnalisés pour la suite",
      "Possibilité d'enchaîner avec une nouvelle pose",
    ],
    care: [
      "Ne jamais arracher une pose à la maison.",
      "Prévoyez une cure d'huile cuticule après chaque dépose.",
      "Pause de quelques jours possible si l'ongle est fatigué.",
    ],
  },
];

export const CATEGORY_BY_SLUG: Record<string, CategoryInfo> = Object.fromEntries(
  CATEGORIES.map((c) => [c.slug, c]),
);

export const SLUG_BY_CATEGORY: Record<string, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.category, c.slug]),
);
