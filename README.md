# Smart Digital Platform for Chartered Accountants

![Project Status](https://img.shields.io/badge/Status-Completed-success) ![Tech Stack](https://img.shields.io/badge/Tech-MERN_Stack-blue) ![WebSockets](https://img.shields.io/badge/RealTime-Socket.io-orange)

A fully functional, modern, real-time client management platform designed explicitly for Chartered Accountants (CAs). This platform replaces traditional, static CA websites with a dual-sided digital portal where both CAs and their Clients can securely interact, upload financial documents, settle invoices, and receive real-time notifications.

## 🚀 Features

### **Authentication & Access Rules**
- Secure **JSON Web Token (JWT)** integration.
- Custom **Role-Based Access Control** (Admin/CA vs. Client workflows).
- Invite-Code System: Clients join and are intrinsically linked to their inviting CA.

### **Admin Dashboard (CA View)**
- **Client Management:** Overview metrics tracking your total client scope.
- **Financial Analytics:** Live interactive bar-charts (built with `Recharts`) detailing pending vs. secured revenue.
- **Invoicing & Notifications:** Secure document push workflows to individual clients triggering real-time Socket.io popups.

### **Client Dashboard (User View)**
- **Document Management:** Multi-part file upload built with `Multer` explicitly designed for handling sensitive PDFs and tax docs.
- **Invoice Tracking:** Overview screen displaying Unpaid/Paid invoices natively linked to the parent CA.
- **Live Sync:** Instant alerts anytime a CA updates your status entirely without needing to refresh the page.

## 💻 Technology Stack

### **Frontend**
- **React.js** (Bootstrapped with Vite for maximum performance)
- **Vanilla CSS3** (Utilizing modern CSS variables and flexbox for a premium SaaS dashboard aesthetic)
- **React Router** for secure, nested routing paths
- **Recharts** for data visualization
- **Lucide-React** for premium iconography

### **Backend**
- **Node.js & Express.js**
- **MongoDB** (Hosted natively or via Atlas Cloud) mapped with **Mongoose ODM**.
- **Multer** for local volume file storage
- **BCrypt.js** for rigid password hashing protocols
- **Socket.io** bridging absolute real-time bidirectional communication.

## ⚙️ Running Locally

### 1. Requirements
Ensure you have **Node.js** and **MongoDB** installed on your system.
> *Note: If using MongoDB Atlas, replace the default `MONGO_URI` locally with your Cloud deployment URL.*

### 2. Backend Set-Up
Navigate into the `backend/` directory, set up your enviroment keys, and launch:
```bash
cd backend
npm install

# Create a .env file locally containing:
# MONGO_URI=your_mongodb_cluster_or_local_url
# JWT_SECRET=your_jwt_secret

node server.js
```
The node API will spool up natively on `localhost:5000`.

### 3. Frontend Set-Up
Navigate into the `frontend/` directory and launch the Vite compiler:
```bash
cd frontend
npm install
npm run dev
```

The web application will spool up iteratively on `localhost:5173`. Open this URL in two distinct browser instances to test the robust 2-way real-time websocket protocols between a simulated Admin and simulated Client.
