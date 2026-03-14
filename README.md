# Lanterns of the Fjord

## Install

### Client

```powershell
cd client
npm install
```

### Server

```powershell
cd server
npm install
```

## Run

### Start the multiplayer server

```powershell
cd server
npm start
```

The Socket.io server runs on `http://localhost:3001` by default.

### Start the client

```powershell
cd client
npm run dev
```

The Vite client runs on `http://localhost:5173` by default.

## Create a room

1. Open the client in a browser.
2. Click `Create Room`.
3. The URL will update to `?room=ROOMCODE`.
4. Copy the invite link from the overlay.

## Join a room

1. Open the invite link on the second machine or browser.
2. The client will automatically connect and join the room.
3. The first player is assigned `edvard`.
4. The second player is assigned `elina`.

## Notes

- Each client controls only its assigned character.
- Player one hosts as Edvard.
- Player two joins as Elina.
- The remote player is synchronized through Socket.io room state updates.
- For LAN testing, make sure both machines can reach the server on port `3001`.
- If you want the client to connect to a different server host, set `VITE_SERVER_URL` before running `npm run dev` in `client`.
