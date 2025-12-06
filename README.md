# Dwell Pass

A Local-First system for recording attendance of users for Events.

### Setting up

### This project uses bun sqlite and runtime

1. Bun install
2. For first time run setup the project by running `bun run setup`
3. Without Step 2 you will get an error when you start the app.

## Server Curl Examples

### Health check
curl http://localhost:3000/health

### Get all users (empty initially)
curl http://localhost:3000/api/users

### Create a user
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "test@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }'