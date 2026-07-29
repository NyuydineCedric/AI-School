import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import { Role } from "../types";

const SettingsPage: React.FC<{ role: Role }> = ({ role }) => {
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar role={role} active="settings" />
      <main className="flex-1 overflow-y-auto p-6">
        <h1 className="text-xl font-semibold text-slate-800 mb-5">Settings</h1>

        <div className="bg-white border border-slate-200 rounded-xl p-6 max-w-lg mb-4">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">
            Notifications
          </h3>
          {[
            {
              label: "Email notifications",
              value: emailNotifs,
              set: setEmailNotifs,
            },
            {
              label: "Push notifications",
              value: pushNotifs,
              set: setPushNotifs,
            },
          ].map((row) => (
            <label
              key={row.label}
              className="flex items-center justify-between py-2 text-sm text-slate-600"
            >
              {row.label}
              <input
                type="checkbox"
                checked={row.value}
                onChange={(e) => row.set(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600"
              />
            </label>
          ))}
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 max-w-lg mb-4">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">
            Appearance
          </h3>
          <label className="flex items-center justify-between py-2 text-sm text-slate-600">
            Dark mode
            <input
              type="checkbox"
              checked={darkMode}
              onChange={(e) => setDarkMode(e.target.checked)}
              className="rounded border-slate-300 text-indigo-600"
            />
          </label>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 max-w-lg">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">
            Change Password
          </h3>
          <input
            type="password"
            placeholder="Current password"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm mb-3 outline-none"
          />
          <input
            type="password"
            placeholder="New password"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm mb-4 outline-none"
          />
          <button className="bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg">
            Update Password
          </button>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;
