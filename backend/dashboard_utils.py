from datetime import datetime


def build_teacher_updates(announcements, assignments):
    updates = []

    for announcement in announcements[:3]:
        updates.append(
            {
                "id": f"announcement-{announcement.id}",
                "type": "Announcement",
                "title": announcement.title,
                "detail": announcement.body,
                "course": announcement.course_name,
                "timestamp": announcement.created_at.strftime("%b %d") if getattr(announcement, "created_at", None) else "",
            }
        )

    for assignment in assignments[:3]:
        due_date = getattr(assignment, "due_date", None)
        updates.append(
            {
                "id": f"assignment-{assignment.id}",
                "type": "Assignment",
                "title": assignment.title,
                "detail": f"Due {due_date.strftime('%b %d') if due_date else 'soon'}",
                "course": "",
                "timestamp": due_date.strftime("%b %d") if due_date else "",
            }
        )

    def sort_key(item):
        return item["timestamp"] or ""

    updates.sort(key=sort_key, reverse=True)
    return updates


def build_student_updates(announcements, shared_notes):
    updates = []

    for announcement in announcements[:3]:
        updates.append(
            {
                "id": f"announcement-{announcement.id}",
                "type": "Announcement",
                "title": announcement.title,
                "detail": announcement.body,
                "course": announcement.course_name,
                "timestamp": announcement.created_at.strftime("%b %d") if getattr(announcement, "created_at", None) else "",
            }
        )

    for note in shared_notes[:3]:
        updates.append(
            {
                "id": f"shared-note-{note.id}",
                "type": "Shared Note",
                "title": f"Shared note for {note.course_name}",
                "detail": note.content,
                "course": note.course_name,
                "timestamp": note.created_at.strftime("%b %d") if getattr(note, "created_at", None) else "",
            }
        )

    def sort_key(item):
        return item["timestamp"] or ""

    updates.sort(key=sort_key, reverse=True)
    return updates
