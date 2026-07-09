# HabitForge

HabitForge is a full-stack, data-driven web application designed to help users build and maintain consistent habits over time. It features a modern, responsive UI, real-time analytics, daily tracking, and a gamified achievements system.

## Features

- **Authentication**: Secure JWT-based registration, login, and session restoration.
- **Habit Tracking**: Create habits with customizable schedules (Daily, Weekdays, Custom).
- **Daily Check-ins**: Log your daily progress with timezone-aware tracking.
- **Contribution Graph**: A GitHub-style heatmap displaying your yearly check-in history.
- **Real Analytics**: Actionable insights, completion trends, and performance sorting.
- **Achievements**: Gamified milestone badges unlocked through consistent tracking.
- **Profile Management**: Update your details and change your password securely.
- **Responsive UI**: A polished, mobile-ready dashboard experience.

## Tech Stack

**Frontend**:
- React
- Vite
- React Router
- Axios
- Vanilla CSS (CSS Modules)

**Backend**:
- Node.js
- Express
- Prisma ORM
- MySQL

**Security & Quality**:
- JWT Authentication
- bcrypt Password Hashing
- Helmet & CORS
- Express Rate Limiting
- Zod Input Validation

## Architecture

The application strictly separates concerns using a layered architecture:
`Client (React) → REST API (Express) → Service Layer (Node) → ORM (Prisma) → Database (MySQL)`

Backend request flow:
`Routes → Validation Middleware → Controllers → Business Services → Prisma`

## Local Setup

### Prerequisites
- Node.js (v18+)
- MySQL (v8+)
- Git

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/habitforge.git
cd habitforge
```

### 2. Server Setup
```bash
cd server
npm install
```
Create a `.env` file based on `.env.example`:
```env
DATABASE_URL="mysql://root:password@localhost:3306/habitforge"
JWT_SECRET="your_secure_random_string_here"
JWT_EXPIRES_IN="7d"
PORT=5000
NODE_ENV="development"
CORS_ORIGIN="http://localhost:5174"
```

### 3. Database Initialization
```bash
# Push the schema and apply migrations
npx prisma migrate dev --name init

# Generate the Prisma client
npx prisma generate

# Seed the achievement catalog
npm run seed
```

### 4. Client Setup
Open a new terminal window:
```bash
cd client
npm install
```
Create a `.env` file based on `.env.example`:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### 5. Run the Application
**Backend**:
```bash
cd server
npm run dev
```
**Frontend**:
```bash
cd client
npm run dev
```

## Testing

The backend includes native Node.js tests for analytics and achievement engines, as well as an integration test framework.
```bash
cd server
npm test
```
*Note: To run destructive integration tests, you must configure a `TEST_DATABASE_URL` in your `.env`.*

## Production Build

To build the React frontend for production:
```bash
cd client
npm run build
```
The output will be placed in the `client/dist/` directory, ready to be hosted on Netlify, Vercel, or any static file host.

## API Overview

The REST API is structured around four main domains. Authentication is handled via `Bearer` tokens in the `Authorization` header.

- `/api/auth` - Registration, login, profile management.
- `/api/habits` - CRUD operations, daily check-ins, archiving.
- `/api/analytics` - Summary stats, heatmap contributions, completion trends.
- `/api/achievements` - Gamification catalog and recent unlocks.

*For detailed payload structures, refer to the client API modules.*

## Author
Designed and Developed by Harshil Bhardwaj.
