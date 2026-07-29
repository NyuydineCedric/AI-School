# Smart School AI — React + TypeScript + Tailwind

A 12-page school management UI (landing, auth, student portal, teacher portal)
matching the provided mockup. Built with Vite + React + TypeScript + Tailwind CSS.

## Setup

```bash
npm install
npm run dev
```

Then open http://localhost:5173

## Pages / routes

| # | Page                          | File                                | Route                              |
|---|-------------------------------|--------------------------------------|-------------------------------------|
| 1 | Landing Page                  | `src/pages/LandingPage.tsx`          | `/`                                  |
| 2 | Login Page                    | `src/pages/LoginPage.tsx`            | `/login`                             |
| 3 | Student Dashboard              | `src/pages/StudentDashboard.tsx`     | `/student/dashboard`                 |
| 4 | Courses Page (Student)        | `src/pages/CoursesPage.tsx`          | `/student/courses`                   |
| 5 | Assignment Details (Student)  | `src/pages/AssignmentDetails.tsx`    | `/student/assignments/:id`           |
| 6 | Quiz Page (Student)           | `src/pages/QuizPage.tsx`             | `/student/quizzes/:id`                |
| 7 | Exam Page (Student)           | `src/pages/ExamPage.tsx`             | `/student/exams/:id`                  |
| 8 | Grades Page (Student)         | `src/pages/GradesPage.tsx`           | `/student/grades`                    |
| 9 | AI Tutor (Student)            | `src/pages/AITutorPage.tsx`          | `/student/ai-tutor`                  |
|10 | Teacher Dashboard              | `src/pages/TeacherDashboard.tsx`     | `/teacher/dashboard`                 |
|11 | AI Question Generator (Teacher)| `src/pages/AIQuestionGenerator.tsx` | `/teacher/ai-question-generator`     |
|12 | AI Marking Center (Teacher)    | `src/pages/AIMarkingCenter.tsx`      | `/teacher/ai-marking`                |

## Shared components

- `src/components/Sidebar.tsx` — role-aware left nav (`role="student" | "teacher"`, `active="<key>"`).
  Handles the nav item list for pages 3–9 (student) and 10–12 (teacher).
- `src/components/TopHeader.tsx` — the "Welcome back, X!" header with bell + avatar (dashboards).
- `src/components/StatCard.tsx` — small metric card used on both dashboards.
- `src/types/index.ts` — shared TypeScript interfaces (Course, GradeRow, Student, etc).

## Notes on fidelity to the mockup

- Colors: indigo/violet accent (`indigo-600` / `violet-600`) on a white/slate-50 base,
  matching the reference image's palette.
- Layout: fixed 240px sidebar + scrollable main content area on every internal page,
  exactly mirroring the mockup's structure (logo top-left, nav list with icons, active
  item highlighted).
- Data (course names, grades, activity text, etc.) is hard-coded as sample/mock data
  directly in each page component — swap it for real API calls/state as needed.
- Icons use `lucide-react` (already used inside the mockup's own icon style).

## Next steps you may want

- Wire `Sidebar` links to real `<Link>`s from `react-router-dom` (currently `<a href="#">`
  placeholders so the static structure stays exactly readable/editable).
- Replace mock arrays in each page with data fetched from your backend.
- Add auth guards / role-based routing once you have real login.
