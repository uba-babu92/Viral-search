# Feuille de route — Viral Search (usage perso)

## But final : 4 étapes
1. **Trouver** une vidéo virale (Recherche) ✅ fait
2. **Script** : la vidéo virale est transcrite en texte, puis l'IA m'aide à la réécrire pour MA vidéo. (Chatbot ✅ fait, transcription automatique ⏳ à faire)
3. **Film** (nouvelle rubrique) : l'IA découpe la vidéo virale plan par plan et me dit quoi filmer pour chaque plan, d'après mon script. ⏳
4. **Montage** : l'IA monte tout automatiquement, puis j'ouvre le résultat dans un éditeur style CapCut, très propre, pour retoucher. ⏳

## Montage façon CapCut (plus tard, quand il y aura des crédits)
- S'inspirer de l'ergonomie de CapCut (timeline, pistes, sous-titres animés, textes, coupes).
- Pas de copie du code de CapCut : on reconstruit avec des outils libres.

## Déjà en place
- Page : https://uba-babu92.github.io/Viral-search/
- Relais Cloudflare (viral-relais) : clés APIFY_KEY, AI_KEY (Vercel), SHOTSTACK_KEY.
- Montage simple via Shotstack (sous-titres auto, mode test avec logo).
- Avertissement rouge quand un service n'a plus de crédit.

## À faire lundi (par toi)
- Cloudflare : recopier relay/worker.js dans viral-relais puis Déployer (pour la transcription).
- Clé IA : choisir Mistral (gratuit, sans carte) ou carte sur Vercel.
- Apify : regarder le prix et les options (« vues minimum », « tri par popularité ») du scraper mu0i.

## Baisser le prix de la recherche
- Aujourd'hui : 150 vidéos demandées à chaque recherche (environ 5 fois plus cher qu'avant).
- Pistes : option « vues minimum » ou « tri par popularité » du scraper, s'arrêter dès 50 vidéos virales, ou changer de scraper moins cher.
- Réglage dans index.html : FETCH_VIDEOS (nombre de vidéos demandées).

## Petits trucs à corriger
- Miniatures des carrousels qui ne s'affichent pas.
- Tester le montage de bout en bout.
