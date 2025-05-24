```markdown
# 🎥 YouTube Clone Backend API

This is a **Node.js + MongoDB** backend project that replicates core functionality of YouTube — built with scalability, security, and production-readiness in mind.

---

## 🚀 Features Implemented

### 🔐 Authentication & Authorization

- **User Registration** – Create a new user with hashed password and validation.
- **User Login** – Secure login with JWT-based access and refresh tokens.
- **Refresh Token** – Maintains long-lived sessions securely.
  - Validates refresh token (from HTTP-only cookie or request body)
  - Compares against DB and issues new tokens
- **Logout** – Invalidates token pair and clears cookies.
  - Removes refresh token from DB
  - Clears `accessToken` and `refreshToken` cookies

### 👤 User Profile

- **Get Current User** – Fetch authenticated user details.
- **Update Name or Email** – Patch user's name/email with validation.
- **Update Avatar / Cover Image** – Patch user’s profile visuals.

### 📺 Channel Functionality

- **User Channel Profile** – View a user’s public channel data:
  - Username, full name, email, avatar, cover image
  - Subscriber count
  - Channels they are subscribed to
  - Whether current user is subscribed

### 📼 Watch History

- **Channel History API** (`GET /users/channelHistory`)
  - Returns user's watch history (list of videos)
  - Each video includes:
    - Owner info (username, full name, avatar)
    - Enriched with nested MongoDB `$lookup` pipelines
  - Empty array if no history — handled gracefully

---

## 🛠️ Tech Stack

- **Backend**: Node.js, Express
- **Database**: MongoDB, Mongoose
- **Authentication**: JWT, HTTP-only cookies
- **Dev Tools**: Postman, Nodemon, ESLint
- **Architecture**: RESTful API, modular controllers/services

---

## 📁 Folder Structure

```

src/
├── controllers/
├── models/
├── routes/
├── middlewares/
├── utils/
├── config/
├── services/

````

---

## 🔐 Environment Variables

Create a `.env` file with the following:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/youtube-clone
ACCESS_TOKEN_SECRET=yourAccessSecret
REFRESH_TOKEN_SECRET=yourRefreshSecret
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d
````

---

## 🚧 Upcoming Features

* ✅ Video Upload / CRUD
* ✅ Like / Dislike system
* ✅ Comments & Replies
* ✅ Subscriptions & Notifications
* 🔜 Real-time chat / WebSocket support
* 🔜 Admin Panel / Moderation

---


## 🧠 Lessons & Takeaways

* Secure cookie management with `httpOnly` + `sameSite`
* Refresh token lifecycle & token rotation
* MongoDB Aggregation Framework for relational-like queries
* Clean RESTful design with error handling middleware

---

## 📬 Contact

Built with ❤️ by \[Aniket Chile]
Reach me on [LinkedIn](https://linkedin.com/in/your-profile](https://www.linkedin.com/in/aniket-chile-576421202/) or drop a ⭐ if you like the repo!

```

---
```
