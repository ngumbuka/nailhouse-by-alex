-- ========================================================================================
-- NAILHOUSE BY ALEX - SERVICES CATALOGUE DESCRIPTION SYNC
-- ========================================================================================
-- Run this in your Supabase SQL Editor to populate all your services with 
-- beautifully formatted, bilingual HTML descriptions and precise duration times!

UPDATE public.services 
SET 
  description = '<p>Un soin complet de précision pour des mains nettes et soignées au quotidien. Comprend le limage personnalisé pour définir la forme idéale de vos ongles, le traitement minutieux des cuticules avec des instruments stérilisés, suivi d''un massage hydratant relaxant et de l''application d''une base fortifiante protectrice.</p><p class="text-xs text-muted-foreground mt-4 uppercase tracking-widest text-gold font-bold">Pour qui ?</p><p>Pour celles et ceux qui souhaitent des mains soignées, propres et élégantes sans pose de couleur.</p>',
  description_en = '<p>A complete precision treatment for neat and well-groomed hands every day. Includes personalized filing to define the ideal shape of your nails, meticulous cuticle treatment with sterilized instruments, followed by a relaxing moisturizing massage and the application of a protective strengthening base.</p><p class="text-xs text-muted-foreground mt-4 uppercase tracking-widest text-gold font-bold">Best for:</p><p>Those who want neat, clean, and elegant hands without color polish.</p>',
  duration_mins = 45
WHERE name = 'Manucure classique' AND category = 'Soins des mains';

UPDATE public.services 
SET 
  description = '<p>L''expérience sensorielle et relaxante ultime pour la beauté et le confort de vos mains. Elle associe toutes les étapes de notre manucure classique à un bain tiède aromatique, un gommage exfoliant doux aux huiles essentielles, l''application d''un masque enveloppant ultra-nourrissant et un massage prolongé.</p><p class="text-xs text-muted-foreground mt-4 uppercase tracking-widest text-gold font-bold">Pour qui ?</p><p>Idéal pour s''offrir une pause détente absolue tout en régénérant en profondeur la peau de ses mains.</p>',
  description_en = '<p>The ultimate sensory and relaxing experience for the beauty and comfort of your hands. It combines all the steps of our classic manicure with a warm aromatic bath, a gentle exfoliating scrub with essential oils, the application of an ultra-nourishing wrapping mask, and a prolonged massage.</p><p class="text-xs text-muted-foreground mt-4 uppercase tracking-widest text-gold font-bold">Best for:</p><p>Ideal for an absolute relaxation break while deeply regenerating the skin of your hands.</p>',
  duration_mins = 75
WHERE name = 'Manucure spa' AND category = 'Soins des mains';

UPDATE public.services 
SET 
  description = '<p>Un soin indispensable des pieds pour retrouver légèreté et douceur. Cette prestation comprend un bain de pieds délassant, la mise en forme personnalisée des ongles, le retrait délicat des cuticules, l''élimination douce des rugosités superficielles, complétés par un massage hydratant relaxant.</p><p class="text-xs text-muted-foreground mt-4 uppercase tracking-widest text-gold font-bold">Pour qui ?</p><p>Indiqué pour l''entretien régulier des pieds et pour conserver des ongles impeccables et sains.</p>',
  description_en = '<p>An essential foot care treatment to restore lightness and softness. This service includes a relaxing foot bath, personalized nail shaping, gentle cuticle removal, soft elimination of superficial roughness, completed with a relaxing moisturizing massage.</p><p class="text-xs text-muted-foreground mt-4 uppercase tracking-widest text-gold font-bold">Best for:</p><p>Recommended for regular foot maintenance and keeping impeccable, healthy nails.</p>',
  duration_mins = 45
WHERE name = 'Pédicure classique' AND category = 'Soins des pieds';

