from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
import json


from database import get_db
import models
from auth import get_current_user, require_role
from dashboard_utils import build_student_updates, build_teacher_updates

router = APIRouter(tags=["academics"])


# ---------- Grade sync helpers ----------
# Assignment/exam scores are stored as free-text strings and can arrive as
# either "18/20" or a plain number ("85", "85%"). Quiz scores are already
# percentages. All three get normalized to a 0-100 pct before being written
# to the shared Grade table that /grades reads from.

def _assignment_score_pct(raw: Optional[str], max_marks: int) -> Optional[float]:
    text = (raw or "").strip()
    if not text or text == "-":
        return None
    if "/" in text:
        try:
            num_str, denom_str = text.split("/", 1)
            num, denom = float(num_str.strip()), float(denom_str.strip())
            return (num / denom) * 100 if denom else None
        except ValueError:
            return None
    try:
        value = float(text.rstrip("%"))
    except ValueError:
        return None
    return (value / max_marks) * 100 if max_marks else value


def _exam_score_pct(raw: Optional[str]) -> Optional[float]:
    # Exam has no max_marks column, so a bare number is treated as already
    # being a percentage (e.g. teacher enters "85" meaning 85%).
    text = (raw or "").strip()
    if not text or text == "-":
        return None
    if "/" in text:
        try:
            num_str, denom_str = text.split("/", 1)
            num, denom = float(num_str.strip()), float(denom_str.strip())
            return (num / denom) * 100 if denom else None
        except ValueError:
            return None
    try:
        return float(text.rstrip("%"))
    except ValueError:
        return None


def _letter_for_pct(pct: float) -> str:
    if pct >= 93:
        return "A"
    if pct >= 90:
        return "A-"
    if pct >= 87:
        return "B+"
    if pct >= 83:
        return "B"
    if pct >= 80:
        return "B-"
    if pct >= 77:
        return "C+"
    if pct >= 70:
        return "C"
    return "F"


def _upsert_grade(db: Session, student_id: str, course_id: str, score_pct: float, credits: int = 3):
    score_pct = max(0.0, min(100.0, score_pct))
    grade = db.query(models.Grade).filter(
        models.Grade.student_id == student_id,
        models.Grade.course_id == course_id,
    ).first()
    if grade:
        grade.score_pct = score_pct
        grade.letter = _letter_for_pct(score_pct)
    else:
        db.add(models.Grade(
            student_id=student_id,
            course_id=course_id,
            letter=_letter_for_pct(score_pct),
            score_pct=score_pct,
            credits=credits,
        ))


# ---------- Courses ----------
class CourseCreate(BaseModel):
    name: str
    color: str = "bg-indigo-100"


@router.post("/courses")
def create_course(payload: CourseCreate, db: Session = Depends(get_db), user: models.User = Depends(require_role("teacher"))):
    course = models.Course(name=payload.name, instructor_id=user.id, color=payload.color)
    db.add(course)
    db.commit()
    db.refresh(course)

    students = db.query(models.User).filter(models.User.role == "student").all()
    for student in students:
        existing = (
            db.query(models.Enrollment)
            .filter(models.Enrollment.student_id == student.id, models.Enrollment.course_id == course.id)
            .first()
        )
        if not existing:
            db.add(models.Enrollment(student_id=student.id, course_id=course.id, progress=0))
    db.commit()
    return {"id": course.id, "name": course.name, "color": course.color, "students": len(students), "avg": "0%"}


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
class AssignmentCreate(BaseModel):
    course_id: str
    title: str
    instructions: str
    due_date: Optional[datetime] = None
    max_marks: int = 20


@router.post("/assignments")
def create_assignment(payload: AssignmentCreate, db: Session = Depends(get_db), user: models.User = Depends(require_role("teacher"))):
    course = db.query(models.Course).filter(models.Course.id == payload.course_id).first()
    if not course or course.instructor_id != user.id:
        raise HTTPException(status_code=404, detail="Course not found")

    assignment = models.Assignment(
        course_id=payload.course_id,
        title=payload.title,
        instructions=payload.instructions,
        due_date=payload.due_date,
        max_marks=payload.max_marks,
    )
    db.add(assignment)
    db.commit()
    db.refresh(assignment)
    return {"id": assignment.id, "title": assignment.title, "due_date": assignment.due_date, "max_marks": assignment.max_marks}


