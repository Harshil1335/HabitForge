# HabitForge API Reference

All protected routes require a JWT token in the `Authorization` header:
`Authorization: Bearer <your_token>`

## Standard Responses

**Success (200 OK):**
```json
{
  "success": true,
  "data": { ... }
}
```

**Error (400 / 401 / 403 / 404 / 500):**
```json
{
  "success": false,
  "error": {
    "message": "Human readable error description",
    "code": "ERROR_CODE"
  }
}
```

---

## Authentication (`/api/auth`)

### `POST /api/auth/register`
Creates a new user.
- **Body**: `{ "name", "email", "password" }`
- **Response**: `{ "user", "token" }`

### `POST /api/auth/login`
Authenticates a user.
- **Body**: `{ "email", "password" }`
- **Response**: `{ "user", "token" }`

### `GET /api/auth/me`
Fetches the currently authenticated user session.
- **Headers**: Authorization required.
- **Response**: `{ "user" }`

### `PUT /api/auth/profile`
Updates user profile information.
- **Body**: `{ "name" }`
- **Response**: `{ "user" }`

### `PUT /api/auth/change-password`
Changes user password securely.
- **Body**: `{ "currentPassword", "newPassword" }`
- **Response**: `{ "message" }`

---

## Habits (`/api/habits`)

### `POST /api/habits`
Creates a new habit.
- **Body**: `{ "name", "description", "frequencyType", "targetDays", "icon", "color" }`
- **Response**: `{ "habit" }`

### `GET /api/habits?status=<active|archived>&timezone=<tz>`
Fetches the user's habits. Include `timezone` (e.g. `America/New_York`) for accurate `isCheckedInToday` calculation.
- **Query**: `status` (optional), `timezone` (required)
- **Response**: `[ { "id", "name", ..., "isCheckedInToday" } ]`

### `PUT /api/habits/:id`
Updates habit properties.

### `DELETE /api/habits/:id`
Permanently deletes a habit and its check-in history.

### `PATCH /api/habits/:id/archive`
Archives or restores a habit.
- **Body**: `{ "isArchived": boolean }`

### `POST /api/habits/:id/checkin`
Logs a check-in for the current day in the provided timezone.
- **Body**: `{ "timezone" }`

### `DELETE /api/habits/:id/checkin`
Undoes a check-in for the current day in the provided timezone.
- **Body**: `{ "timezone" }`

---

## Analytics (`/api/analytics`)

### `GET /api/analytics/dashboard`
Fetches comprehensive data necessary for the dashboard.
- **Query**: `timezone` (required)
- **Response**: `{ "summary", "weekly", "topStreaks", "contributions" }`

### `GET /api/analytics/summary`
Fetches high-level summary statistics.
- **Query**: `timezone` (required), `range` (optional, default 30d)
- **Response**: `{ "summary" }`

### `GET /api/analytics/heatmap`
Fetches 365 days of contribution graph data.
- **Query**: `timezone` (required)
- **Response**: `[ { "date", "scheduled", "completed", "completionRate", "level" } ]`

### `GET /api/analytics/trend`
Fetches completion trend data (days or months) based on range.
- **Query**: `timezone` (required), `range` (optional)
- **Response**: `[ { "label", "completionRate" } ]`

### `GET /api/analytics/performance`
Fetches habit-specific performance rankings.
- **Query**: `timezone` (required), `range` (optional), `sort` (highestCompletion|lowestCompletion|longestStreak)

---

## Achievements (`/api/achievements`)

### `GET /api/achievements`
Evaluates progress against the achievement catalog and persists new unlocks.
- **Query**: `timezone` (required)
- **Response**: `{ "summary", "achievements", "newlyUnlocked" }`

### `GET /api/achievements/recent`
Fetches the most recently unlocked achievements for the dashboard.
- **Query**: `timezone` (required), `limit` (optional, default 3)
- **Response**: `{ "achievements" }`
