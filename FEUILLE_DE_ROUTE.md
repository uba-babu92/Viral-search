# Feuille de route — Viral Search (usage perso)

## But final : 4 étapes
1. **Trouver** une vidéo virale (Recherche) ✅ fait
2. **Script** : la vidéo virale est transcrite en texte, puis l'IA m'aide à la réécrire pour MA vidéo. (Chatbot ✅ fait, transcription automatique ⏳ à faire)
3. **Film** : caméra simple plan par plan ✅ fait. Plus tard : afficher le plan à filmer d'après le script ⏳
4. **Montage** : l'IA monte tout automatiquement, puis j'ouvre le résultat dans un éditeur style CapCut, très propre, pour retoucher. ⏳

## Montage façon CapCut (prochaine étape)
- Après Film → « Suivant » : 🤖 Montage IA (puis retouche dans l'éditeur) ou ✂️ Table de montage directe.
- Éditeur simple : vidéos (couper, déplacer), sons/musique, voix off, superpositions. Export via Shotstack.
- Fait : couper, glisser (appui long), rallonger/raccourcir, vitesse x0,5 à x100, volume par élément, bruitages perso (gardés sur le téléphone), voix off en appui maintenu, légendes façon TikTok (Groq Whisper) modifiables et déplaçables, superpositions (vidéo/image), lecture sans noir ni latence, export qualité haute.
- Moteur Mediabunny (vendor/) : aperçu image par image sans freeze, sur des proxys légers (432x768) fabriqués à l'import, export MP4 1080p sur le téléphone (sans Shotstack, sans logo).
- Montage IA piloté par un prompt : écoute (Groq Whisper), découpe en phrases, Groq décide (garder/ordre/vitesse/volume/légendes/bruitages), application + écran d'étapes.
- Outil Texte + images clés ◇ (vidéo : zoom/cadrage/rotation ; superpositions et textes : position/taille/rotation/opacité), gestes 1 et 2 doigts, outil Ajuster.
- À venir : assistant IA dans l'éditeur.
- Outil Caméra dans l'éditeur : appui maintenu = selfie inséré à la barre blanche, appui simple = caméra complète.
- Adapter une vidéo virale : le relais récupère la vidéo TikTok (/tiktok-video) et Groq Whisper écoute ce qui est dit.
- Shotstack ne sert plus pour l'export (gardé pour un futur montage IA).
- Appli iPhone native (compte développeur Apple 99 $/an) si la caméra web ne suffit pas.
- S'inspirer de l'ergonomie de CapCut (timeline, pistes, sous-titres animés, textes, coupes).
- Pas de copie du code de CapCut : on reconstruit avec des outils libres.

## Déjà en place
- Page : https://uba-babu92.github.io/Viral-search/
- Relais Cloudflare (viral-relais) : clés APIFY_KEY, AI_KEY (Vercel), SHOTSTACK_KEY.
- Montage simple via Shotstack (sous-titres auto, mode test avec logo).
- Avertissement rouge quand un service n'a plus de crédit.

## À faire lundi (par toi)
- Cloudflare : recopier relay/worker.js dans viral-relais puis Déployer (pour la transcription).
- Clé IA : Groq (gratuit) dans AI_KEY sur Cloudflare. Sert au coach Script ET aux légendes.
- Apify : regarder le prix et les options (« vues minimum », « tri par popularité ») du scraper mu0i.

## Baisser le prix de la recherche
- Aujourd'hui : 150 vidéos demandées à chaque recherche (environ 5 fois plus cher qu'avant).
- Pistes : option « vues minimum » ou « tri par popularité » du scraper, s'arrêter dès 50 vidéos virales, ou changer de scraper moins cher.
- Réglage dans index.html : FETCH_VIDEOS (nombre de vidéos demandées).

## Petits trucs à corriger
- Miniatures des carrousels qui ne s'affichent pas.
- Tester le montage de bout en bout.
