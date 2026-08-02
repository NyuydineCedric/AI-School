import unittest
from datetime import datetime
from types import SimpleNamespace

from dashboard_utils import build_student_updates, build_teacher_updates


class DashboardUpdatesTests(unittest.TestCase):
    def test_build_teacher_updates_includes_announcements_and_assignments(self):
        announcements = [
            SimpleNamespace(
                id="ann-1",
                title="New lab update",
                body="Please review the lab instructions before class.",
                course_name="Data Structures",
                created_at=datetime(2026, 8, 2, 10, 0, 0),
            )
        ]
        assignments = [
            SimpleNamespace(
                id="asg-1",
                title="Homework 3",
                due_date=datetime(2026, 8, 5, 18, 0, 0),
            )
        ]

        updates = build_teacher_updates(announcements, assignments)

        self.assertEqual(len(updates), 2)
        self.assertEqual(updates[0]["type"], "Assignment")
        self.assertEqual(updates[0]["title"], "Homework 3")
        self.assertEqual(updates[1]["type"], "Announcement")
        self.assertEqual(updates[1]["title"], "New lab update")

    def test_build_student_updates_includes_shared_notes(self):
        announcements = [
            SimpleNamespace(
                id="ann-1",
                title="Reminder",
                body="Bring your laptops.",
                course_name="Data Structures",
                created_at=datetime(2026, 8, 2, 10, 0, 0),
            )
        ]
        shared_notes = [
            SimpleNamespace(
                id="note-1",
                course_name="Data Structures",
                content="Review chapter 4.",
                created_at=datetime(2026, 8, 3, 10, 0, 0),
            )
        ]

        updates = build_student_updates(announcements, shared_notes)

        self.assertEqual(len(updates), 2)
        self.assertEqual(updates[0]["type"], "Shared Note")
        self.assertEqual(updates[0]["title"], "Shared note for Data Structures")
        self.assertEqual(updates[1]["type"], "Announcement")


if __name__ == "__main__":
    unittest.main()
