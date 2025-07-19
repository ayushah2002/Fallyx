# Fallyx
A web application for incident tracking and summarization, using Next.js (React), Node.js (Express), Firebase Auth, PostgreSQL, and OpenAI

# Prerequisites
Node.js, npm, firebase project, Docker Desktop, An OpenAI Account with API Key

# Firebase Setup
Create a project for web app.
Enable Google sign-on method. 
Retrieve the config details from Project Settings -> General --> Web App (logo) and register the app
These details are entered in my frontend/lib/firebase.ts file.

For the backend, generate a new private key in Firebase Console (Project Settings -> Service Accounts)
Enter these in the backend.env file.

# Postgres on Docker setup
Create a container that runs a postgres DB
Enter the details in the backend .env file

Command:
docker run \
  --name fallyx-pgdb \
  -e POSTGRES_DB=fallyx \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=test_2025 \
  -p 5432:5432 \
  -d postgres

# pgAdmin setup to view DB
docker run -d \
  --name fallyx-pgadmin \
  -e PGADMIN_DEFAULT_EMAIL=admin@fallyx.com \
  -e PGADMIN_DEFAULT_PASSWORD=admin \
  -p 5050:80 \
  dpage/pgadmin4

This will have pgAdmin running alongisde the docker postgres container.
This is available on localhost:5050
Login with the credentials from above.
Right-click servers and create a new server.
Name: fallyxPostgres
Naviage to Connection tab
Host name/address: host.docker.internal
Rest is as you setup above.

# How to run the Frontend
cd frontend
npm install
npm run dev
--> will run on localhost:3000

# How to run the Backend
cd backend
npm install
npm run dev
--> will run on localhost:4000

# How to run the tests
cd Fallyx 
npm test