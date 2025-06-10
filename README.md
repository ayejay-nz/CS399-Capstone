# 📝 Shuffle

## 📋 Project Management
- Replace with lin

## 📖 Project Overview
Shuffle is a web-based exam generation and marking tool designed to automate the process of creating, and grading multiple-choice university exams. It generates multiple shuffled versions of an exam, handles answer sheet parsing, and allows instructors to manually adjust results with real-time feedback. 

Final report: link

## 🛠️ Technologies
| Component      | Tech & Version                          |
| -------------- | --------------------------------------- |
| **Backend**    | Node.js v20, Express v5, TypeScript v5.8 |
| **Frontend**   | Next.js v15, React v19, TailwindCSS v4   |
| **PDF Gen**    | libreoffice-convert v1.6, docx v9.5      |
| **Container**  | Docker, Docker Compose v2               |

## ⚙️ Installation & Setup

### Clone the repo
```bash
git clone https://github.com/uoa-compsci399-2025-s1/capstone-project-2025-s1-team-1.git
cd capstone-project-2025-s1-team-1
```

### Dev (recommended)
Run your app in development mode with live reload:

**First time:**
```bash
docker compose up --build
```

**Subsequent runs:**
```bash
docker compose up
```

### Production

First checkout the production branch:
```bash
git checkout -b production/v1
cd 
```

Build and start all services for production:

**First time:**
```bash
docker compose -f docker-compose.prod.yml up --build
```

**Subsequent runs:**
```bash
docker compose -f docker-compose.prod.yml up
```

## 💻 Usage Examples
Check out the demo:  
[![Watch the demo](https://img.youtube.com/vi/VQUk5Eiw33E/0.jpg)](https://www.youtube.com/watch?v=VQUk5Eiw33E&ab_channel=EmmaChen)

## 🌐 Live Deployment
The project is currently hosted at: **http://school.anthony-sh.co.nz**

## 🚀 Future Plans