UPDATE public.services 
SET 
  description = '<p>Le soin d''exception ultime pour vos pieds fatigués. Ce rituel complet comprend un bain de pieds aromatique aux sels marins, un gommage purifiant, un masque réparateur enveloppant sous serviette chaude, le traitement des cuticules et callosités, et un massage drainant des pieds et mollets.</p><p class="text-xs text-muted-foreground mt-4 uppercase tracking-widest text-gold font-bold">Pour qui ?</p><p>Recommandé pour relâcher les tensions accumulées, adoucir la peau et passer un moment de pure évasion.</p>',
  description_en = '<p>The ultimate exceptional treatment for your tired feet. This complete ritual includes an aromatic sea salt foot bath, a purifying scrub, a wrapping repairing mask under a hot towel, cuticle and callus treatment, and a draining foot and calf massage.</p><p class="text-xs text-muted-foreground mt-4 uppercase tracking-widest text-gold font-bold">Best for:</p><p>Recommended to release accumulated tension, soften the skin, and spend a moment of pure escape.</p>',
  duration_mins = 75
WHERE name = 'Pédicure spa' AND category = 'Soins des pieds';

UPDATE public.services 
SET 
  description = '<p>La pose rapide de notre vernis gel semi-permanent haut de gamme sur les pieds. Comprend la préparation de l''ongle, le limage et l''application soignée de la couleur avec une brillance miroir préservée pendant plus de 3 semaines.</p><p class="text-xs text-muted-foreground mt-4 uppercase tracking-widest text-gold font-bold">Pour qui ?</p><p>Pour celles qui recherchent une couleur éclatante longue tenue sur les ongles de pieds sans le soin complet.</p>',
  description_en = '<p>The quick application of our premium semi-permanent gel polish on your toes. Includes nail preparation, filing, and careful application of color with a mirror shine preserved for over 3 weeks.</p><p class="text-xs text-muted-foreground mt-4 uppercase tracking-widest text-gold font-bold">Best for:</p><p>Those looking for a vibrant, long-lasting color on their toes without a full pedicure service.</p>',
  duration_mins = 30
WHERE name = 'Vernis semi-permanent pieds' AND category = 'Soins des pieds';

UPDATE public.services 
SET 
  description = '<p>Une technique avancée combinant la tenue du vernis gel à une base protectrice renforcée sur les ongles de pieds. Elle permet de lisser la surface des ongles, combler les stries et assurer une résistance parfaite face aux chocs.</p><p class="text-xs text-muted-foreground mt-4 uppercase tracking-widest text-gold font-bold">Pour qui ?</p><p>Parfait pour uniformiser et fortifier les ongles de pieds striés ou fragilisés.</p>',
  description_en = '<p>An advanced technique combining the durability of gel polish with a reinforced protective base on toenails. It allows smoothing the nail surface, filling ridges, and ensuring perfect resistance to impacts.</p><p class="text-xs text-muted-foreground mt-4 uppercase tracking-widest text-gold font-bold">Best for:</p><p>Perfect for evening out and strengthening ridged or weakened toenails.</p>',
  duration_mins = 45
WHERE name = 'Vernis gainage pieds' AND category = 'Soins des pieds';

UPDATE public.services 
SET 
  description = '<p>L''application d''un gel protecteur sur vos ongles naturels pour lisser leur surface et leur apporter la résistance nécessaire face aux chocs quotidiens, sans rallongement. Idéal pour conserver sa longueur naturelle.</p><p class="text-xs text-muted-foreground mt-4 uppercase tracking-widest text-gold font-bold">Pour qui ?</p><p>Conseillé pour fortifier les ongles de longueur moyenne sans ajouter d''épaisseur artificielle.</p>',
  description_en = '<p>The application of a protective gel on your natural nails to smooth their surface and provide the necessary resistance against daily impacts, without extensions. Ideal for maintaining your natural length.</p><p class="text-xs text-muted-foreground mt-4 uppercase tracking-widest text-gold font-bold">Best for:</p><p>Recommended for strengthening medium-length nails without adding artificial thickness.</p>',
  duration_mins = 75
WHERE name = 'Gainage' AND category = 'Ongles naturels renforcés';

