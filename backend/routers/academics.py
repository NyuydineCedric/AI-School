from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
import json


from database import get_db
import models
from auth import get_current_user, require_role

router = APIRouter(tags=["academics"])


# ---------- Courses ----------
@router.get("/courses")
def list_courses(db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    if user.role == "teacher":
        courses = db.query(models.Course).filter(models.Course.instructor_id == user.id).all()
        result = []
        for c in courses:
            student_count = db.query(models.Enrollment).filter(models.Enrollment.course_id == c.id).count()
            grades = db.query(models.Grade).filter(models.Grade.course_id == c.id).all()
            avg = round(sum(g.score_pct for g in grades) / len(grades)) if grades else 0
            result.append({"id": c.id, "name": c.name, "color": c.color, "students": student_count, "avg": f"{avg}%"})
        return result

    enrollments = db.query(models.Enrollment).filter(models.Enrollment.student_id == user.id).all()
    result = []
    for e in enrollments:
        course = db.query(models.Course).filter(models.Course.id == e.course_id).first()
        instructor = db.query(models.User).filter(models.User.id == course.instructor_id).first()
        result.append({
            "id": course.id,
            "name": course.name,
            "instructor": instructor.name if instructor else "",
            "progress": e.progress,
            "color": course.color,
        })
    return result


# ---------- Assignments ----------
class SubmitAssignmentRequest(BaseModel):
    content: str


@router.get("/assignments")
def list_assignments(db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    # list_assignments, teacher branch — was: return db.query(...).filter(...).all()
    if user.role == "teacher":
        course_ids = [c.id for c in db.query(models.Course).filter(models.Course.instructor_id == user.id)]
        assignments = db.query(models.Assignment).filter(models.Assignment.course_id.in_(course_ids)).all()
        return [{"id": a.id, "title": a.title, "due_date": a.due_date, "max_marks": a.max_marks} for a in assignments]

    course_ids = [e.course_id for e in db.query(models.Enrollment).filter(models.Enrollment.student_id == user.id)]
    assignments = db.query(models.Assignment).filter(models.Assignment.course_id.in_(course_ids)).all()

    result = []
    for a in assignments:
        sub = db.query(models.Submission).filter(
            models.Submission.assignment_id == a.id, models.Submission.student_id == user.id
        ).first()
        result.append({
            "id": a.id, "title": a.title, "instructions": a.instructions,
            "due_date": a.due_date, "max_marks": a.max_marks,
            "status": sub.status if sub else "Not Submitted",
        })
    return result


@router.get("/assignments/{assignment_id}")
def get_assignment(assignment_id: str, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    a = db.query(models.Assignment).filter(models.Assignment.id == assignment_id).first()
    if not a:
        raise HTTPException(status_code=404, detail="Assignment not found")
    sub = db.query(models.Submission).filter(
        models.Submission.assignment_id == a.id, models.Submission.student_id == user.id
    ).first()
    return {
        "id": a.id, "title": a.title, "instructions": a.instructions,
        "due_date": a.due_date, "max_marks": a.max_marks,
        "submission": {"status": sub.status, "content": sub.content} if sub else None,
    }


@router.post("/assignments/{assignment_id}/submit")
def submit_assignment(
    assignment_id: str, payload: SubmitAssignmentRequest,
    db: Session = Depends(get_db), user: models.User = Depends(require_role("student")),
):
    sub = db.query(models.Submission).filter(
        models.Submission.assignment_id == assignment_id, models.Submission.student_id == user.id
    ).first()
    if not sub:
        sub = models.Submission(assignment_id=assignment_id, student_id=user.id)
        db.add(sub)

    sub.content = payload.content
    sub.status = "Submitted"
    sub.submitted_at = datetime.utcnow()
    db.commit()
    return {"status": "Submitted"}


# ---------- Quizzes ----------
@router.get("/quizzes/{quiz_id}")
def get_quiz(quiz_id: str, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    quiz = db.query(models.Quiz).filter(models.Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    questions = db.query(models.QuizQuestion).filter(models.QuizQuestion.quiz_id == quiz_id).all()
    # Correct option withheld from students; teachers can see everything.
    return {
        "id": quiz.id, "title": quiz.title, "duration_minutes": quiz.duration_minutes,
        "questions": [
            {
                "id": q.id, "text": q.text, "marks": q.marks,
                "options": {"A": q.option_a, "B": q.option_b, "C": q.option_c, "D": q.option_d},
                **({"correct_option": q.correct_option} if user.role == "teacher" else {}),
            }
            for q in questions
        ],
    }


class QuizSubmitRequest(BaseModel):
    answers: dict  # { question_id: "A" }


@router.post("/quizzes/{quiz_id}/submit")
def submit_quiz(
    quiz_id: str, payload: QuizSubmitRequest,
    db: Session = Depends(get_db), user: models.User = Depends(require_role("student")),
):
    questions = db.query(models.QuizQuestion).filter(models.QuizQuestion.quiz_id == quiz_id).all()
    total_marks = sum(q.marks for q in questions) or 1
    earned = sum(q.marks for q in questions if payload.answers.get(q.id) == q.correct_option)
    score_pct = round((earned / total_marks) * 100, 1)

    attempt = models.QuizAttempt(
        quiz_id=quiz_id, student_id=user.id,
        answers_json=json.dumps(payload.answers), score=score_pct, submitted=True,
    )
    db.add(attempt)
    db.commit()
    return {"score_pct": score_pct, "earned": earned, "total": total_marks}


# ---------- Exams ----------
@router.get("/exams/{exam_id}")
def get_exam(exam_id: str, db: Session = Depends(get_db)):
    exam = db.query(models.Exam).filter(models.Exam.id == exam_id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")
    return {
        "id": exam.id, "title": exam.title,
        "instructions": exam.instructions, "duration_minutes": exam.duration_minutes,
    }


class ExamAnswerRequest(BaseModel):
    answer_text: str


@router.post("/exams/{exam_id}/answer")
def save_exam_answer(
    exam_id: str, payload: ExamAnswerRequest,
    db: Session = Depends(get_db), user: models.User = Depends(require_role("student")),
):
    answer = db.query(models.ExamAnswer).filter(
        models.ExamAnswer.exam_id == exam_id, models.ExamAnswer.student_id == user.id
    ).first()
    if not answer:
        answer = models.ExamAnswer(exam_id=exam_id, student_id=user.id)
        db.add(answer)
    answer.answer_text = payload.answer_text
    db.commit()
    return {"saved": True}


# ---------- Grades ----------
@router.get("/grades")
def get_grades(db: Session = Depends(get_db), user: models.User = Depends(require_role("student"))):
    grades = db.query(models.Grade).filter(models.Grade.student_id == user.id).all()
    rows = []
    total_credits = 0
    gpa_points = {"A": 4.0, "A-": 3.7, "B+": 3.3, "B": 3.0, "B-": 2.7, "C+": 2.3, "C": 2.0}
    weighted = 0.0
    for g in grades:
        course = db.query(models.Course).filter(models.Course.id == g.course_id).first()
        rows.append({
            "course": course.name if course else "", "grade": g.letter,
            "score": f"{g.score_pct:.0f}%", "credits": g.credits,
        })
        total_credits += g.credits
        weighted += gpa_points.get(g.letter, 2.0) * g.credits

    gpa = round(weighted / total_credits, 2) if total_credits else 0.0
    return {"rows": rows, "overall_gpa": gpa, "total_courses": len(rows), "total_credits": total_credits}


# ---------- Attendance ----------
@router.get("/attendance")
def get_attendance(db: Session = Depends(get_db), user: models.User = Depends(require_role("student"))):
    records = db.query(models.AttendanceRecord).filter(models.AttendanceRecord.student_id == user.id).all()
    present = sum(1 for r in records if r.status == "Present")
    total = len(records) or 1
    rows = []
    for r in records:
        course = db.query(models.Course).filter(models.Course.id == r.course_id).first()
        rows.append({"date": r.date.strftime("%b %d, %Y"), "course": course.name if course else "", "status": r.status})
    return {"rows": rows, "percentage": round((present / total) * 100), "attended": present, "total": total}


class MarkAttendanceRequest(BaseModel):
    course_id: str
    marks: dict  # { student_id: "Present" | "Absent" }


@router.post("/attendance/mark")
def mark_attendance(
    payload: MarkAttendanceRequest,
    db: Session = Depends(get_db), user: models.User = Depends(require_role("teacher")),
):
    for student_id, status in payload.marks.items():
        db.add(models.AttendanceRecord(student_id=student_id, course_id=payload.course_id, status=status))
    db.commit()
    return {"saved": True}


# ---------- Students (teacher view) ----------
@router.get("/students")
def list_students(db: Session = Depends(get_db), user: models.User = Depends(require_role("teacher"))):
    students = db.query(models.User).filter(models.User.role == "student").all()
    result = []
    for s in students:
        grades = db.query(models.Grade).filter(models.Grade.student_id == s.id).all()
        latest_grade = grades[-1].letter if grades else "-"
        records = db.query(models.AttendanceRecord).filter(models.AttendanceRecord.student_id == s.id).all()
        present = sum(1 for r in records if r.status == "Present")
        pct = round((present / len(records)) * 100) if records else 0
        result.append({"name": s.name, "attendance": f"{pct}%", "grade": latest_grade})
    return result
    result.append({"id": s.id, "name": s.name, "attendance": f"{pct}%", "grade": latest_grade})


# ---------- Question bank ----------
class QuestionBankCreate(BaseModel):
    course_name: str
    text: str
    difficulty: str = "Medium"


# list_question_bank — was: return db.query(models.QuestionBankItem).all()
@router.get("/question-bank")
def list_question_bank(db: Session = Depends(get_db)):
    items = db.query(models.QuestionBankItem).all()
    return [{"id": i.id, "course_name": i.course_name, "text": i.text, "difficulty": i.difficulty} for i in items]


@router.post("/question-bank")
def add_question_bank_item(
    payload: QuestionBankCreate, db: Session = Depends(get_db), user: models.User = Depends(require_role("teacher")),
):
    item = models.QuestionBankItem(**payload.dict())
    # add_question_bank_item — was: return item
    db.add(item)
    db.commit()
    db.refresh(item)
    return {"id": item.id, "course_name": item.course_name, "text": item.text, "difficulty": item.difficulty}


# ---------- Analytics (teacher) ----------
@router.get("/analytics")
def get_analytics(db: Session = Depends(get_db), user: models.User = Depends(require_role("teacher"))):
    grades = db.query(models.Grade).all()
    avg_score = round(sum(g.score_pct for g in grades) / len(grades), 1) if grades else 0
    at_risk = sum(1 for g in grades if g.score_pct < 60)
    course_count = db.query(models.Course).filter(models.Course.instructor_id == user.id).count()
    return {"avg_class_score": f"{avg_score}%", "at_risk_students": at_risk, "active_courses": course_count}


@router.get("/quizzes")
def list_quizzes(db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    if user.role == "teacher":
        course_ids = [c.id for c in db.query(models.Course).filter(models.Course.instructor_id == user.id)]
    else:
        course_ids = [e.course_id for e in db.query(models.Enrollment).filter(models.Enrollment.student_id == user.id)]

    quizzes = db.query(models.Quiz).filter(models.Quiz.course_id.in_(course_ids)).all()
    result = []
    for q in quizzes:
        course = db.query(models.Course).filter(models.Course.id == q.course_id).first()
        question_count = db.query(models.QuizQuestion).filter(models.QuizQuestion.quiz_id == q.id).count()
        avg_score = None
        if user.role == "teacher":
            attempts = db.query(models.QuizAttempt).filter(models.QuizAttempt.quiz_id == q.id).all()
            if attempts:
                avg_score = round(sum(a.score or 0 for a in attempts) / len(attempts), 1)
        result.append({
            "id": q.id, "title": q.title, "course": course.name if course else "",
            "duration_minutes": q.duration_minutes, "questions": question_count,
            "avg_score": f"{avg_score}%" if avg_score is not None else None,
        })
    return result


@router.get("/exams")
def list_exams(db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    if user.role == "teacher":
        course_ids = [c.id for c in db.query(models.Course).filter(models.Course.instructor_id == user.id)]
    else:
        course_ids = [e.course_id for e in db.query(models.Enrollment).filter(models.Enrollment.student_id == user.id)]

    exams = db.query(models.Exam).filter(models.Exam.course_id.in_(course_ids)).all()
    result = []
    for e in exams:
        course = db.query(models.Course).filter(models.Course.id == e.course_id).first()
        result.append({"id": e.id, "title": e.title, "course": course.name if course else "", "duration_minutes": e.duration_minutes})
    return result


@router.get("/dashboard/student")
def student_dashboard(db: Session = Depends(get_db), user: models.User = Depends(require_role("student"))):
    course_ids = [e.course_id for e in db.query(models.Enrollment).filter(models.Enrollment.student_id == user.id)]

    assignments = db.query(models.Assignment).filter(models.Assignment.course_id.in_(course_ids)).all()
    pending_assignments = []
    for a in assignments:
        sub = db.query(models.Submission).filter(
            models.Submission.assignment_id == a.id, models.Submission.student_id == user.id
        ).first()
        if not sub or sub.status != "Submitted":
            pending_assignments.append(a)

    quizzes = db.query(models.Quiz).filter(models.Quiz.course_id.in_(course_ids)).all()
    exams = db.query(models.Exam).filter(models.Exam.course_id.in_(course_ids)).all()

    upcoming = []
    for a in pending_assignments[:3]:
        upcoming.append({
            "id": a.id, "title": a.title, "type": "Assignment",
            "due": a.due_date.strftime("%b %d") if a.due_date else "",
        })
    for q in quizzes[:2]:
        upcoming.append({"id": q.id, "title": q.title, "type": "Quiz", "due": "Upcoming"})
    for e in exams[:2]:
        upcoming.append({"id": e.id, "title": e.title, "type": "Exam", "due": "Upcoming"})

    grades = db.query(models.Grade).filter(models.Grade.student_id == user.id).all()
    gpa_points = {"A": 4.0, "A-": 3.7, "B+": 3.3, "B": 3.0, "B-": 2.7, "C+": 2.3, "C": 2.0}
    total_credits = sum(g.credits for g in grades) or 1
    weighted = sum(gpa_points.get(g.letter, 2.0) * g.credits for g in grades)
    gpa = round(weighted / total_credits, 2) if grades else 0.0
    letter = "A" if gpa >= 3.7 else "B+" if gpa >= 3.3 else "B" if gpa >= 3.0 else "C+"

    records = db.query(models.AttendanceRecord).filter(models.AttendanceRecord.student_id == user.id).all()
    present = sum(1 for r in records if r.status == "Present")
    attendance_pct = round((present / len(records)) * 100) if records else 0

    notifications = (
        db.query(models.Notification)
        .filter(models.Notification.user_id == user.id)
        .order_by(models.Notification.created_at.desc())
        .limit(3)
        .all()
    )

    return {
        "name": user.name,
        "assignments_due": len(pending_assignments),
        "quizzes_today": len(quizzes),
        "exams_upcoming": len(exams),
        "unread_messages": 0,
        "upcoming": upcoming,
        "gpa": gpa,
        "gpa_letter": letter,
        "attendance_pct": attendance_pct,
        "recent_activities": [n.text for n in notifications],
    }


@router.get("/dashboard/teacher")
def teacher_dashboard(db: Session = Depends(get_db), user: models.User = Depends(require_role("teacher"))):
    courses = db.query(models.Course).filter(models.Course.instructor_id == user.id).all()
    course_ids = [c.id for c in courses]

    student_count = db.query(models.Enrollment).filter(models.Enrollment.course_id.in_(course_ids)).count()

    assignments = db.query(models.Assignment).filter(models.Assignment.course_id.in_(course_ids)).all()
    pending_count = 0
    for a in assignments:
        subs = db.query(models.Submission).filter(models.Submission.assignment_id == a.id).all()
        pending_count += sum(1 for s in subs if s.status != "Submitted")

    grades = db.query(models.Grade).filter(models.Grade.course_id.in_(course_ids)).all()
    avg_score = round(sum(g.score_pct for g in grades) / len(grades), 1) if grades else 0

    exams_count = db.query(models.Exam).filter(models.Exam.course_id.in_(course_ids)).count()

    top_grades = (
        db.query(models.Grade)
        .filter(models.Grade.course_id.in_(course_ids))
        .order_by(models.Grade.score_pct.desc())
        .limit(3)
        .all()
    )
    top_students = []
    for g in top_grades:
        student = db.query(models.User).filter(models.User.id == g.student_id).first()
        top_students.append({"name": student.name if student else "", "score": f"{g.score_pct:.0f}%"})

    recent_submissions = (
        db.query(models.Submission)
        .filter(models.Submission.assignment_id.in_([a.id for a in assignments]))
        .order_by(models.Submission.submitted_at.desc())
        .limit(3)
        .all()
    )
    recent_activities = []
    for s in recent_submissions:
        student = db.query(models.User).filter(models.User.id == s.student_id).first()
        recent_activities.append(f"{student.name if student else 'A student'} submitted an assignment")

    return {
        "name": user.name,
        "student_count": student_count,
        "assignments_pending": pending_count,
        "avg_score": f"{avg_score}%",
        "upcoming_exams": exams_count,
        "top_students": top_students,
        "recent_activities": recent_activities,
    }