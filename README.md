# 🎓 Among-us — College Branch Chatroom

> A real-time branch-based chatroom for college students.  
> Built with **React, Node.js, Express, MongoDB, and Socket.IO**.

---

## ✨ Features

- 🔑 **Authentication**
  - Login & Register with **college email only** (`@thapar.edu`)
  - Branch selection on signup
- 💬 **Branch-based chatrooms**
  - Students automatically join their branch room (e.g., CSE, ECE, ME, …)
- ⚡ **Real-time messaging**
  - Built with Socket.IO
  - Optimistic UI updates (messages appear instantly)
- 👀 **Message states**
  - Sent ✓, Delivered ✓, Read ✓✓
- ⌨️ **Typing indicators**
  - See who’s typing in your branch
- 🟢 **Online presence**
  - Live count of active users per branch
- 🎨 **Modern UI**
  - Responsive, minimal, and clean
  - Light bubble-style chat with avatars
- 🔒 **Secure**
  - Passwords hashed
  - JWT token-based authentication
  - Only college students can register/login

---

## 🛠️ Tech Stack

**Frontend**  
- React (functional components, hooks)  
- React Router  
- Modern CSS (responsive design)  

**Backend**  
- Node.js + Express  
- MongoDB Atlas (Mongoose ODM)  
- Socket.IO (real-time events)  
- JWT for authentication  

---

## 🚀 Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/BON1TO/Among-us.git
cd Among-us
