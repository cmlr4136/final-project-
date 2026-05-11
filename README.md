# final-project-
# Quick Start

## Prerequisites

Make sure you have the following installed before running the app:

- **JDK 21**
- **Node.js**

## Running the App

You'll need **two terminals open at the same time**.

### Terminal 1 — Backend

From the root of the repo:

```bash
# Mac/Linux only — make the Gradle wrapper executable (first time only)
chmod +x gradlew

./gradlew run
```

> On **Windows**, use `gradlew.bat run` instead.

Wait until you see `Application started` in the logs. The backend will be running at `http://localhost:8080`.

### Terminal 2 — Frontend

```bash
cd web
npm install       # only needed the first time
npm run dev
```

The frontend will be available at `http://localhost:5173`.

## Login

Open `http://localhost:5173` in your browser and log in with the default admin account:

| Field    | Value               |
|----------|---------------------|
| Email    | admin@example.com   |
| Password | admin               |

