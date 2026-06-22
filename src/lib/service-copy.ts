import type { CategoryInfo } from "./service-categories";

export type ServiceLike = {
  id: string;
  name: string;
  category: string;
  price_fcfa: number;
  description?: string;
  description_en?: string;
  duration?: string;
  best_for?: string;
  best_for_en?: string;
};

export type ServiceCopy = {
  tagline: string;
  intro: string;
  whatItIs: string;
  forWhom: string;
  finalNote: string;
};

/**
 * Auto-derive a focused, editorial copy block for an individual service.
 * Prioritizes dynamic values stored in services.json, falling back to
 * keyword matching and category defaults.
 */
export function buildServiceCopy(
  service: ServiceLike,
  info: CategoryInfo,
  language = "fr",
): ServiceCopy {
  const name = service.name.toLowerCase();

  // 1. Determine whatItIs (description)
  let whatItIs = service.description || "";

  // 2. Determine forWhom (best for)
  let forWhom = service.best_for || "";
  if (forWhom && !forWhom.endsWith(".")) {
    forWhom += ".";
  }

  // 3. Determine finalNote
  let finalNote = "";

  // If we didn't have custom values in JSON, run keyword match fallbacks
  if (!whatItIs) {
    if (language === "en") {
      if (name.includes("manucure classique") || name.includes("classic manicure")) {
        whatItIs =
          "A precision treatment to beautify and strengthen your hands. This ritual includes a personalized shaping to define the ideal form of your nails, a meticulous treatment of the cuticles with precision instruments, followed by a relaxing moisturizing massage and the application of a protective strengthening base.";
        forWhom =
          "Recommended for anyone wishing to have neat, elegant, and well-groomed hands on a daily basis.";
        finalNote =
          "All our instruments undergo medical-grade sterilization before your appointment.";
      } else if (name.includes("manucure spa") || name.includes("spa manicure")) {
        whatItIs =
          "The ultimate sensory experience for the beauty and comfort of your hands. It combines all the steps of our classic manicure with a gentle exfoliating scrub to remove dead cells, the application of a nourishing wrap mask, and a prolonged massage with warm oil.";
        forWhom =
          "Ideal for a pure moment of relaxation while deeply regenerating the skin of your hands.";
        finalNote = "A warm and scented parenthesis in the heart of our studio.";
      } else if (name.includes("pédicure classique") || name.includes("classic pedicure")) {
        whatItIs =
          "An essential foot treatment to restore lightness and softness. This service includes nail shaping, gentle cuticle removal, and the removal of superficial calluses, completed by a relaxing moisturizing massage.";
        forWhom = "Indicated for regular foot maintenance to keep your nails clean and healthy.";
        finalNote = "A daily touch of comfort and well-being.";
      } else if (name.includes("pédicure spa") || name.includes("spa pedicure")) {
        whatItIs =
          "The ultimate exceptional care for your feet. This complete ritual includes a relaxing foot bath with scented salts, a gentle sugar crystal scrub, an ultra-hydrating repair mask, and an enveloping massage of the feet and calves.";
        forWhom =
          "Recommended to release accumulated tension, soften the skin, and spend a moment of pure escape.";
        finalNote = "Enjoy our exclusive treatment chairs designed for your well-being.";
      } else if (name.includes("gainage biab naturel") || name.includes("natural biab")) {
        whatItIs =
          "The signature care to strengthen and beautify natural nails. BIAB gel (Builder in a Bottle) is a flexible and resistant strengthening gel that self-levels on the nail to create a solid protective structure, promoting natural growth without risk of cracking.";
        forWhom =
          "Perfect for soft, split, or brittle nails requiring solid overlay with an ultra-elegant nude finish.";
        finalNote = "Guarantees remarkable and natural wear for 3 to 4 weeks.";
      } else if (
        name.includes("biab") &&
        (name.includes("semi-permanent") || name.includes("gel polish"))
      ) {
        whatItIs =
          "The perfect alliance of the high resistance of BIAB gel and the brilliance of color. We first apply the BIAB structuring base to solidify the natural nail, followed by the semi-permanent color of your choice and a mirror-like lacquer finish.";
        forWhom =
          "Ideal for those wishing to combine the protection of an overlay with the radiance of a long-lasting couture shade.";
        finalNote = "Impeccable wear without chipping for several weeks.";
      } else if (name.includes("remplissage biab") || name.includes("biab refill")) {
        whatItIs =
          "The essential maintenance of your BIAB overlay. We gently remove the old coating, clean the cuticles, prepare the regrowth of the natural nail, and apply a new layer of BIAB gel to restore balance and strength.";
        forWhom =
          "Recommended every 3 to 4 weeks to preserve the balance of the nail and maintain a perfect aesthetic.";
        finalNote = "Allows you to maintain strong and protected nails continuously.";
      } else if (
        name.includes("gel x") ||
        name.includes("pose américaine") ||
        name.includes("gel-x")
      ) {
        whatItIs =
          "The revolutionary nail extension method. Tips composed of soft gel cover the entire nail and are fixed using a specific gel base cured under a LED lamp. This technique offers instant, thin, and strong length without damaging the natural nail plate.";
        forWhom =
          "The choice solution for those desiring perfect length and shape instantly with exceptional wearing comfort.";
        finalNote = "Fast to apply, comfortable to wear, and easy to remove.";
      } else if (
        name.includes("construction gel") ||
        name.includes("limage") ||
        name.includes("builder gel")
      ) {
        whatItIs =
          "A custom-sculpted extension or reinforcement using premium builder gel. Our modern no-excessive-filing technique preserves the health of your nails while ensuring remarkable thinness and strength.";
        forWhom =
          "Ideal for creating or modifying the shape and length of your nails with artisanal precision.";
        finalNote = "A custom structure designed by our certified technicians.";
      } else if (name.includes("rallongement") || name.includes("extension")) {
        whatItIs =
          "Technique of creating length on short, broken, or bitten nails using forms or gel tips to redesign the hand with elegance.";
        forWhom =
          "Ideal for restructuring and extending nails with a natural and resistant finish.";
        finalNote = "Allows you to obtain the shape of your dreams in a single session.";
      } else if (name.includes("semi-permanent") || name.includes("gel polish")) {
        whatItIs =
          "A premium semi-permanent gel polish application cured under a LED lamp. Includes quick cuticle care, nail shaping, and careful application of the color with a long-lasting signature shine.";
        forWhom =
          "Perfect for those looking for vibrant color and a mirror shine preserved for more than two weeks.";
        finalNote = "An infinite palette of luxury shades to discover in salon.";
      } else if (name.includes("gainage") || name.includes("overlay")) {
        whatItIs =
          "The application of a protective gel overlay on the natural nail to smooth its surface, fill in ridges, and give it the necessary resistance against daily shocks.";
        forWhom =
          "Recommended to strengthen medium-length nails without adding artificial thickness.";
        finalNote = "Protects and sublimates the natural base of your nails.";
      } else {
        whatItIs = `${service.name} is an exclusive treatment from our ${info.title.toLowerCase()} menu. ${info.intro}`;
        forWhom = `This service is particularly designed ${info.bestFor.toLowerCase()}`;
        finalNote =
          "Each step of this treatment is executed with care to respect your natural nail.";
      }
    } else {
      // Default French
      if (name.includes("manucure classique")) {
        whatItIs =
          "Un soin de précision pour embellir et fortifier vos mains. Ce rituel comprend un limage personnalisé pour définir la forme idéale de vos ongles, un traitement minutieux des cuticules avec des instruments de précision, suivi d'un massage hydratant relaxant et de la pose d'une base protectrice fortifiante.";
        forWhom =
          "Recommandé pour celles et ceux qui souhaitent des mains nettes, élégantes et soignées au quotidien.";
        finalNote =
          "Tous nos instruments subissent une stérilisation médicale complète avant votre rendez-vous.";
      } else if (name.includes("manucure spa")) {
        whatItIs =
          "L'expérience sensorielle ultime pour la beauté et le confort de vos mains. Elle associe toutes les étapes de notre manucure classique à un gommage exfoliant doux pour éliminer les cellules mortes, l'application d'un masque nourrissant enveloppant et un massage prolongé à l'huile tiède.";
        forWhom =
          "Idéal pour s'offrir une pause détente absolue tout en régénérant en profondeur la peau de ses mains.";
        finalNote = "Une parenthèse enveloppante et parfumée au cœur de notre atelier.";
      } else if (name.includes("pédicure classique")) {
        whatItIs =
          "Un soin indispensable des pieds pour retrouver légèreté et douceur. Cette prestation comprend la mise en forme des ongles, le retrait délicat des cuticules et l'élimination des callosités superficielles, complétés par un modelage hydratant relaxant.";
        forWhom =
          "Indiqué pour l'entretien régulier des pieds et pour conserver des ongles impeccables et sains.";
        finalNote = "Un geste de confort et de bien-être quotidien.";
      } else if (name.includes("pédicure spa")) {
        whatItIs =
          "Le soin d'exception ultime pour vos pieds. Ce rituel complet comprend un bain de pieds délassant aux sels parfumés, un gommage doux aux cristaux de sucre, un masque réparateur ultra-hydratant et un massage enveloppant des pieds et des mollets.";
        forWhom =
          "Recommandé pour relâcher les tensions accumulées, adoucir la peau et passer un moment de pure évasion.";
        finalNote = "Profitez de nos fauteuils de soins exclusifs conçus pour votre bien-être.";
      } else if (name.includes("gainage biab naturel")) {
        whatItIs =
          "Le soin phare pour fortifier et embellir les ongles naturels. Le gel BIAB (Builder in a Bottle) est un gel de renforcement souple et résistant qui s'auto-égalise sur l'ongle pour créer une structure protectrice solide, favorisant la pousse naturelle sans risque de fissure.";
        forWhom =
          "Parfait pour les ongles mous, dédoublés ou cassants qui nécessitent un gainage solide avec un fini nude ultra-élégant.";
        finalNote = "Garantit une tenue remarquable et naturelle pendant 3 à 4 semaines.";
      } else if (name.includes("biab") && name.includes("semi-permanent")) {
        whatItIs =
          "L'alliance parfaite de la haute résistance du gel BIAB et de la brillance de la couleur. Nous appliquons d'abord la base structurante BIAB pour solidifier l'ongle naturel, suivie de la couleur semi-permanente de votre choix et d'une finition laquée miroir.";
        forWhom =
          "Idéal pour celles qui souhaitent allier la protection d'un gainage à l'éclat d'une teinte haute couture longue tenue.";
        finalNote = "Une tenue impeccable sans écaillement pendant plusieurs semaines.";
      } else if (name.includes("remplissage biab")) {
        whatItIs =
          "L'entretien indispensable de votre gainage BIAB. Nous retirons l'ancien revêtement en douceur, nettoyons les cuticules, préparons la repousse de l'ongle naturel et appliquons une nouvelle couche de gel BIAB pour rétablir l'équilibre et la solidité.";
        forWhom =
          "Conseillé toutes les 3 à 4 semaines pour préserver l'équilibre de l'ongle et conserver une esthétique parfaite.";
        finalNote = "Permet de maintenir des ongles forts et protégés en continu.";
      } else if (name.includes("gel x") || name.includes("pose américaine")) {
        whatItIs =
          "La méthode révolutionnaire de rallongement des ongles. Des capsules composées de gel souple couvrent la totalité de l'ongle et sont fixées à l'aide d'une base gel spécifique polymérisée sous lampe LED. Cette technique offre une longueur instantanée, fine et solide sans agresser la plaque naturelle.";
        forWhom =
          "La solution de choix pour celles qui désirent une longueur et une forme parfaites instantanément avec un confort de port exceptionnel.";
        finalNote = "Rapide à poser, agréable à porter et facile à retirer.";
      } else if (name.includes("construction gel") || name.includes("limage")) {
        whatItIs =
          "Un rallongement ou renforcement sculpté sur-mesure à l'aide d'un gel de construction haut de gamme. Notre technique moderne de pose sans limage excessif préserve la santé de vos ongles tout en assurant une finesse et une solidité remarquables.";
        forWhom =
          "Idéal pour créer ou modifier la forme et la longueur de vos ongles avec une précision artisanale.";
        finalNote = "Une structure sur-mesure dessinée par nos praticiennes certifiées.";
      } else if (name.includes("rallongement")) {
        whatItIs =
          "Technique de création de longueur sur ongles courts, cassés ou rongés à l'aide de chablons ou de capsules de gel pour redessiner la main avec élégance.";
        forWhom =
          "Idéal pour restructurer et rallonger les ongles avec un fini naturel et résistant.";
        finalNote = "Permet d'obtenir la forme de vos rêves en une seule séance.";
      } else if (name.includes("semi-permanent")) {
        whatItIs =
          "Une pose de vernis gel semi-permanent haut de gamme séché sous lampe LED. Comprend le soin rapide des cuticules, le limage de l'ongle et l'application soignée de la couleur avec une brillance signature longue tenue.";
        forWhom =
          "Parfait pour celles qui recherchent une couleur vibrante et une brillance miroir préservée pendant plus de deux semaines.";
        finalNote = "Une palette infinie de nuances luxe à découvrir en salon.";
      } else if (name.includes("gainage")) {
        whatItIs =
          "L'application d'un de gel protecteur sur l'ongle naturel pour lisser sa surface, combler les stries et lui donner la résistance nécessaire face aux chocs quotidiens.";
        forWhom =
          "Recommandé pour fortifier les ongles de longueur moyenne sans ajouter d'épaisseur artificielle.";
        finalNote = "Protège et sublime la base naturelle de vos ongles.";
      } else {
        whatItIs = `${service.name} est un soin exclusif de notre carte ${info.title.toLowerCase()}. ${info.intro}`;
        forWhom = `Cette prestation est particulièrement pensée ${info.bestFor.toLowerCase()}`;
        finalNote =
          "Chaque geste de ce soin est exécuté avec attention pour le respect de votre ongle naturel.";
      }
    }
  }

  // Define service-specific final notes if not defined
  if (!finalNote) {
    if (language === "en") {
      if (
        name.includes("manucure") ||
        name.includes("pédicure") ||
        name.includes("manicure") ||
        name.includes("pedicure")
      ) {
        finalNote =
          "All our metal instruments undergo complete sterilization via medical-class autoclave.";
      } else if (name.includes("biab")) {
        finalNote = "Guarantees remarkable and natural wear for 3 to 4 weeks.";
      } else if (name.includes("gel x") || name.includes("capsule") || name.includes("tip")) {
        finalNote = "Thin, comfortable extensions, easy to wear and remove.";
      } else {
        finalNote =
          "Each step of this treatment is executed with care to respect your natural nail.";
      }
    } else {
      if (name.includes("manucure") || name.includes("pédicure")) {
        finalNote =
          "Tous nos instruments métalliques subissent une stérilisation complète par autoclave de classe médicale.";
      } else if (name.includes("biab")) {
        finalNote = "Garantit une tenue remarquable et naturelle pendant 3 à 4 semaines.";
      } else if (name.includes("gel x") || name.includes("capsule")) {
        finalNote = "Extensions fines, confortables, faciles à porter et à retirer.";
      } else {
        finalNote =
          "Chaque geste de ce soin est exécuté avec attention pour le respect de votre ongle naturel.";
      }
    }
  }

  return {
    tagline: info.tagline,
    intro: info.intro,
    whatItIs,
    forWhom,
    finalNote,
  };
}
