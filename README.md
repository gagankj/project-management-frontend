# Internal Project Management Tool

## Project Overview

The Internal Project Management Tool is a web based application designed to help teams manage projects and tasks efficiently within an organization.

Users can register and log in to the platform, create projects, add team members to projects, create and assign tasks, track task progress, and collaborate within project boundaries.

The application provides secure authentication and authorization, ensuring that only authorized users can access project and task information.

### Key Features

* User Registration and Login
* Secure Authentication using JWT
* Create, Edit, and Delete Projects
* Add and Remove Project Members
* Create, Edit, and Delete Tasks
* Assign Tasks to Project Members
* Update Task Status (Todo, In Progress, Done)
* View Assigned Tasks
* Project Based Access Control
* User Logout Functionality

---

# Tech Stack

## Frontend

* React
* TypeScript
* Tailwind CSS
* Redux Toolkit
* React Router DOM
* React Hook Form
* Zod
* Axios

## Backend

* Node.js
* Express.js
* MongoDB Atlas
* Mongoose
* JWT Authentication
* bcrypt

---

# Local Setup

# Clone Repositories

## Clone Frontend Repository

```bash
git clone https://github.com/gagankj/project-management-frontend.git
```

## Clone Backend Repository

```bash
git clone https://github.com/gagankj/project-management-server.git
```


## Install Dependencies

Frontend:

```bash
cd frontend
npm install
```

Backend:

```bash
cd backend
npm install
```

## Configure Environment Variables

Create a `.env` file for both frontend and backend.

### Backend Environment Variables

```env
PORT=5000

MONGODB_URI=your_mongodb_uri

JWT_SECRET=your_jwt_secret

CLIENT_ORIGIN = http://localhost:5173
```

### Frontend Environment Variables

```env
VITE_API_URL=http://localhost:5000/api
```

## Database Setup

You can use either:

* MongoDB Atlas (Recommended)
* Local MongoDB Installation

Store the MongoDB connection string inside the backend `.env` file.

## Run Application

Backend:

```bash
npm run dev
```

Frontend:

```bash
npm run dev
```

## First Time Usage

1. Register a new user account.
2. Login using registered credentials.
3. Create a project.
4. Add project members.
5. Create and assign tasks.
6. Track and update task progress.

---

# Deployment

## Frontend

* Platform: Vercel
* URL: <frontend-deployment-url>

## Backend

* Platform: Render
* URL: <backend-deployment-url>

### Deployment Notes

* Configure environment variables on both platforms.
* Update frontend API base URL to point to the deployed backend.
* Configure MongoDB Atlas network access for production deployment.

---

# Folder Structure

## Frontend

```text
frontend

src

├── assets
├── components
├── pages
├── routes
├── redux
├── schemas
├── services
├── types

├── App.tsx
├── main.tsx
├── index.css

.env
```

### Folder Description

#### assets

Stores images, icons, and other media assets.

#### components

Reusable UI components such as:

* Button
* Input
* Sidebar
* Modal
* Confirmation Dialog

#### pages

Application pages:

* Login
* Register
* Projects
* Project Details
* Tasks
* Dashboard

#### routes

Routing configuration:

* AppRoutes
* PrivateRoutes
* PublicRoutes

#### redux

Redux Toolkit store and slices.

#### schemas

Zod validation schemas for forms and request validation.

#### services

Axios configuration and API service methods.

#### types

TypeScript interfaces and types.

---

## Backend

```text
backend

src

├── config
├── controllers
├── middleware
├── models
├── routes

├── app.js
├── server.js

.env
```

### Folder Description

#### config

MongoDB connection configuration.

#### controllers

Application business logic:

* Auth Controller
* User Controller
* Project Controller
* Task Controller

#### middleware

Application middleware:

* Authentication Middleware
* Authorization Middleware

#### models

MongoDB models:

* User
* Project
* Task

#### routes

API route definitions:

* Auth Routes
* User Routes
* Project Routes
* Task Routes

---

# API List

## Authentication

### POST

```http
/api/auth/register
```

Register a new user.

```http
/api/auth/login
```

Authenticate user and generate JWT token.

---

## Projects

### GET

```http
/api/projects
```

Get all accessible projects.

```http
/api/projects/:id
```

Get project details.

### POST

```http
/api/projects
```

Create a new project.

```http
/api/projects/:id/tasks
```

Create a task within a project.

### PUT

```http
/api/projects/:id
```

Update project information.

### DELETE

```http
/api/projects/:id
```

Delete a project.

---

## Tasks

### GET

```http
/api/tasks/my-tasks
```

Get tasks assigned to the logged in user.

### PUT

```http
/api/tasks/:id
```

Update task details.

```http
/api/tasks/:id/status
```

Update task status.

### DELETE

```http
/api/tasks/:id
```

Delete a task.

---

## Users

### GET

```http
/api/users
```

Get system users for project member assignment.