UPDATE public.services 
SET 
  description = '<p>La création minutieuse de longueur sur-mesure sur vos ongles naturels à l''aide de chablons ou de capsules de gel pour redessiner la main avec finesse et assurer un résultat résistant et harmonieux.</p><p class="text-xs text-muted-foreground mt-4 uppercase tracking-widest text-gold font-bold">Pour qui ?</p><p>Idéal pour restructurer et rallonger les ongles courts, cassés ou rongés.</p>',
  description_en = '<p>The meticulous creation of custom length on your natural nails using forms or gel tips to redesign the hand with finesse and ensure a resistant and harmonious result.</p><p class="text-xs text-muted-foreground mt-4 uppercase tracking-widest text-gold font-bold">Best for:</p><p>Ideal for restructuring and lengthening short, broken, or bitten nails.</p>',
  duration_mins = 105
WHERE name = 'Rallongement' AND category = 'Ongles naturels renforcés';

UPDATE public.services 
SET 
  description = '<p>Une pose de vernis gel semi-permanent de prestige polymérisé sous lampe LED. Comprend le limage soigné, un nettoyage rapide des cuticules et l''application d''une couleur vibrante avec finition miroir.</p><p class="text-xs text-muted-foreground mt-4 uppercase tracking-widest text-gold font-bold">Pour qui ?</p><p>Parfait pour celles qui souhaitent une couleur éclatante sans besoin de renforcement ou gainage gel.</p>',
  description_en = '<p>An application of prestigious semi-permanent gel polish cured under an LED lamp. Includes careful filing, a quick cuticle clean-up, and the application of a vibrant color with a mirror finish.</p><p class="text-xs text-muted-foreground mt-4 uppercase tracking-widest text-gold font-bold">Best for:</p><p>Perfect for those who want vibrant color without the need for reinforcement or gel overlay.</p>',
  duration_mins = 45
WHERE name = 'Semi-permanent' AND category = 'Ongles naturels renforcés';

UPDATE public.services 
SET 
  description = '<p>Le soin signature NailHouse. Le BIAB (Builder in a Bottle) est un gel de renforcement souple et riche en nutriments qui s''auto-égalise pour solidifier l''ongle naturel tout en favorisant sa pousse saine, avec un fini nude ou rosé ultra-chic.</p><p class="text-xs text-muted-foreground mt-4 uppercase tracking-widest text-gold font-bold">Pour qui ?</p><p>Recommandé pour les ongles fragiles ou cassants qui nécessitent un gainage solide au fini naturel.</p>',
  description_en = '<p>The NailHouse signature treatment. BIAB (Builder in a Bottle) is a flexible, nutrient-rich builder gel that self-levels to solidify the natural nail while promoting healthy growth, finishing with an ultra-chic nude or rosy tint.</p><p class="text-xs text-muted-foreground mt-4 uppercase tracking-widest text-gold font-bold">Best for:</p><p>Recommended for fragile or brittle nails that require solid reinforcement with a natural finish.</p>',
  duration_mins = 75
WHERE name = 'Gainage BIAB naturel' AND category = 'Ongle naturel BIAB';

UPDATE public.services 
SET 
  description = '<p>La technique révolutionnaire d''extensions rapides. Des capsules entièrement faites de gel souple sont fixées sur la totalité de l''ongle naturel à l''aide d''une base gel spécifique catalysée sous LED. Offre une longueur parfaite instantanée.</p><p class="text-xs text-muted-foreground mt-4 uppercase tracking-widest text-gold font-bold">Pour qui ?</p><p>La solution idéale pour une longueur parfaite rapide, confortable et facile à retirer.</p>',
  description_en = '<p>The revolutionary fast extension technique. Tips entirely made of soft gel are applied over the entire natural nail using a specific gel base cured under LED. Provides instant perfect length.</p><p class="text-xs text-muted-foreground mt-4 uppercase tracking-widest text-gold font-bold">Best for:</p><p>The ideal solution for fast, comfortable perfect length that is easy to remove.</p>',
  duration_mins = 90
WHERE name = 'Gel x pose américaine' AND category = 'Capsule sur ongle';

-- Reload PostgREST schema cache so the API recognizes the updates instantly
NOTIFY pgrst, 'reload schema';
