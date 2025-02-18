# KeyPoint

KeyPoint is a web application designed to help companies manage their projects efficiently. It enables tracking of projects, deliverables within projects, and tasks within deliverables. Additionally, it provides KPI tracking for employees, allowing them to update their KPIs while administrators can review and manage performance metrics.

## Table of Contents

- [KeyPoint](#keypoint)
  - [Table of Contents](#table-of-contents)
  - [Overview](#overview)
  - [Features](#features)
  - [Tech Stack](#tech-stack)
  - [Database Schema](#database-schema)
  - [Backend](#backend)
    - [Getting Started](#getting-started)
    - [Environment Variables](#environment-variables)
    - [API Endpoints](#api-endpoints)
      - [**Project Management**](#project-management)
      - [**Deliverable Management**](#deliverable-management)
      - [**User \& KPI Management**](#user--kpi-management)
  - [Frontend](#frontend)
    - [Getting Started](#getting-started-1)

## Overview

KeyPoint is designed to streamline project management with the following key functionalities:

- **Project Tracking**: Manage projects, deliverables, and tasks effectively.
- **KPI Management**: Employees can update their own KPIs while admins have oversight and control.
- **User Management**: Assign roles and permissions within projects.
- **REST API**: A structured API for backend interactions.
- **Modern UI**: Built with Next.js and Tailwind for a responsive and fast frontend.

## Features

- 🔹 **Project and Deliverable Tracking**
- 🔹 **Employee KPI Management**
- 🔹 **Role-Based Access Control**
- 🔹 **REST API for Seamless Integration**
- 🔹 **Next.js Frontend for Performance Optimization**
- 🔹 **Tailwind CSS for Responsive Design**

## Tech Stack

| Layer     | Technology |
|-----------|------------|
| Backend   | Node.js, Express.js
| Frontend  | Next.js, React, Tailwind CSS, TypeScript
| Database  | MySQL

## Database Schema
The schema is provided in the `database-schema.sql` file.

To install:
1. Create a new database in MySQL.
2. Run the SQL script in the new database.
3. The database is now set up with the required tables.

## Backend

The backend is implemented using **Node.js** and **Express.js**.

### Getting Started

1. **Install dependencies:**
    ```bash
    npm install
    ```

2. **Create a `.env` file** in the `backend-new` directory and add the required environment variables (see below).

3. **Start the server:**
    ```bash
    node server.js
    ```

### Environment Variables

Ensure you have a `.env` file with the following variables:

```
# Database configuration
DB_HOST=  # The hostname or IP address of your database server
DB_PORT=3306  # The port your database is running on (default for MySQL is 3306)
DB_NAME=  # The name of your database
DB_USER=root  # The username for database authentication
DB_PASS=  # The password for database authentication

# Server configuration
PORT=3333  # The port your backend will run on

# Authentication secrets
JWT_SECRET=  # Secret key for signing JWT tokens
REGISTER_SECRET=  # Secret key for user registration security

# Email service credentials
EMAIL_USER=  # The email address used for sending emails
EMAIL_PASS=  # The app-specific password for the email account
```


### API Endpoints

#### **Project Management**
- **Create a new project**: `POST /projects`
- **Retrieve a project by ID**: `GET /projects/:id`
- **Update a project**: `PUT /projects/:id`
- **Delete a project**: `DELETE /projects/:id`

#### **Deliverable Management**
- **Add a new deliverable**: `POST /deliverables/:id`
- **Update a deliverable**: `PUT /deliverables/:id`
- **Delete a deliverable**: `DELETE /deliverables/:id`

#### **User & KPI Management**
- **Create a project-user relationship**: `POST /project-users`
- **Update a project-user relationship**: `PUT /project-users/:id`
- **Remove a user from a project**: `DELETE /project-users/:id`
- **Update KPI**: `PUT /kpis/:userId`
- **Admin review KPI**: `GET /kpis/:userId`


## Frontend

The frontend is built with **Next.js**, ensuring fast performance and SEO optimization.

### Getting Started

1. **Install dependencies:**
    ```bash
    npm install
    ```

2. **Start the development server:**
    ```bash
    npm run dev
    ```

3. **Open the application in your browser:**
    ```
    http://localhost:3000
    ```