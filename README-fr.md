# Moult AI Web

**Passerelle multi-fournisseurs IA -- Interface unifiee pour interroger plusieurs modeles d'intelligence artificielle via OpenRouter, Groq et HuggingFace.**

Developpe par [Lombard Web Services](https://lombard-web-services.com) ([@lombardweb](https://github.com/lombardweb))

---

## Presentation

Moult AI Web est une application web progressive qui fournit une interface unique et soignee pour interroger plusieurs modeles d'intelligence artificielle issus de differents fournisseurs. Elle fonctionne entierement dans le navigateur, sans backend proprietaire -- elle se connecte a un serveur proxy leger qui dirige les requetes vers le fournisseur IA approprie.

## Fonctionnalites

- **Multi-fournisseurs** -- Modeles OpenRouter, Groq et HuggingFace accessibles depuis une seule interface
- **Diffusion en temps reel** -- Les reponses sont diffusees token par token pour un retour instantane
- **6 themes visuels** -- Sombre, Clair, Ocean, Foret, Coucher de soleil et Minuit
- **18 langues** -- Internationalisation complete incluant l'arabe (RTL), le chinois, le japonais, l'hindi, le grec et le tifinagh
- **Application web progressive** -- Installable sur tout appareil, fonctionne hors ligne avec les reponses en cache
- **Historique des conversations** -- Toutes les conversations sont stockees localement dans le navigateur (pas de stockage cote serveur)
- **Import et export** -- Formats JSON, JSONL, Markdown et Alpaca supportes
- **Recherche** -- Recherche plein texte dans toutes les conversations stockees
- **Rendu mathematique** -- Affichage de formules LaTeX grace a KaTeX
- **Blocs de code** -- Code avec coloration syntaxique et copie en un clic
- **Design responsive** -- Optimise pour mobile, tablette et bureau
- **Affichage du raisonnement** -- Afficher ou masquer les chaines de raisonnement du modele lorsque le supporte
- **Detection du theme systeme** -- S'adapte automatiquement a l'apparence de votre systeme d'exploitation

## Architecture

```
Navigateur (PWA)
  |
  +-- index.html / css / js  (frontend statique)
  |
  +-- sw.js                  (service worker pour le hors ligne et le cache)
  |
  +-- manifest.json          (manifest PWA)
  |
  v
Serveur Proxy (Node.js)
  |
  +-- /api/models            (liste des modeles par fournisseur)
  +-- /api/chat              (completions de chat en streaming)
  |
  v
Fournisseurs IA
  +-- OpenRouter
  +-- Groq
  +-- HuggingFace
```

## Demarrage

### Developpement local

Un serveur de developpement Python est inclus :

```bash
python3 server.py
```

Cela demarre un serveur local a `http://localhost:8000`. Vous pouvez specifier un port different :

```bash
python3 server.py 3000
```

Pour ecouter sur toutes les interfaces reseau (utile pour les tests sur mobile) :

```bash
python3 server.py --host 0.0.0.0
```

### Deploiement en production

1. Servir les fichiers du projet depuis n'importe quel serveur web statique (Nginx, Apache, Caddy, etc.)
2. S'assurer que le serveur proxy est en cours d'execution et accessible
3. Mettre a jour l'URL du proxy dans les parametres de l'application si necessaire
4. La PWA sera automatiquement disponible pour l'installation une fois servie en HTTPS

### Serveur proxy

Le serveur proxy gere les cles API et dirige les requetes vers le fournisseur IA approprie. Voir `install-moult-ai-proxy.sh` pour les instructions d'installation.

## Configuration

| Parametre | Par defaut | Description |
|-----------|------------|-------------|
| URL du proxy | `https://api-moult-ai.lombard-web-services.com` | Endpoint du proxy backend |
| Theme | Sombre | Theme visuel (6 options) |
| Taille de police | 14px | Taille du texte (12-20px) |
| Format d'export | JSON | Format d'export des conversations |

Tous les parametres sont sauvegardes dans le localStorage du navigateur.

## Modeles supportes

Les modeles sont recuperes dynamiquement depuis le serveur proxy. La liste de repli par defaut (utilisee lorsque l'API est indisponible) contient :

**OpenRouter :**
- nvidia/nemotron-3-nano-30b-a3b:free
- nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free
- nvidia/nemotron-nano-12b-v2-vl:free
- nvidia/nemotron-3-ultra-550b-a55b:free
- poolside/laguna-m.1:free

**Groq :**
- llama-3.3-70b-versabile

## Ajout ou suppression de modeles

Les modeles sont filtres via une constante `ALLOWED_MODELS` en haut de `js/script.js`. C'est la source unique de verite pour les modeles qui apparaissent sur le site, quelle que soit la reponse de l'API proxy.

### 1. La liste des modeles autorises

Recherchez la constante `ALLOWED_MODELS` pres du haut du fichier :

```javascript
const ALLOWED_MODELS = {
    openrouter: [
        'nvidia/nemotron-3-nano-30b-a3b:free',
        'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free',
        'nvidia/nemotron-nano-12b-v2-vl:free',
        'nvidia/nemotron-3-ultra-550b-a55b:free',
        'poolside/laguna-m.1:free'
    ],
    groq: ['llama-3.3-70b-versatile'],
    hf: []
};
```

Pour ajouter un modele, ajoutez son identifiant dans le tableau du fournisseur correspondant. Pour en supprimer un, supprimez la ligne concernee. La fonction `fetchModels()` filtre la reponse de l'API contre cette liste, seuls les modeles presents ici apparaissent dans le menu deroulant et sur l'ecran d'accueil.

### 2. Affichage du nom du modele

La fonction `simplifyModelName` controle comment les noms de modeles sont raccourcis dans l'interface. Si vous ajoutez une nouvelle famille de modeles, vous pouvez ajouter une entree de correspondance pour un affichage plus propre :

```javascript
const map = {
    'nemotron': 'Nemotron',
    'llama': 'Llama',
    // Ajoutez vos propres correspondances ici
};
```

### Format de l'identifiant de modele

L'identifiant suit le format `fournisseur/nom-du-modele`. Pour les modeles OpenRouter, le format est `openrouter/fabricant/nom-du-modele:variante`. Pour les modeles Groq, c'est simplement `groq/nom-du-modele`.

## Details techniques

- **Frontend** : JavaScript vanille (pas de dependances frameworks), HTML5, CSS3 avec proprietes personnalisees
- **Style** : Systeme de design glassmorphism avec proprietes CSS pour les themes
- **Hors ligne** : Service worker avec strategie de cache stale-while-revalidate
- **Stockage** : localStorage du navigateur pour les conversations, parametres et preferences
- **Mathematiques** : KaTeX pour le rendu LaTeX
- **Build** : Aucune etape de build requise -- fonctionne directement depuis les fichiers sources

## Navigateurs supportes

- Chrome 90+
- Firefox 90+
- Safari 15+
- Edge 90+
- Navigateurs mobiles (iOS Safari, Chrome pour Android)

## Licence

Copyright (c) Lombard Web Services. Tous droits reserves.

## Auteur

Developpe par [Lombard Web Services](https://lombard-web-services.com)
