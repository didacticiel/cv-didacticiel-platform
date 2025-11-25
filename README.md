# 🚀 CV-DIDACTICIEL-PLATFORM

Plateforme éducative pour la création de CV professionnels, développée avec **Django** pour le backend API et **Vite/React** pour le frontend.

---

## 🌟 Fonctionnalités Principales

* **Authentification Robuste :** Connexion/Inscription par e-mail et **Google OAuth (méthode ID Token)**.
* **Gestion de CV :** Création, modification, et suppression de CV.
* **API RESTful :** Backend robuste basé sur Django REST Framework (DRF).
* **Frontend Moderne :** Interface utilisateur réactive et rapide construite avec Vite et React.
* **Paiements (En attente) :** Intégration Fedapay.
* **Tâches Asynchrones :** Utilisation de Celery et Redis.

---

## ⚙️ Technologies Utilisées

| Composant | Technologie | Rôle |
| :--- | :--- | :--- |
| **Backend** | Python, Django, DRF | API REST, Logique métier. |
| **Authentification** | **JWT (Simple JWT)** | Utilisation directe du **Google ID Token** pour l'authentification. |
| **Base de données** | PostgreSQL | Stockage des données structurées. |
| **Frontend** | React, Vite, **`@react-oauth/google`** | Interface utilisateur rapide et moderne. |
| **Cache/Queue** | Redis, Celery | Tâches asynchrones et mise en cache. |

---

## 📦 Guide d'Installation

Ce projet utilise une structure mono-repo avec des dossiers **`backend`** (Django) et **`frontend`** (Vite/React) séparés.

### Prérequis

* Python (3.10+)
* Node.js (ou Bun/Yarn)
* PostgreSQL
* Redis

### Étape 1 : Cloner le Répertoire


git clone [https://github.com/didacticiel/cv-didacticiel-platform](https://github.com/didacticiel/cv-didacticiel-platform)
cd cv-didacticiel-platform


Étape 2 : Configuration des Fichiers d'Environnement (.env)
Créez les fichiers d'environnement dans les dossiers respectifs et insérez le contenu ci-dessous.

A. Backend (backend/.env) - Conten

# Configuration Django/DB
DEBUG=True
SECRET_KEY=votre_cle_secrete_django_ici_a_changer_absolument
DATABASE_NAME=le votre
DATABASE_USER=le votre
DATABASE_PASSWORD=le votre
DATABASE_HOST=localhost
DATABASE_PORT=5432

# Google OAuth (Utilisé pour vérifier l'ID Token)
GOOGLE_OAUTH_CLIENT_ID=le votre

# Redirection et CORS
FRONTEND_URL=http://localhost:8080
CORS_ALLOWED_ORIGINS=http://localhost:8080

# Paiement (Fedapay)
FEDAPAY_ENVIRONMENT=sandbox
FEDAPAY_SECRET_KEY=sk_test_votre_secret_key_fedapay
FEDAPAY_PUBLIC_KEY=pk_test_votre_public_key_fedapay

B. Frontend (frontend/.env) - Contenu
# Variables publiques lues par Vite (préfixe VITE_)
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_GOOGLE_CLIENT_ID=le votre
VITE_FRONTEND_URL=http://localhost:8080

Étape 3 : Démarrer le Backend (Django)
Naviguer & Venv :

cd backend
source venv/bin/activate #ici pour linux

Installation & Setup :
pip install -r requirements.txt
python manage.py migrate

Démarrer :

Bash

python manage.py runserver
URL : http://127.0.0.1:8000/

Étape 4 : Démarrer le Frontend (Vite/React)
Naviguer & Installation :

cd ../frontend
bun install
# ou npm install / yarn install
Démarrer :
bun run dev
# ou npm run dev / yarn dev
URL : http://localhost:8080/



## 🌐 Configuration Google OAuth
Pour que la connexion Google fonctionne, vous devez configurer un ID Client Web dans la Google Cloud Console.

Assurez-vous que l'ID Client est le même dans backend/.env (GOOGLE_OAUTH_CLIENT_ID) et frontend/.env (VITE_GOOGLE_CLIENT_ID).

Ajoutez l'URI de redirection suivante dans les URIs de redirection autorisés de votre identifiant OAuth 2.0 (cette URI est utilisée par le SDK Google après la connexion) :

http://localhost:8080