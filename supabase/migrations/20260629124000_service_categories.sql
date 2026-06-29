-- SERVICE CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.service_categories (
  slug text PRIMARY KEY,
  category text UNIQUE NOT NULL,
  title text NOT NULL,
  tagline text NOT NULL,
  intro text NOT NULL,
  duration text NOT NULL,
  image text,
  flat text,
  highlights text[] NOT NULL DEFAULT '{}',
  care text[] NOT NULL DEFAULT '{}',
  steps jsonb NOT NULL DEFAULT '[]',
  why_us text[] NOT NULL DEFAULT '{}',
  gallery text[] NOT NULL DEFAULT '{}',
  faq jsonb NOT NULL DEFAULT '[]',
  best_for text NOT NULL,
  sort integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS policies
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service categories are public select" ON public.service_categories
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Admins manage service categories" ON public.service_categories
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Grants
GRANT SELECT ON public.service_categories TO anon, authenticated;
GRANT ALL ON public.service_categories TO service_role;

-- Seed service categories
INSERT INTO public.service_categories (slug, category, title, tagline, intro, duration, image, flat, highlights, care, steps, why_us, gallery, faq, best_for, sort)
VALUES
(
  'mains',
  'Soins des mains',
  'Soins des mains',
  'Manucure couture',
  'Un soin complet pour des mains soignées : limage sur-mesure, soin des cuticules, gommage et massage hydratant. La pose est précise, élégante et adaptée à la forme naturelle de vos ongles.',
  '45 min – 1 h 15',
  '@/assets/services/mains-hero.jpg',
  '@/assets/services/mains-flat.jpg',
  ARRAY['Limage et mise en forme personnalisée', 'Soin des cuticules au repousse-cuticules', 'Massage des mains à l''huile nourrissante', 'Finition vernis classique ou semi-permanent'],
  ARRAY['Hydrater les cuticules quotidiennement avec une huile dédiée.', 'Porter des gants pour les tâches ménagères pour préserver la pose.', 'Éviter d''utiliser les ongles comme outils — privilégier la pulpe du doigt.'],
  '[{"title": "Diagnostic & accueil", "description": "On échange sur vos envies, votre quotidien et la forme idéale."}, {"title": "Préparation", "description": "Limage, mise en forme et soin doux des cuticules."}, {"title": "Gommage & massage", "description": "Exfoliation sucrée et massage à l''huile nourrissante."}, {"title": "Pose & finition", "description": "Vernis classique ou semi-permanent, sceller, sublimer."}]'::jsonb,
  ARRAY['Outils stérilisés à chaque cliente.', 'Produits professionnels haut de gamme.', 'Conseil sur-mesure selon la forme de vos ongles.'],
  ARRAY['@/assets/services/mains-hero.jpg', '@/assets/services/mains-flat.jpg'],
  '[{"q": "Combien de temps tient la pose ?", "a": "Vernis classique : 5 à 7 jours. Semi-permanent : jusqu''à 3 semaines."}, {"q": "Puis-je venir avec une ancienne pose ?", "a": "Oui, prévoyez une dépose en supplément pour préserver l''ongle naturel."}]'::jsonb,
  'Pour les femmes qui veulent des mains soignées au quotidien, prêtes à briller en réunion comme en sortie.',
  10
),
(
  'pieds',
  'Soins des pieds',
  'Soins des pieds',
  'Pédicure & spa',
  'Bain tiède, gommage, soin des callosités et massage relaxant : une parenthèse bien-être pour des pieds doux et reposés. La finition est nette, durable et confortable.',
  '45 min – 1 h 15',
  '@/assets/services/pieds-hero.jpg',
  '@/assets/services/pieds-flat.jpg',
  ARRAY['Bain de pieds aromatique et gommage', 'Soin des callosités et des ongles', 'Massage des pieds détente', 'Finition vernis classique, semi-permanent ou gainage'],
  ARRAY['Hydrater chaque soir avec une crème pieds riche.', 'Privilégier des chaussures confortables pendant 24 h après la pose.', 'Pédicure d''entretien conseillée toutes les 4 à 6 semaines.'],
  '[{"title": "Bain relaxant", "description": "Bain tiède aromatique pour assouplir et détendre."}, {"title": "Soin des callosités", "description": "Gommage et lissage doux des zones rugueuses."}, {"title": "Massage", "description": "Massage des pieds et mollets à la crème nourrissante."}, {"title": "Finition", "description": "Pose vernis, semi-permanent ou gainage au choix."}]'::jsonb,
  ARRAY['Cabine pédicure dédiée, confortable et hygiénique.', 'Instruments stérilisés pour chaque rendez-vous.', 'Conseils personnalisés pour l''entretien à domicile.'],
  ARRAY['@/assets/services/pieds-hero.jpg', '@/assets/services/pieds-flat.jpg'],
  '[{"q": "C''est douloureux ?", "a": "Non, le soin est entièrement non invasif et relaxant."}, {"q": "Quelle finition choisir l''été ?", "a": "Le semi-permanent est idéal — tenue 3 semaines, brillance intacte."}]'::jsonb,
  'Pour celles qui veulent des pieds impeccables — saison des sandales ou bien-être tout au long de l''année.',
  20
),
(
  'naturels-renforces',
  'Ongles naturels renforcés',
  'Ongles naturels renforcés',
  'Gainage, gel et renforcement',
  'Une couche de gel travaillée sur l''ongle naturel pour le renforcer, le protéger et l''embellir — sans capsules. Idéal pour les ongles fins ou cassants, avec un rendu fin et lumineux.',
  '1 h 15 – 2 h',
  '@/assets/services/naturels-renforces-hero.jpg',
  '@/assets/services/naturels-renforces-flat.jpg',
  ARRAY['Renforcement de l''ongle naturel sans capsule', 'Pose discrète, fine et confortable', 'Compatible vernis semi-permanent ou nail art', 'Remplissage conseillé toutes les 3 à 4 semaines'],
  ARRAY['Ne pas arracher la pose — toujours passer par une dépose en institut.', 'Hydrater les cuticules pour favoriser la tenue.', 'Prévoir un remplissage avant 4 semaines pour préserver la solidité.'],
  '[{"title": "Préparation", "description": "Limage doux et préparation de l''ongle naturel."}, {"title": "Pose de la base", "description": "Application d''une base renforçante adaptée."}, {"title": "Gainage", "description": "Modelage du gel pour une protection invisible."}, {"title": "Finition", "description": "Top coat brillant ou mat, vernis au choix."}]'::jsonb,
  ARRAY['Produits hypoallergéniques et non agressifs.', 'Pose fine, naturelle, jamais trop épaisse.', 'Suivi entre deux rendez-vous offert par WhatsApp.'],
  ARRAY['@/assets/services/naturels-renforces-hero.jpg', '@/assets/services/naturels-renforces-flat.jpg'],
  '[{"q": "Cela abîme-t-il l''ongle ?", "a": "Non, à condition de respecter la dépose en institut."}, {"q": "Puis-je ajouter du nail art ?", "a": "Oui, tous nos décors sont compatibles."}]'::jsonb,
  'Pour les ongles fins, cassants ou qui peinent à pousser — sans alourdir, sans agresser.',
  30
),
(
  'biab',
  'Ongle naturel BIAB',
  'BIAB — Builder In A Bottle',
  'Renforcement naturel nouvelle génération',
  'Le BIAB est un gel de construction souple et autolissant, parfait pour renforcer l''ongle naturel sans agresser. Très léger en porter, il offre une excellente tenue et un rendu naturel.',
  '1 h 15 – 1 h 45',
  '@/assets/services/biab-hero.jpg',
  '@/assets/services/biab-flat.jpg',
  ARRAY['Renforcement naturel, sans capsule', 'Tenue jusqu''à 3–4 semaines', 'Compatible avec le semi-permanent', 'Remplissage possible pour préserver vos longueurs'],
  ARRAY['Toujours faire déposer en institut, jamais arracher.', 'Huile cuticule quotidienne pour la souplesse.', 'Remplissage toutes les 3 à 4 semaines.'],
  '[{"title": "Préparation douce", "description": "Repousse-cuticules et mat doux sur l''ongle naturel."}, {"title": "Application BIAB", "description": "Pose du gel autolissant en fine couche."}, {"title": "Catalysation", "description": "Séchage LED pour une accroche optimale."}, {"title": "Finition couleur", "description": "Top brillant, mat, ou pose semi-permanent."}]'::jsonb,
  ARRAY['Gel premium importé, formulation souple.', 'Pose réalisée par une experte certifiée BIAB.', 'Remplissage à tarif préférentiel sous 4 semaines.'],
  ARRAY['@/assets/services/biab-hero.jpg', '@/assets/services/biab-flat.jpg'],
  '[{"q": "Quelle différence avec un gel classique ?", "a": "Le BIAB est plus souple, plus léger et respecte mieux l''ongle naturel."}, {"q": "Puis-je rallonger avec du BIAB ?", "a": "Légèrement, oui. Pour de vraies extensions, optez pour les capsules."}]'::jsonb,
  'Pour les femmes qui veulent une pose durable, naturelle et confortable au quotidien.',
  40
),
(
  'capsules',
  'Capsule sur ongle',
  'Capsules & extensions',
  'Allonger, sculpter, sublimer',
  'Pour rallonger vos ongles ou créer une forme dessinée — amande, ballerine, carré long. Pose précise sur capsules, finition gel, polygel ou pose américaine selon le rendu souhaité.',
  '1 h 45 – 2 h 30',
  '@/assets/services/capsules-hero.jpg',
  '@/assets/services/capsules-flat.jpg',
  ARRAY['Pose de capsules sur-mesure', 'Finition gel, polygel ou pose américaine', 'Formes au choix : amande, ballerine, carré, stiletto', 'Remplissage toutes les 3 à 4 semaines'],
  ARRAY['Éviter les chocs les premières heures après la pose.', 'Hydrater les cuticules quotidiennement.', 'Dépose obligatoire en institut pour préserver l''ongle naturel.'],
  '[{"title": "Choix de la forme", "description": "Amande, ballerine, carré, stiletto — selon votre style."}, {"title": "Pose des capsules", "description": "Ajustement précis et collage sécurisé."}, {"title": "Modelage", "description": "Sculpture du gel ou polygel pour un rendu fin."}, {"title": "Couleur & décor", "description": "Pose couleur, french, baby boomer, strass au choix."}]'::jsonb,
  ARRAY['Pose minutieuse — chaque ongle est sculpté à la main.', 'Large bibliothèque de formes et de décors.', 'Conseils pour adapter la longueur à votre quotidien.'],
  ARRAY['@/assets/services/capsules-hero.jpg', '@/assets/services/capsules-flat.jpg'],
  '[{"q": "C''est lourd à porter ?", "a": "Non, nos poses sont travaillées pour être fines et confortables."}, {"q": "Combien de temps ça tient ?", "a": "3 à 4 semaines, avec un remplissage conseillé ensuite."}]'::jsonb,
  'Pour un événement, un mariage, ou simplement pour oser une forme et une longueur signature.',
  50
),
(
  'supplements',
  'Supplément',
  'Suppléments & nail art',
  'Strass, chrome, effets, dessins',
  'Personnalisez votre pose avec des finitions couture : strass posés un à un, chrome miroir, french élégante, dessins fins ou effets matières. Compatible avec toutes nos prestations.',
  '+ 15 à 30 min',
  '@/assets/services/supplements-hero.jpg',
  '@/assets/services/supplements-flat.jpg',
  ARRAY['Strass premium posés à la main', 'Effets chrome, miroir, holographique', 'French, baby boomer, dessins fins', 'Personnalisation sur une ou plusieurs nails'],
  ARRAY['Top coat de protection inclus pour la tenue des décors.', 'Éviter les détergents agressifs sans gants.', 'Repassez nous voir si un strass se décolle — on le replace gracieusement.'],
  '[{"title": "Inspiration", "description": "On regarde ensemble vos références ou vous propose un moodboard."}, {"title": "Préparation", "description": "Pose de base couleur ou french selon le design."}, {"title": "Décor à la main", "description": "Strass, chrome ou dessins minutieux."}, {"title": "Scellage longue tenue", "description": "Top coat renforcé pour préserver chaque détail."}]'::jsonb,
  ARRAY['Strass et chrome premium, jamais ternes.', 'Designs sur-mesure, jamais deux poses identiques.', 'Retouche d''un strass offerte sous 7 jours.'],
  ARRAY['@/assets/services/supplements-hero.jpg', '@/assets/services/supplements-flat.jpg'],
  '[{"q": "Puis-je n''orner qu''un seul ongle ?", "a": "Bien sûr — beaucoup de clientes choisissent un accent nail."}, {"q": "Les strass tiennent-ils ?", "a": "Oui, scellés au top coat, ils tiennent toute la durée de la pose."}]'::jsonb,
  'Pour celles qui veulent une touche unique — un détail qui transforme une pose en bijou.',
  60
),
(
  'depose',
  'Dépose',
  'Dépose en institut',
  'Gel, gainage, semi-permanent',
  'Une dépose réalisée dans les règles pour préserver l''ongle naturel — limage doux, soin réparateur et conseils personnalisés. Indispensable entre deux poses.',
  '30 – 45 min',
  '@/assets/services/depose-hero.jpg',
  '@/assets/services/depose-flat.jpg',
  ARRAY['Dépose douce de toutes vos poses', 'Soin réparateur de l''ongle naturel', 'Conseils personnalisés pour la suite', 'Possibilité d''enchaîner avec une nouvelle pose'],
  ARRAY['Ne pas arracher la pose à la maison.', 'Prévoyez une cure d''huile cuticule après chaque dépose.', 'Pause de quelques jours possible si l''ongle est fatigué.'],
  '[{"title": "Diagnostic", "description": "On évalue l''état de la pose et de l''ongle naturel."}, {"title": "Dépose douce", "description": "Ponçage minutieux ou trempage selon la pose."}, {"title": "Soin réparateur", "description": "Nourrissage et lissage de l''ongle naturel."}, {"title": "Conseil", "description": "On vous oriente vers la suite : pause, BIAB, nouvelle pose."}]'::jsonb,
  ARRAY['Aucun arrachage — votre ongle naturel reste intact.', 'Soin réparateur inclus systématiquement.', 'Tarif dégressif si vous enchaînez avec une nouvelle pose.'],
  ARRAY['@/assets/services/depose-hero.jpg', '@/assets/services/depose-flat.jpg'],
  '[{"q": "Combien de temps prévoir ?", "a": "Environ 30 à 45 minutes selon le type de pose."}, {"q": "Puis-je reposer juste après ?", "a": "Oui, c''est souvent l''idéal pour préserver vos ongles."}]'::jsonb,
  'Pour préserver vos ongles entre deux poses, ou avant une cure de récupération.',
  70
)
ON CONFLICT (slug) DO NOTHING;
