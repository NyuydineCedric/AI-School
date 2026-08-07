import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import TopHeader from "../components/TopHeader";
import StatCard from "../components/StatCard";
import { ClipboardList, HelpCircle, FileText, X } from "lucide-react";
import { getStudentDashboard } from "../lib/api";
import { getName } from "../lib/auth";

const iconFor: Record<string, any> = {
  Assignment: ClipboardList,
  Quiz: HelpCircle,
  Exam: FileText,
};
const tagColor: Record<string, string> = {
  Assignment: "bg-indigo-50 text-indigo-600",
  Quiz: "bg-amber-50 text-amber-600",
  Exam: "bg-rose-50 text-rose-600",
};

interface TeacherUpdate {
  id: string;
  type: string; // "Announcement" | "Assignment" | "Shared Note"
  title: string;
  detail: string;
  course: string;
  timestamp: string;
}

const StudentDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  // The update currently open in the "view document" modal, or null when closed.
  const [openUpdate, setOpenUpdate] = useState<TeacherUpdate | null>(null);

  useEffect(() => {
    getStudentDashboard()
      .then(setData)
      .catch(() => setData(null));
  }, []);

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar role="student" active="dashboard" />
      <main className="flex-1 overflow-y-auto p-6">
        <TopHeader
          greeting={`Welcome back, ${getName() ?? "there"}!`}
          subtitle="Here's what's happening today."
          avatarInitial={(getName() ?? "S").charAt(0)}
        />

        <div className="grid grid-cols-4 gap-4 mb-6">
          <StatCard
            label="Assignments Due"
            value={data?.assignments_due ?? 0}
          />
          <StatCard
            label="Quizzes"
            value={data?.quizzes_today ?? 0}
            accent="text-amber-600"
          />
          <StatCard
            label="Exams Upcoming"
            value={data?.exams_upcoming ?? 0}
            accent="text-rose-600"
          />
          <StatCard
            label="Unread Messages"
            value={data?.unread_messages ?? 0}
            accent="text-indigo-600"
          />
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="col-span-2 bg-white border border-slate-200 rounded-xl p-5">
            <h3 className="font-semibold text-slate-800 text-sm mb-4">
              Upcoming
            </h3>
            <div className="space-y-3">
              {(data?.upcoming ?? []).map((u: any) => {
                const Icon = iconFor[u.type] ?? ClipboardList;
                return (
                  <div key={u.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center">
                        <Icon size={16} className="text-slate-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800">
                          {u.title}
                        </p>
                        <p className="text-xs text-slate-400">{u.due}</p>
                      </div>
                    </div>
                    <span
                      className={`text-[11px] font-medium px-2 py-1 rounded-md ${tagColor[u.type]}`}
                    >
                      {u.type}
                    </span>
                  </div>
                );
              })}
              {(!data || data.upcoming.length === 0) && (
                <p className="text-sm text-slate-400">Nothing upcoming.</p>
              )}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col items-center">
            <h3 className="font-semibold text-slate-800 text-sm self-start mb-4">
              Overall Performance
            </h3>
            <p className="text-2xl font-bold text-slate-800">
              {data?.gpa_letter ?? "-"}
            </p>
            <p className="text-sm font-semibold text-slate-700 mt-1">
              {data?.gpa ?? 0} GPA
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2 bg-white border border-slate-200 rounded-xl p-5">
            <h3 className="font-semibold text-slate-800 text-sm mb-4">
              Recent Activities
            </h3>
            <div className="space-y-3">
              {(data?.recent_activities ?? []).map((a: string, i: number) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  <p className="text-sm text-slate-600">{a}</p>
                </div>
              ))}
              {(data?.teacher_updates ?? []).map((update: TeacherUpdate) => (
                <div key={update.id} className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2" />
                  <div className="min-w-0">
                    {/* Clicking the title opens the full note/announcement
                        in a modal, instead of dumping the raw content
                        inline into the dashboard row. */}
                    <button
                      onClick={() => setOpenUpdate(update)}
                      className="text-sm text-slate-700 font-medium hover:text-indigo-600 hover:underline text-left"
                    >
                      {update.title}
                    </button>
                    <p className="text-xs text-slate-500">
                      {update.type}
                      {update.course ? ` • ${update.course}` : ""}
                    </p>
                  </div>
                </div>
              ))}
              {(!data ||
                (data.recent_activities.length === 0 &&
                  (data.teacher_updates ?? []).length === 0)) && (
                <p className="text-sm text-slate-400">No recent activity.</p>
              )}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col items-center justify-center">
            <h3 className="font-semibold text-slate-800 text-sm self-start mb-4">
              Attendance
            </h3>
            <p className="text-3xl font-bold text-emerald-600">
              {data?.attendance_pct ?? 0}%
            </p>
            <p className="text-xs text-slate-400 mt-1">This Month</p>
          </div>
        </div>
      </main>

      {/* Modal shown when a recent-activity item is clicked. Shows the
          full detail (e.g. the full shared-note content, or announcement
          body) that used to be dumped inline into the dashboard row. */}
      {openUpdate && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={() => setOpenUpdate(null)}
        >
          <div
            className="bg-white rounded-xl max-w-lg w-full max-h-[80vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-[11px] font-medium text-indigo-600 mb-1">
                  {openUpdate.type}
                  {openUpdate.course ? ` • ${openUpdate.course}` : ""}
                </p>
                <h3 className="text-base font-semibold text-slate-800">
                  {openUpdate.title}
                </h3>
              </div>
              <button
                onClick={() => setOpenUpdate(null)}
                className="text-slate-400 hover:text-slate-600 shrink-0"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
            <p className="text-sm text-slate-600 whitespace-pre-wrap">
              {openUpdate.detail}
            </p>
            {openUpdate.timestamp && (
              <p className="text-xs text-slate-400 mt-4">
                {openUpdate.timestamp}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
