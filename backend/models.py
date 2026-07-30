import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime, ForeignKey, Text
from database import Base


def gen_id():
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, default=gen_id)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    role = Column(String, nullable=False)  # student | teacher | admin


class Course(Base):
    __tablename__ = "courses"
    id = Column(String, primary_key=True, default=gen_id)
    name = Column(String, nullable=False)
    instructor_id = Column(String, ForeignKey("users.id"))
    color = Column(String, default="bg-indigo-100")


class Enrollment(Base):
    __tablename__ = "enrollments"
    id = Column(String, primary_key=True, default=gen_id)
    student_id = Column(String, ForeignKey("users.id"))
    course_id = Column(String, ForeignKey("courses.id"))
    progress = Column(Integer, default=0)


class Assignment(Base):
    __tablename__ = "assignments"
    id = Column(String, primary_key=True, default=gen_id)
    course_id = Column(String, ForeignKey("courses.id"))
    title = Column(String)
    instructions = Column(Text)
    due_date = Column(DateTime)
    max_marks = Column(Integer, default=20)


class Submission(Base):
    __tablename__ = "submissions"
    id = Column(String, primary_key=True, default=gen_id)
    assignment_id = Column(String, ForeignKey("assignments.id"))
    student_id = Column(String, ForeignKey("users.id"))
    content = Column(Text)
    status = Column(String, default="Not Submitted")
    score = Column(String, default="-")
    feedback = Column(Text, nullable=True)
    submitted_at = Column(DateTime, nullable=True)


class Quiz(Base):
    __tablename__ = "quizzes"
    id = Column(String, primary_key=True, default=gen_id)
    course_id = Column(String, ForeignKey("courses.id"))
    title = Column(String)
    duration_minutes = Column(Integer, default=30)


class QuizQuestion(Base):
    __tablename__ = "quiz_questions"
    id = Column(String, primary_key=True, default=gen_id)
    quiz_id = Column(String, ForeignKey("quizzes.id"))
    text = Column(Text)
    option_a = Column(String)
    option_b = Column(String)
    option_c = Column(String)
    option_d = Column(String)
    correct_option = Column(String)  # "A" | "B" | "C" | "D"
    marks = Column(Integer, default=2)


class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"
    id = Column(String, primary_key=True, default=gen_id)
    quiz_id = Column(String, ForeignKey("quizzes.id"))
    student_id = Column(String, ForeignKey("users.id"))
    answers_json = Column(Text, default="{}")  # {question_id: "A"}
    score = Column(Float, nullable=True)
    submitted = Column(Boolean, default=False)


class Exam(Base):
    __tablename__ = "exams"
    id = Column(String, primary_key=True, default=gen_id)
    course_id = Column(String, ForeignKey("courses.id"))
    title = Column(String)
    instructions = Column(Text)
    duration_minutes = Column(Integer, default=120)


class ExamAnswer(Base):
    __tablename__ = "exam_answers"
    id = Column(String, primary_key=True, default=gen_id)
    exam_id = Column(String, ForeignKey("exams.id"))
    student_id = Column(String, ForeignKey("users.id"))
    answer_text = Column(Text)


class Grade(Base):
    __tablename__ = "grades"
    id = Column(String, primary_key=True, default=gen_id)
    student_id = Column(String, ForeignKey("users.id"))
    course_id = Column(String, ForeignKey("courses.id"))
    letter = Column(String)
    score_pct = Column(Float)
    credits = Column(Integer, default=3)


class AttendanceRecord(Base):
    __tablename__ = "attendance"
    id = Column(String, primary_key=True, default=gen_id)
    student_id = Column(String, ForeignKey("users.id"))
    course_id = Column(String, ForeignKey("courses.id"))
    date = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default="Present")  # Present | Absent


class Note(Base):
    __tablename__ = "notes"
    id = Column(String, primary_key=True, default=gen_id)
    student_id = Column(String, ForeignKey("users.id"))
    course_name = Column(String)
    content = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)


class Conversation(Base):
    __tablename__ = "conversations"
    id = Column(String, primary_key=True, default=gen_id)
    name = Column(String)


class ConversationParticipant(Base):
    __tablename__ = "conversation_participants"
    id = Column(String, primary_key=True, default=gen_id)
    conversation_id = Column(String, ForeignKey("conversations.id"))
    user_id = Column(String, ForeignKey("users.id"))


class Message(Base):
    __tablename__ = "messages"
    id = Column(String, primary_key=True, default=gen_id)
    conversation_id = Column(String, ForeignKey("conversations.id"))
    sender_id = Column(String, ForeignKey("users.id"))
    text = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)


class Notification(Base):
    __tablename__ = "notifications"
    id = Column(String, primary_key=True, default=gen_id)
    user_id = Column(String, ForeignKey("users.id"))
    text = Column(String)
    read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class Announcement(Base):
    __tablename__ = "announcements"
    id = Column(String, primary_key=True, default=gen_id)
    author_id = Column(String, ForeignKey("users.id"))
    title = Column(String)
    body = Column(Text)
    course_name = Column(String, default="All Courses")
    created_at = Column(DateTime, default=datetime.utcnow)


class QuestionBankItem(Base):
    __tablename__ = "question_bank"
    id = Column(String, primary_key=True, default=gen_id)
    course_name = Column(String)
    text = Column(Text)
    difficulty = Column(String, default="Medium")