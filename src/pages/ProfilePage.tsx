import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { AlertCircle } from "lucide-react";
import { Role } from "../types";
import { getMe, updateProfile } from "../lib/api";
import { updateStoredName } from "../lib/auth";

const ProfilePage: React.FC<{ role: Role }> = ({ role }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getMe()
      .then((profile) => {
        setName(profile.name);
        setEmail(profile.email);
        setBio(profile.bio ?? "");
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load profile."),
      )
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setError(null);
    setSaving(true);
    try {
      const updated = await updateProfile(name, email, bio);
      setName(updated.name);
      setEmail(updated.email);
      setBio(updated.bio ?? "");
      updateStoredName(updated.name);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar role={role} active="profile" />
      <main className="flex-1 overflow-y-auto p-6">
        <h1 className="text-xl font-semibold text-slate-800 mb-5">Profile</h1>

        {loading && <p className="text-sm text-slate-400">Loading profile…</p>}

        {!loading && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 max-w-lg">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xl font-semibold">
                {(name || "?").charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-slate-800">{name}</p>
                <span className="text-xs font-medium bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md capitalize">
                  {role}
                </span>
              </div>
            </div>

            <label className="block text-xs font-medium text-slate-600 mb-1.5">
              Full Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm mb-4 outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <label className="block text-xs font-medium text-slate-600 mb-1.5">
              Email
            </label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm mb-4 outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <label className="block text-xs font-medium text-slate-600 mb-1.5">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us a bit about yourself..."
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm mb-4 outline-none resize-none h-24"
            />

            {error && (
              <div className="flex items-center gap-2 text-sm text-rose-600 mb-4">
                <AlertCircle size={15} /> {error}
              </div>
            )}

            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50"
            >
              {saving ? "Saving…" : saved ? "Saved ✓" : "Save Changes"}
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default ProfilePage;