class SubmitAssignmentRequest(BaseModel):
    content: str


@router.get("/assignments")
def list_assignments(db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    # list_assignments, teacher branch — was: return db.query(...).filter(...).all()
    if user.role == "teacher":
        course_ids = [c.id for c in db.query(models.Course).filter(models.Course.instructor_id == user.id)]
        assignments = db.query(models.Assignment).filter(models.Assignment.course_id.in_(course_ids)).all()
        result = []
        for a in assignments:
            course = db.query(models.Course).filter(models.Course.id == a.course_id).first()
            result.append({
                "id": a.id, "title": a.title, "due_date": a.due_date, "max_marks": a.max_marks,
                "course_id": a.course_id, "course_name": course.name if course else "",
            })
        return result

    course_ids = [e.course_id for e in db.query(models.Enrollment).filter(models.Enrollment.student_id == user.id)]
    assignments = db.query(models.Assignment).filter(models.Assignment.course_id.in_(course_ids)).all()

    result = []
    for a in assignments:
        sub = db.query(models.Submission).filter(
            models.Submission.assignment_id == a.id, models.Submission.student_id == user.id
        ).first()
        course = db.query(models.Course).filter(models.Course.id == a.course_id).first()
        result.append({
            "id": a.id, "title": a.title, "instructions": a.instructions,
            "due_date": a.due_date, "max_marks": a.max_marks,
            "course_id": a.course_id, "course_name": course.name if course else "",
            # Nested to match get_assignment()'s shape so the frontend can
            # read assignment.submission?.status consistently everywhere.
            "submission": {"status": sub.status, "content": sub.content} if sub else None,
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
    course = db.query(models.Course).filter(models.Course.id == a.course_id).first()
    return {
        "id": a.id, "title": a.title, "instructions": a.instructions,
        "due_date": a.due_date, "max_marks": a.max_marks,
        "course_id": a.course_id, "course_name": course.name if course else "",
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


class AssignmentMarkRequest(BaseModel):
    score: str
    feedback: Optional[str] = None


@router.get("/assignments/{assignment_id}/submissions")
def list_assignment_submissions(
    assignment_id: str,
    db: Session = Depends(get_db),
    user: models.User = Depends(require_role("teacher")),
):
    assignment = db.query(models.Assignment).filter(models.Assignment.id == assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")

    course = db.query(models.Course).filter(models.Course.id == assignment.course_id).first()
    if not course or course.instructor_id != user.id:
        raise HTTPException(status_code=404, detail="Assignment not found")

    submissions = db.query(models.Submission).filter(models.Submission.assignment_id == assignment_id).all()
    result = []
    for sub in submissions:
        student = db.query(models.User).filter(models.User.id == sub.student_id).first()
        result.append({
            "id": sub.id,
            "student_name": student.name if student else "Student",
            "student_id": sub.student_id,
            "content": sub.content,
            "status": sub.status,
            "score": sub.score,
            "feedback": sub.feedback,
        })
    return result


@router.post("/assignments/{assignment_id}/submissions/{submission_id}/mark")
def mark_assignment_submission(
    assignment_id: str,
    submission_id: str,
    payload: AssignmentMarkRequest,
    db: Session = Depends(get_db),
    user: models.User = Depends(require_role("teacher")),
):
    assignment = db.query(models.Assignment).filter(models.Assignment.id == assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")

    course = db.query(models.Course).filter(models.Course.id == assignment.course_id).first()
    if not course or course.instructor_id != user.id:
        raise HTTPException(status_code=404, detail="Assignment not found")

    submission = db.query(models.Submission).filter(models.Submission.id == submission_id).first()
    if not submission or submission.assignment_id != assignment_id:
        raise HTTPException(status_code=404, detail="Submission not found")

    submission.score = payload.score
    submission.feedback = payload.feedback

    pct = _assignment_score_pct(payload.score, assignment.max_marks)
    if pct is not None:
        _upsert_grade(db, submission.student_id, assignment.course_id, pct)

    db.commit()
    return {"saved": True}


# ---------- Quizzes ----------
class QuizQuestionCreate(BaseModel):
    text: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    correct_option: str
    marks: int = 2


class QuizCreate(BaseModel):
    course_id: str
    title: str
    duration_minutes: int = 30
    questions: List[QuizQuestionCreate] = []


@router.post("/quizzes")
def create_quiz(payload: QuizCreate, db: Session = Depends(get_db), user: models.User = Depends(require_role("teacher"))):
    course = db.query(models.Course).filter(models.Course.id == payload.course_id).first()
    if not course or course.instructor_id != user.id:
        raise HTTPException(status_code=404, detail="Course not found")

    quiz = models.Quiz(course_id=payload.course_id, title=payload.title, duration_minutes=payload.duration_minutes)
    db.add(quiz)
    db.commit()
    db.refresh(quiz)

    for question in payload.questions:
        db.add(models.QuizQuestion(
            quiz_id=quiz.id,
            text=question.text,
            option_a=question.option_a,
            option_b=question.option_b,
            option_c=question.option_c,
            option_d=question.option_d,
            correct_option=question.correct_option,
            marks=question.marks,
        ))
    db.commit()
    return {"id": quiz.id, "title": quiz.title, "duration_minutes": quiz.duration_minutes, "questions": payload.questions}


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


@router.get("/quizzes/{quiz_id}/attempts")
def list_quiz_attempts(
    quiz_id: str,
    db: Session = Depends(get_db),
    user: models.User = Depends(require_role("teacher")),
):
    quiz = db.query(models.Quiz).filter(models.Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    course = db.query(models.Course).filter(models.Course.id == quiz.course_id).first()
    if not course or course.instructor_id != user.id:
        raise HTTPException(status_code=404, detail="Quiz not found")

    attempts = db.query(models.QuizAttempt).filter(models.QuizAttempt.quiz_id == quiz_id).all()
    result = []
    for attempt in attempts:
        student = db.query(models.User).filter(models.User.id == attempt.student_id).first()
        result.append({
            "id": attempt.id,
            "student_name": student.name if student else "Student",
            "score": attempt.score,
            "answers_json": attempt.answers_json,
            "submitted": attempt.submitted,
        })
    return result


class QuizScoreUpdateRequest(BaseModel):
    score: float


@router.post("/quizzes/{quiz_id}/attempts/{attempt_id}/score")
def update_quiz_attempt_score(
    quiz_id: str,
    attempt_id: str,
    payload: QuizScoreUpdateRequest,
    db: Session = Depends(get_db),
    user: models.User = Depends(require_role("teacher")),
):
    quiz = db.query(models.Quiz).filter(models.Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    course = db.query(models.Course).filter(models.Course.id == quiz.course_id).first()
    if not course or course.instructor_id != user.id:
        raise HTTPException(status_code=404, detail="Quiz not found")

    attempt = db.query(models.QuizAttempt).filter(models.QuizAttempt.id == attempt_id).first()
    if not attempt or attempt.quiz_id != quiz_id:
        raise HTTPException(status_code=404, detail="Attempt not found")

    attempt.score = payload.score
    _upsert_grade(db, attempt.student_id, quiz.course_id, payload.score)
    db.commit()
    return {"saved": True}


# ---------- Exams ----------
class ExamCreate(BaseModel):
    course_id: str
    title: str
    instructions: str
    duration_minutes: int = 120


@router.post("/exams")
def create_exam(payload: ExamCreate, db: Session = Depends(get_db), user: models.User = Depends(require_role("teacher"))):
    course = db.query(models.Course).filter(models.Course.id == payload.course_id).first()
    if not course or course.instructor_id != user.id:
        raise HTTPException(status_code=404, detail="Course not found")

    exam = models.Exam(
        course_id=payload.course_id,
        title=payload.title,
        instructions=payload.instructions,
        duration_minutes=payload.duration_minutes,
    )
    db.add(exam)
    db.commit()
    db.refresh(exam)
    return {"id": exam.id, "title": exam.title, "instructions": exam.instructions, "duration_minutes": exam.duration_minutes}


@router.get("/exams/{exam_id}")
def get_exam(exam_id: str, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    exam = db.query(models.Exam).filter(models.Exam.id == exam_id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")

    result = {
        "id": exam.id,
        "title": exam.title,
        "instructions": exam.instructions,
        "duration_minutes": exam.duration_minutes,
    }

    if user.role == "student":
        answer = db.query(models.ExamAnswer).filter(
            models.ExamAnswer.exam_id == exam_id,
            models.ExamAnswer.student_id == user.id,
        ).first()
        result["submitted"] = bool(answer and answer.submitted)
        result["submitted_at"] = answer.submitted_at if answer else None

    return result

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
    if answer and answer.submitted:
        raise HTTPException(status_code=403, detail="This exam has already been submitted.")
    if not answer:
        answer = models.ExamAnswer(exam_id=exam_id, student_id=user.id)
        db.add(answer)
    answer.answer_text = payload.answer_text
    db.commit()
    return {"saved": True}


@router.post("/exams/{exam_id}/submit")
def submit_exam(
    exam_id: str, payload: ExamAnswerRequest,
    db: Session = Depends(get_db), user: models.User = Depends(require_role("student")),
):
    answer = db.query(models.ExamAnswer).filter(
        models.ExamAnswer.exam_id == exam_id, models.ExamAnswer.student_id == user.id
    ).first()

    if answer and answer.submitted:
        # Idempotent: multiple triggers (tab close AND route-away, etc.)
        # may fire in quick succession. The first one wins; later ones are
        # harmless no-ops instead of errors.
        return {"submitted": True, "already_submitted": True}

    if not answer:
        answer = models.ExamAnswer(exam_id=exam_id, student_id=user.id)
        db.add(answer)
    answer.answer_text = payload.answer_text
    answer.submitted = True
    answer.submitted_at = datetime.utcnow()
    db.commit()
    return {"submitted": True, "already_submitted": False}


@router.get("/exams/{exam_id}/answers")
def list_exam_answers(
    exam_id: str,
    db: Session = Depends(get_db),
    user: models.User = Depends(require_role("teacher")),
):
    exam = db.query(models.Exam).filter(models.Exam.id == exam_id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")

    course = db.query(models.Course).filter(models.Course.id == exam.course_id).first()
    if not course or course.instructor_id != user.id:
        raise HTTPException(status_code=404, detail="Exam not found")

    answers = db.query(models.ExamAnswer).filter(models.ExamAnswer.exam_id == exam_id).all()
    result = []
    for answer in answers:
        student = db.query(models.User).filter(models.User.id == answer.student_id).first()
        result.append({
            "id": answer.id,
            "student_name": student.name if student else "Student",
            "answer_text": answer.answer_text,
            "score": answer.score,
            "feedback": answer.feedback,
        })
    return result


class ExamAnswerMarkRequest(BaseModel):
    score: str
    feedback: Optional[str] = None


@router.post("/exams/{exam_id}/answers/{answer_id}/mark")
def mark_exam_answer(
    exam_id: str,
    answer_id: str,
    payload: ExamAnswerMarkRequest,
    db: Session = Depends(get_db),
    user: models.User = Depends(require_role("teacher")),
):
    exam = db.query(models.Exam).filter(models.Exam.id == exam_id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")

    course = db.query(models.Course).filter(models.Course.id == exam.course_id).first()
    if not course or course.instructor_id != user.id:
        raise HTTPException(status_code=404, detail="Exam not found")

    answer = db.query(models.ExamAnswer).filter(models.ExamAnswer.id == answer_id).first()
    if not answer or answer.exam_id != exam_id:
        raise HTTPException(status_code=404, detail="Answer not found")

    answer.score = payload.score
    answer.feedback = payload.feedback

    pct = _exam_score_pct(payload.score)
    if pct is not None:
        _upsert_grade(db, answer.student_id, exam.course_id, pct)

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
        result.append({"id": s.id, "name": s.name, "attendance": f"{pct}%", "grade": latest_grade})
    return result


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
    announcements = (
        db.query(models.Announcement)
        .order_by(models.Announcement.created_at.desc())
        .limit(5)
        .all()
    )
    shared_notes = (
        db.query(models.SharedNote)
        .order_by(models.SharedNote.created_at.desc())
        .limit(5)
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
        "teacher_updates": build_student_updates(announcements, shared_notes),
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