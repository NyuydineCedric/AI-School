import React from 'react';
import Sidebar from '../components/Sidebar';
import { ChevronLeft, Bot, FileText, ListChecks, MessageCircle, Users } from 'lucide-react';

const AssignmentDetails: React.FC = () => {
  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar role="student" active="assignments" />
      <main className="flex-1 overflow-y-auto p-6">
        <a href="#" className="flex items-center gap-1 text-sm text-slate-500 mb-4">
          <ChevronLeft size={14} /> Back to Assignments
        </a>

        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2 bg-white border border-slate-200 rounded-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-800">Data Structures Assignment</h2>
              <span className="text-[11px] font-medium bg-indigo-50 text-indigo-600 px-2 py-1 rounded-md">
                Assignment
              </span>
            </div>

            <div className="grid grid-cols-4 gap-4 text-xs mb-6">
              <div>
                <p className="text-slate-400">Course</p>
                <p className="font-medium text-slate-700 mt-0.5">Data Structures</p>
              </div>
              <div>
                <p className="text-slate-400">Dr. Sarter</p>
                <p className="font-medium text-slate-700 mt-0.5">Due Date</p>
              </div>
              <div>
                <p className="text-slate-400">Due Date</p>
                <p className="font-medium text-slate-700 mt-0.5">24 May 2024, 11:59 PM</p>
              </div>
              <div>
                <p className="text-slate-400">Marks</p>
                <p className="font-medium text-slate-700 mt-0.5">20</p>
              </div>
            </div>

            <h3 className="text-sm font-semibold text-slate-700 mb-2">Instructions</h3>
            <p className="text-sm text-slate-500 mb-6">
              Implement all functions in Python. Make sure to handle edge cases. Write clean and
              well-documented code.
            </p>

            <h3 className="text-sm font-semibold text-slate-700 mb-2">Attachments</h3>
            <div className="flex items-center gap-2 text-sm text-rose-600 mb-6">
              <FileText size={15} /> Problem Statement.pdf
            </div>

            <h3 className="text-sm font-semibold text-slate-700 mb-2">Your Submission</h3>
            <div className="flex items-center justify-between">
              <span className="text-sm text-rose-500 font-medium">Not Submitted</span>
              <button className="bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg">
                Start Assignment
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-1">
                <Bot size={16} className="text-indigo-600" />
                <h3 className="text-sm font-semibold text-slate-800">Ask AI for Help</h3>
              </div>
              <p className="text-xs text-slate-400 mb-4">Need a hint or explanation?</p>
              <button className="w-full bg-indigo-600 text-white text-sm font-medium py-2 rounded-lg">
                Ask AI Tutor
              </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-slate-800 mb-3">Quick Actions</h3>
              <div className="space-y-3 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <ListChecks size={15} className="text-slate-400" /> View Rubric
                </div>
                <div className="flex items-center gap-2">
                  <MessageCircle size={15} className="text-slate-400" /> Discussion (3)
                </div>
                <div className="flex items-center gap-2">
                  <Users size={15} className="text-slate-400" /> Ask Teacher
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AssignmentDetails;
