# 📝 Shuffle

## 📋 Project Management


## 📖 Project Overview
Shuffle is a web-based exam generation and marking tool designed to automate the process of creating, and grading multiple-choice university exams. It generates multiple shuffled versions of an exam, handles answer sheet parsing, and allows instructors to manually adjust results with real-time feedback. 

Final report [Check out here](https://docs.google.com/document/d/1qdr3JK7309Fd4P5voubXwPgjJzqmloc6PtIjxPnaYeA/edit?usp=sharing)

## 🛠️ Technologies
| Component      | Tech & Version                          |
| -------------- | --------------------------------------- |
| **Backend**    | Node.js v20, Express v5, TypeScript v5.8 |
| **Frontend**   | Next.js v15, React v19, TailwindCSS v4   |
| **PDF Gen**    | libreoffice-convert v1.6, docx v9.5      |
| **Container**  | Docker, Docker Compose v2               |

## 🌐 Live Deployment
The project is currently hosted at: **http://school.anthony-sh.co.nz**

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
cd capstone-project-2025-s1-team-1
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


## 🚀 Future Plans

🔗 Integrations
One of the most impactful future improvements would be integration with existing university systems such as Canvas. This would allow lecturers to directly export marked grades and exam data, reducing manual entry and ensuring data consistency.

✍️ Notion-Style Editor
A key area for future development is the implementation of a Notion-style, block-based text editor. This editor would provide an alternative to the current structured exam editor and help us fully replace the reliance on Microsoft Word for creating exams. More technically-inclined lecturers who prefer a flexible, keyboard-driven workflow could use intuitive slash commands (such as /question or /option) to build exams quickly and efficiently. At the same time, lecturers who prefer a traditional, form-based approach could continue using the existing editor.

👀 Live Preview
Currently, our platform offers a manual preview feature. A future live preview would provide immediate feedback as lecturers build and edit their exams. This enhancement would help catch formatting issues and improve user efficiency.

✏️ Manual Marking Capabilities
Enhancing the platform with manual marking options would support edge cases not covered by automated marking. Lecturers could upload single Teleform answer sheets or manually enter scores.

📂 Support for Additional Input Formats
Adding support for LaTeX and richer image/table formatting would make the platform suitable for Math, Physics, and other departments with more complex exam needs.

♿ Accessibility & UX Improvements
Future features may include:
. Light/dark mode toggle
. Larger text options
. Screen reader support
. Better filtering/sorting of results
. Richer performance analytics
