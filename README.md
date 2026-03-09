# Cake Clash: Hamster vs Cat

A private two-player online drawing and guessing game with cake-throw battles.

## Tech stack

- Node.js
- Express
- Socket.io
- HTML/CSS/JavaScript canvas frontend

## Project structure

- `client/` - browser UI, drawing tools, battle visuals, word utilities
- `server/` - Express server, Socket.io room logic, multiplayer state
- `render.yaml` - optional Render Blueprint config

## Local run

### 1. Install dependencies

```bash
npm install
```

If PowerShell blocks `npm`, use:

```bash
npm.cmd install
```

### 2. Start the server

```bash
npm start
```

If PowerShell blocks `npm`, use:

```bash
npm.cmd start
```

### 3. Open the game

Open:

```text
http://localhost:3000
```

### 4. Test multiplayer locally

1. Open the site in browser window 1.
2. Click `Create Room`.
3. Copy the private room link.
4. Open that link in browser window 2 or on a second device.
5. The host becomes `Hamster (Edvard)`.
6. The second player becomes `Slim Black Cat (Elina)`.

## Render deployment

The app is already prepared for Render:

- start script: `npm start`
- dynamic port handling: uses `process.env.PORT`
- health check route: `/health`
- optional Blueprint file: `render.yaml`

No environment variables are required for basic deployment.

## Deploy on Render with Blueprint

### 1. Push this project to GitHub

From the project folder:

```bash
git init
git add .
git commit -m "Prepare Cake Clash for Render"
```

Create a GitHub repo, then push it:

```bash
git remote add origin YOUR_GITHUB_REPO_URL
git branch -M main
git push -u origin main
```

### 2. Create the Render service

1. Sign in to [Render](https://render.com/).
2. Click `New`.
3. Click `Blueprint`.
4. Connect your GitHub account if needed.
5. Select the repository that contains this project.
6. Render will detect `render.yaml` automatically.
7. Confirm the new web service.

### 3. Wait for the deploy to finish

Render will run:

- build command: `npm install`
- start command: `npm start`

When the deploy is finished, Render will give you a public URL like:

```text
https://cake-clash-hamster-vs-cat.onrender.com
```

### 4. Play online

1. Open the Render URL.
2. Click `Create Room`.
3. Send the generated `/room/ABCDE` link to the second player.
4. When the second player joins, the match starts automatically.

## Deploy on Render manually without Blueprint

If you do not want to use `render.yaml`, do this instead:

### 1. Push the project to GitHub

Use the same Git steps shown above.

### 2. Create a new Web Service in Render

1. Sign in to [Render](https://render.com/).
2. Click `New`.
3. Click `Web Service`.
4. Select the GitHub repository.
5. Use these exact settings:

- Environment: `Node`
- Build Command: `npm install`
- Start Command: `npm start`
- Root Directory: leave blank
- Instance Type: any plan you want

### 3. Deploy

Click `Create Web Service` and wait for the build to complete.

## Health check

Render can use this path for health checks:

```text
/health
```

Expected response:

```json
{"ok":true}
```

## Notes for online multiplayer

- This is a single Render web service hosting both the frontend and Socket.io backend.
- Both players should use the same deployed domain.
- Private rooms are created in server memory.
- If the Render service restarts, active rooms reset.
- On the free plan, Render may sleep after inactivity, so the first load can be slow.

## Useful commands

```bash
npm install
npm start
```
