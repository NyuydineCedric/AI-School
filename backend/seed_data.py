from datetime import datetime, timedelta
from sqlalchemy.orm import Session
import models
from auth import hash_password


def seed_if_empty(db: Session):
    if db.query(models.User).count() > 0:
        return  # already seeded

    teacher = models.User(name="Dr. Smith", email="dr.smith@smartschool.ai",
                           hashed_password=hash_password("teacher123"), role="teacher")
    student = models.User(name="Cedric Nyuydine", email="cedric@smartschool.ai",
                           hashed_password=hash_password("student123"), role="student")
    db.add_all([teacher, student])
    db.commit()

    ds = models.Course(name="Data Structures", instructor_id=teacher.id, color="bg-indigo-100")
    os_course = models.Course(name="Operating Systems", instructor_id=teacher.id, color="bg-emerald-100")
    dbs = models.Course(name="Database Systems", instructor_id=teacher.id, color="bg-rose-100")
    db.add_all([ds, os_course, dbs])
    db.commit()

    db.add_all([
        models.Enrollment(student_id=student.id, course_id=ds.id, progress=75),
        models.Enrollment(student_id=student.id, course_id=os_course.id, progress=60),
        models.Enrollment(student_id=student.id, course_id=dbs.id, progress=60),
    ])

    assignment = models.Assignment(
        course_id=ds.id, title="Data Structures Assignment",
        instructions="Implement all functions in Python. Handle edge cases.",
        due_date=datetime.utcnow() + timedelta(days=2), max_marks=20,
    )
    db.add(assignment)
    db.commit()

    quiz = models.Quiz(course_id=os_course.id, title="Operating Systems Quiz", duration_minutes=30)
    db.add(quiz)
    db.commit()
    db.add(models.QuizQuestion(
        quiz_id=quiz.id, text="Which of the following is NOT a CPU scheduling algorithm?",
        option_a="FCFS", option_b="Round Robin", option_c="Priority Scheduling", option_d="Binary Search",
        correct_option="D", marks=2,
    ))

    exam = models.Exam(
        course_id=dbs.id, title="Database Systems Midterm Exam",
        instructions="Closed book. No tab switching. Auto-submits at time limit.",
        duration_minutes=120,
    )
    db.add(exam)

    db.add_all([
        models.Grade(student_id=student.id, course_id=ds.id, letter="A", score_pct=88, credits=3),
        models.Grade(student_id=student.id, course_id=os_course.id, letter="B+", score_pct=78, credits=3),
        models.Grade(student_id=student.id, course_id=dbs.id, letter="A-", score_pct=85, credits=3),
    ])

    for i in range(5):
        db.add(models.AttendanceRecord(
            student_id=student.id, course_id=ds.id,
            date=datetime.utcnow() - timedelta(days=i),
            status="Present" if i != 2 else "Absent",
        ))

    convo = models.Conversation(name="Dr. Smith")
    db.add(convo)
    db.commit()
    db.add_all([
        models.ConversationParticipant(conversation_id=convo.id, user_id=teacher.id),
        models.ConversationParticipant(conversation_id=convo.id, user_id=student.id),
    ])
    db.add(models.Message(conversation_id=convo.id, sender_id=teacher.id, text="Please resubmit question 3."))

    db.add(models.Notification(user_id=student.id, text="Dr. Smith uploaded Database Assignment"))
    db.add(models.Announcement(author_id=teacher.id, title="Midterm Rescheduled",
                                body="The midterm has moved to next Monday.", course_name="Database Systems"))
    db.add(models.QuestionBankItem(course_name="Database Systems",
                                    text="Which normal form eliminates partial dependency?", difficulty="Medium"))

    db.commit()