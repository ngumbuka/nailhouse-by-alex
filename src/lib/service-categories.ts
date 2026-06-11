// Per-service imagery (premium AI-generated, burgundy couture style).
import mainsHero from "@/assets/services/mains-hero.jpg";
import mainsFlat from "@/assets/services/mains-flat.jpg";
import piedsHero from "@/assets/services/pieds-hero.jpg";
import piedsFlat from "@/assets/services/pieds-flat.jpg";
import naturelsHero from "@/assets/services/naturels-renforces-hero.jpg";
import naturelsFlat from "@/assets/services/naturels-renforces-flat.jpg";
import biabHero from "@/assets/services/biab-hero.jpg";
import biabFlat from "@/assets/services/biab-flat.jpg";
import capsulesHero from "@/assets/services/capsules-hero.jpg";
import capsulesFlat from "@/assets/services/capsules-flat.jpg";
import supplementsHero from "@/assets/services/supplements-hero.jpg";
import supplementsFlat from "@/assets/services/supplements-flat.jpg";
import deposeHero from "@/assets/services/depose-hero.jpg";
import deposeFlat from "@/assets/services/depose-flat.jpg";

export type CategoryInfo = {
  slug: string;
  category: string;
  title: string;
  tagline: string;
  intro: string;
  duration: string;
  image: string;
  flat: string;
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
    tagline: "Manucure couture",
    intro:
      "Un rituel complet pour des mains soignées : limage sur-mesure, soin des cuticules, gommage et massage hydratant. La pose est précise, élégante et adaptée à la forme naturelle de vos ongles.",
    duration: "45 min – 1 h 15",
    image: mainsHero,
    flat: mainsFlat,
    bestFor: "Pour les femmes qui veulent des mains soignées au quotidien, prêtes à briller en réunion comme en sortie.",
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
    ritual: [
      { title: "Diagnostic & accueil", description: "On échange sur vos envies, votre quotidien et la forme idéale." },
      { title: "Préparation", description: "Limage, mise en forme et soin doux des cuticules." },
      { title: "Gommage & massage", description: "Exfoliation sucrée et massage à l'huile nourrissante." },
      { title: "Pose & finition", description: "Vernis classique ou semi-permanent, sceller, sublimer." },
    ],
    whyUs: [
      "Outils stérilisés à chaque cliente.",
      "Produits professionnels haut de gamme.",
      "Conseil sur-mesure selon la forme de vos ongles.",
    ],
    gallery: [mainsHero, mainsFlat],
    faq: [
      { q: "Combien de temps tient la pose ?", a: "Vernis classique : 5 à 7 jours. Semi-permanent : jusqu'à 3 semaines." },
      { q: "Puis-je venir avec une ancienne pose ?", a: "Oui, prévoyez une dépose en supplément pour préserver l'ongle naturel." },
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
    image: piedsHero,
    flat: piedsFlat,
    bestFor: "Pour celles qui veulent des pieds impeccables — saison des sandales ou bien-être tout au long de l'année.",
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
    ritual: [
      { title: "Bain relaxant", description: "Bain tiède aromatique pour assouplir et détendre." },
      { title: "Soin des callosités", description: "Gommage et lissage doux des zones rugueuses." },
      { title: "Massage", description: "Massage des pieds et mollets à la crème nourrissante." },
      { title: "Finition", description: "Pose vernis, semi-permanent ou gainage au choix." },
    ],
    whyUs: [
      "Cabine pédicure dédiée, confortable et hygiénique.",
      "Instruments stérilisés pour chaque rendez-vous.",
      "Conseils personnalisés pour l'entretien à domicile.",
    ],
    gallery: [piedsHero, piedsFlat],
    faq: [
      { q: "C'est douloureux ?", a: "Non, le soin est entièrement non invasif et relaxant." },
      { q: "Quelle finition choisir l'été ?", a: "Le semi-permanent est idéal — tenue 3 semaines, brillance intacte." },
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
    image: naturelsHero,
    flat: naturelsFlat,
    bestFor: "Pour les ongles fins, cassants ou qui peinent à pousser — sans alourdir, sans agresser.",
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
    ritual: [
      { title: "Préparation", description: "Limage doux et préparation de l'ongle naturel." },
      { title: "Pose de la base", description: "Application d'une base renforçante adaptée." },
      { title: "Gainage", description: "Modelage du gel pour une protection invisible." },
      { title: "Finition", description: "Top coat brillant ou mat, vernis au choix." },
    ],
    whyUs: [
      "Produits hypoallergéniques et non agressifs.",
      "Pose fine, naturelle, jamais trop épaisse.",
      "Suivi entre deux rendez-vous offert par WhatsApp.",
    ],
    gallery: [naturelsHero, naturelsFlat],
    faq: [
      { q: "Cela abîme-t-il l'ongle ?", a: "Non, à condition de respecter la dépose en institut." },
      { q: "Puis-je ajouter du nail art ?", a: "Oui, tous nos décors sont compatibles." },
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
    image: biabHero,
    flat: biabFlat,
    bestFor: "Pour les femmes qui veulent une pose durable, naturelle et confortable au quotidien.",
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
    ritual: [
      { title: "Préparation douce", description: "Repousse-cuticules et mat doux sur l'ongle naturel." },
      { title: "Application BIAB", description: "Pose du gel autolissant en fine couche." },
      { title: "Catalysation", description: "Séchage LED pour une accroche optimale." },
      { title: "Finition couleur", description: "Top brillant, mat, ou pose semi-permanent." },
    ],
    whyUs: [
      "Gel premium importé, formulation souple.",
      "Pose réalisée par une experte certifiée BIAB.",
      "Remplissage à tarif préférentiel sous 4 semaines.",
    ],
    gallery: [biabHero, biabFlat],
    faq: [
      { q: "Quelle différence avec un gel classique ?", a: "Le BIAB est plus souple, plus léger et respecte mieux l'ongle naturel." },
      { q: "Puis-je rallonger avec du BIAB ?", a: "Légèrement, oui. Pour de vraies extensions, optez pour les capsules." },
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
    image: capsulesHero,
    flat: capsulesFlat,
    bestFor: "Pour un événement, un mariage, ou simplement pour oser une forme et une longueur signature.",
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
    ritual: [
      { title: "Choix de la forme", description: "Amande, ballerine, carré, stiletto — selon votre style." },
      { title: "Pose des capsules", description: "Ajustement précis et collage sécurisé." },
      { title: "Modelage", description: "Sculpture du gel ou polygel pour un rendu fin." },
      { title: "Couleur & décor", description: "Pose couleur, french, baby boomer, strass au choix." },
    ],
    whyUs: [
      "Pose minutieuse — chaque ongle est sculpté à la main.",
      "Large bibliothèque de formes et de décors.",
      "Conseils pour adapter la longueur à votre quotidien.",
    ],
    gallery: [capsulesHero, capsulesFlat],
    faq: [
      { q: "C'est lourd à porter ?", a: "Non, nos poses sont travaillées pour être fines et confortables." },
      { q: "Combien de temps ça tient ?", a: "3 à 4 semaines, avec un remplissage conseillé ensuite." },
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
    image: supplementsHero,
    flat: supplementsFlat,
    bestFor: "Pour celles qui veulent une touche unique — un détail qui transforme une pose en bijou.",
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
    ritual: [
      { title: "Inspiration", description: "On regarde ensemble vos références ou vous propose un moodboard." },
      { title: "Préparation", description: "Pose de base couleur ou french selon le design." },
      { title: "Décor à la main", description: "Strass, chrome ou dessins minutieux." },
      { title: "Scellage longue tenue", description: "Top coat renforcé pour préserver chaque détail." },
    ],
    whyUs: [
      "Strass et chrome premium, jamais ternes.",
      "Designs sur-mesure, jamais deux poses identiques.",
      "Retouche d'un strass offerte sous 7 jours.",
    ],
    gallery: [supplementsHero, supplementsFlat],
    faq: [
      { q: "Puis-je n'orner qu'un seul ongle ?", a: "Bien sûr — beaucoup de clientes choisissent un accent nail." },
      { q: "Les strass tiennent-ils ?", a: "Oui, scellés au top coat, ils tiennent toute la durée de la pose." },
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
    image: deposeHero,
    flat: deposeFlat,
    bestFor: "Pour préserver vos ongles entre deux poses, ou avant une cure de récupération.",
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
    ritual: [
      { title: "Diagnostic", description: "On évalue l'état de la pose et de l'ongle naturel." },
      { title: "Dépose douce", description: "Ponçage minutieux ou trempage selon la pose." },
      { title: "Soin réparateur", description: "Nourrissage et lissage de l'ongle naturel." },
      { title: "Conseil", description: "On vous oriente vers la suite : pause, BIAB, nouvelle pose." },
    ],
    whyUs: [
      "Aucun arrachage — votre ongle naturel reste intact.",
      "Soin réparateur inclus systématiquement.",
      "Tarif dégressif si vous enchaînez avec une nouvelle pose.",
    ],
    gallery: [deposeHero, deposeFlat],
    faq: [
      { q: "Combien de temps prévoir ?", a: "Environ 30 à 45 minutes selon le type de pose." },
      { q: "Puis-je reposer juste après ?", a: "Oui, c'est souvent l'idéal pour préserver vos ongles." },
    ],
  },
];

export const CATEGORY_BY_SLUG: Record<string, CategoryInfo> = Object.fromEntries(
  CATEGORIES.map((c) => [c.slug, c]),
);

export const SLUG_BY_CATEGORY: Record<string, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.category, c.slug]),
);
