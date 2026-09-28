# Chat API

Express 5 REST API backed by MongoDB through Mongoose. Copy `.env.example` to `.env` and set `MONGODB_URI`, then run `npm run server` from the project root. The API defaults to port `3001`; Vite proxies `/api` requests to it during development.

## Structure

- `src/config` connects to MongoDB.
- `src/models` defines User, Conversation, and Message schemas.
- `src/controllers` contains API behavior.
- `src/routes` maps REST endpoints to controllers.
- `src/middleware` formats API errors.
- `src/app.js` configures Express; `src/server.js` loads environment and starts the database/API.

## Endpoints

- `GET /api/health` checks API and database availability.
- `POST /api/users` registers a user with `{ "name": "Ari Lane", "email": "ari@example.com", "password": "at-least-8-chars" }`. Passwords are hashed with bcrypt and never returned.
- `GET /api/users?search=ari` lists public user fields for conversation discovery.
- `GET /api/conversations?userId=<id>&folder=inbox|starred|archived` lists a user's conversations.
- `POST /api/conversations` creates one with `{ "userId": "<creator-id>", "participantIds": ["<other-id>"], "title": "Optional group title" }`. Group conversations require a title.
- `GET /api/conversations/:id?userId=<id>` fetches a conversation for one of its participants.
- `PATCH /api/conversations/:id` accepts `{ "userId": "<id>", "starred": true, "archived": false }`.
- `GET /api/conversations/:id/messages?userId=<id>&limit=50` lists messages for a participant.
- `POST /api/conversations/:id/messages` accepts `{ "senderId": "<id>", "text": "Hello" }`.

The current frontend has no login flow. User IDs are therefore supplied by API clients and are not authentication; add authentication/authorization before exposing this API publicly. Configure `FRONTEND_ORIGIN` when the browser frontend is hosted elsewhere.