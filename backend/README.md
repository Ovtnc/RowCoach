# RowCoach Backend

Backend API for RowCoach mobile application.

## Features

- User authentication (JWT)
- Club management
- Training management
- Multi-row session management
- Real-time communication (Socket.io)
- Workout tracking

## Tech Stack

- Node.js
- Express.js
- TypeScript
- MongoDB
- Socket.io
- JWT

## Installation

```bash
npm install
```

## Environment Variables

Create a `.env` file:

```env
PORT=3000
NODE_ENV=production
MONGODB_URI=mongodb://localhost:27017/rowcoach
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
CORS_ORIGIN=*
```

## Development

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Production

```bash
npm start
```

## Deployment

See `DEPLOYMENT.md` in the root directory for deployment instructions.
