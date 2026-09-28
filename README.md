# Exam CSE PYQ Hub

## Overview
Exam CSE PYQ Hub is an educational platform designed for CSE students to access and practice Previous Year Questions (PYQs).  
It is intended to provide role-based access for Students and Teachers with secure authentication and PYQ management workflows.

## Features

### Student
- Student registration and login
- Secure authentication
- Browse PYQs
- Search PYQs
- Filter by subject
- Filter by semester
- Filter by examination/university
- View/download question papers
- Practice tests
- View personal results
- Manage profile

### Teacher
- Teacher registration and login
- Teacher dashboard
- Upload PYQs
- Add questions
- Edit questions
- Delete questions
- Manage subjects
- Manage PYQ categories
- View student activity
- Manage profile

## Authentication
The platform is intended to use:
- JWT authentication
- Password hashing
- Protected routes
- Role-based authorization
- Student and Teacher permission boundaries
- Logout flow
- Forgot/reset password flow

## Technology Stack
Based on the currently committed repository content, the following technologies are present:
- Documentation: Markdown (`README.md`)
- Version control setup: Git

> No frontend/backend source files or dependency manifests are currently committed in this branch, so runtime framework/database/auth library details cannot be verified from code yet.

## Project Structure
Current committed structure:

```text
POTE_PYQ_PORTSL/
├── .env.example
├── .gitignore
└── README.md
```

## Installation
```bash
git clone <repository-url>
cd POTE_PYQ_PORTSL
```

If/when frontend and backend source code is added, install dependencies using the package manager required by those folders.

## Environment Setup
1. Copy `.env.example` to `.env`
2. Fill in the required values for your environment

Example:
```bash
cp .env.example .env
```

## Running the Project
At the moment, this repository branch does not contain executable frontend/backend source code.  
After adding application source files, run the project with the corresponding start commands for each app module.

## Role-Based Access

Student:
- Access Student Dashboard
- View and practice PYQs
- View personal results

Teacher:
- Access Teacher Dashboard
- Upload and manage PYQs
- Manage questions and subjects
- View student activity

## API
Backend API source files are not currently present in this branch, so endpoint documentation cannot be generated from committed code yet.  
When backend code is added, document authentication APIs and PYQ CRUD/search/filter APIs here.

## Future Improvements
- Online examination system
- Performance analytics
- Question recommendations
- Notifications
- More university/college PYQs
- Mobile application

## Contribution
1. Fork the repository
2. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Make your changes and commit:
   ```bash
   git commit -m "Describe your change"
   ```
4. Push your branch:
   ```bash
   git push origin feature/your-feature-name
   ```
5. Open a Pull Request

## License
No license file is currently committed in this repository.  
For open collaboration, add a `LICENSE` file (commonly MIT) before public release.
