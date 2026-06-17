# 🍽️ T-isakafo — Système de gestion de restaurant

Système complet avec **backend Node.js**, **base de données JSON persistante** et **WebSocket temps réel**.

---

## 📁 Structure du projet

```
restaurflow/
├── backend/
│   ├── server.js              ← Serveur principal Express
│   ├── ws.js                  ← Gestionnaire WebSocket
│   ├── middleware/
│   │   └── auth.js            ← Authentification JWT
│   └── routes/
│       ├── auth.js            ← Login / mot de passe
│       ├── orders.js          ← API commandes
│       └── dishes.js          ← API plats
├── database/
│   ├── db.js                  ← Configuration lowdb
│   └── data/
│       └── restaurant.json    ← Base de données (créée automatiquement)
├── frontend/
│   └── index.html             ← Interface web complète
├── .env                       ← Configuration (port, secrets)
├── package.json
└── README.md
```

---

## 🚀 Installation et démarrage

### Étape 1 — Prérequis

Installez **Node.js** (version 16 ou plus) depuis : https://nodejs.org

Vérifiez l'installation :
```bash
node --version    # doit afficher v16.x ou plus
npm --version     # doit afficher 8.x ou plus
```

### Étape 2 — Installer les dépendances

Ouvrez un terminal dans le dossier `restaurflow/` et tapez :
```bash
npm install
```

### Étape 3 — Démarrer le serveur

```bash
npm start
```

Vous verrez :
```
  T-isakafo v1.0 démarré
  🌐  http://localhost:3000
  📡  WebSocket ws://localhost:3000
```

### Étape 4 — Ouvrir dans le navigateur

Allez sur : **http://localhost:3000**

Connexion par défaut :
- **Utilisateur :** `admin`
- **Mot de passe :** `admin123`

---

## 🌐 Accès depuis d'autres appareils (réseau local)

1. Trouvez l'adresse IP de votre PC :
   - Windows : ouvrez `cmd` et tapez `ipconfig`
   - Mac/Linux : tapez `ifconfig` ou `ip addr`

2. Sur les autres appareils (smartphones, tablettes), ouvrez le navigateur et tapez :
   ```
   http://[VOTRE_IP]:3000
   ```
   Exemple : `http://192.168.1.15:3000`

3. Tout le monde voit les mêmes données en temps réel grâce au WebSocket !

---

## ⚙️ Configuration (.env)

```env
PORT=3000                         ← Port du serveur (changez si 3000 est occupé)
JWT_SECRET=votre_secret_ici       ← Clé secrète pour les tokens (changez en production !)
ADMIN_PASSWORD=admin123           ← Mot de passe admin initial
NODE_ENV=development
```

**Important :** Changez `JWT_SECRET` et `ADMIN_PASSWORD` avant de déployer en production !

---

## 📡 API REST complète

### Authentification
| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/api/auth/login` | Connexion, retourne un token JWT |
| POST | `/api/auth/change-password` | Changer son mot de passe (token requis) |

### Commandes
| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/orders` | Liste toutes les commandes |
| GET | `/api/orders?filter=first` | Premier arrivé uniquement |
| GET | `/api/orders?status=pending` | Filtrer par statut |
| GET | `/api/orders/stats` | Statistiques (total, revenus, etc.) |
| POST | `/api/orders` | Créer une commande |
| PATCH | `/api/orders/:id/advance` | Avancer au statut suivant |
| PATCH | `/api/orders/:id/delivery-step` | Avancer l'étape de livraison |
| DELETE | `/api/orders/:id` | Supprimer une commande |

### Plats
| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/dishes` | Liste tous les plats |
| GET | `/api/dishes?available=true` | Plats disponibles seulement |
| GET | `/api/dishes/plat-du-jour` | Plat du jour actuel |
| POST | `/api/dishes` | Ajouter un plat |
| PUT | `/api/dishes/:id` | Modifier un plat |
| PATCH | `/api/dishes/:id/toggle` | Activer/désactiver |
| PATCH | `/api/dishes/:id/plat-du-jour` | Définir comme plat du jour |
| DELETE | `/api/dishes/:id` | Supprimer un plat |

---

## ⚡ WebSocket — Événements temps réel

Le serveur diffuse ces événements à tous les clients connectés :

| Événement | Déclencheur |
|-----------|-------------|
| `order:new` | Nouvelle commande créée |
| `order:updated` | Statut ou étape modifié |
| `order:deleted` | Commande supprimée |
| `dish:new` | Nouveau plat ajouté |
| `dish:updated` | Plat modifié |
| `dish:deleted` | Plat supprimé |
| `dish:platdujour` | Plat du jour changé |

---

## 💾 Base de données

Toutes les données sont sauvegardées dans `database/data/restaurant.json`.

- **Sauvegarde :** Copiez ce fichier régulièrement
- **Réinitialisation :** Supprimez ce fichier, il sera recréé avec les données de démo
- **Format :** JSON lisible, modifiable avec n'importe quel éditeur de texte

---

## 🔒 Sécurité

- Authentification par token JWT (12h de validité)
- Mots de passe hashés avec bcrypt
- Routes d'écriture protégées (création/modification/suppression)
- Routes de lecture publiques (commande client)

---

## 🛠️ Dépannage

**Port déjà utilisé :**
```bash
# Changez le port dans .env
PORT=4000
```

**Erreur "Cannot find module" :**
```bash
npm install
```

**Les données disparaissent :**
Vérifiez que le dossier `database/data/` est accessible en écriture.

**WebSocket déconnecté :**
Le frontend se reconnecte automatiquement toutes les 3 secondes.
