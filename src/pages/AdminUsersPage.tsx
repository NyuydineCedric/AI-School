import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { AlertCircle, Plus, Trash2, KeyRound } from "lucide-react";
import {
  adminListUsers,
  adminCreateUser,
  adminResetPassword,
  adminDeleteUser,
  AdminUser,
} from "../lib/api";
import { getUserId } from "../lib/auth";

const roleBadge: Record<string, string> = {
  student: "bg-indigo-50 text-indigo-600",
  teacher: "bg-emerald-50 text-emerald-600",
  admin: "bg-amber-50 text-amber-600",
};

const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [creating, setCreating] = useState(false);

  const [resetTarget, setResetTarget] = useState<string | null>(null);
  const [resetValue, setResetValue] = useState("");
  const [resetting, setResetting] = useState(false);

  const currentUserId = getUserId();

  useEffect(() => {
    adminListUsers()
      .then(setUsers)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load users."),
      )
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    if (!name.trim() || !email.trim() || password.length < 8) {
      setError("Fill in name, email, and an 8+ character password.");
      return;
    }
    setCreating(true);
    setError(null);
    try {
      const user = await adminCreateUser(name.trim(), email.trim(), password, role);
      setUsers((prev) => [...prev, user]);
      setName("");
      setEmail("");
      setPassword("");
      setRole("student");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create user.");
    } finally {
      setCreating(false);
    }
  };

  const handleReset = async (userId: string) => {
    if (resetValue.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    setResetting(true);
    setError(null);
    try {
      await adminResetPassword(userId, resetValue);
      setResetTarget(null);
      setResetValue("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset password.");
    } finally {
      setResetting(false);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!window.confirm("Delete this account? This can't be undone.")) return;
    setError(null);
    try {
      await adminDeleteUser(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete user.");
    }
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar role="admin" active="admin" />
      <main className="flex-1 overflow-y-auto p-6">
        <h1 className="text-xl font-semibold text-slate-800 mb-1">
          User Management
        </h1>
        <p className="text-sm text-slate-500 mb-5">
          Create teacher and admin accounts, and reset passwords for anyone
          who's locked out.
        </p>

        <div className="bg-white border border-slate-200 rounded-xl p-5 mb-6">
          <h3 className="text-sm font-semibold text-slate-800 mb-3">
            Add a user
          </h3>
          <div className="grid grid-cols-4 gap-3 mb-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none"
            />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Temp password (min. 8 chars)"
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none"
            />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none"
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          {error && (
            <div className="flex items-center gap-2 text-sm text-rose-600 mb-3">
              <AlertCircle size={15} /> {error}
            </div>
          )}
          <button
            onClick={handleCreate}
            disabled={creating}
            className="flex items-center gap-1 bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50"
          >
            <Plus size={14} /> {creating ? "Creating…" : "Create Account"}
          </button>
        </div>

        {loading ? (
          <p className="text-sm text-slate-400">Loading users…</p>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
            {users.map((u) => (
              <div
                key={u.id}
                className="flex items-center justify-between px-5 py-4"
              >
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    {u.name}
                  </p>
                  <p className="text-xs text-slate-400">{u.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-md capitalize ${roleBadge[u.role]}`}
                  >
                    {u.role}
                  </span>

                  {resetTarget === u.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="password"
                        value={resetValue}
                        onChange={(e) => setResetValue(e.target.value)}
                        placeholder="New password"
                        className="border border-slate-200 rounded-lg px-2 py-1.5 text-xs outline-none w-32"
                      />
                      <button
                        onClick={() => handleReset(u.id)}
                        disabled={resetting}
                        className="text-xs font-medium text-indigo-600 disabled:opacity-50"
                      >
                        {resetting ? "Saving…" : "Save"}
                      </button>
                      <button
                        onClick={() => {
                          setResetTarget(null);
                          setResetValue("");
                        }}
                        className="text-xs font-medium text-slate-400"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setResetTarget(u.id);
                        setResetValue("");
                        setError(null);
                      }}
                      title="Reset password"
                      className="text-slate-400 hover:text-indigo-600"
                    >
                      <KeyRound size={16} />
                    </button>
                  )}

                  {u.id !== currentUserId && (
                    <button
                      onClick={() => handleDelete(u.id)}
                      title="Delete account"
                      className="text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
            {users.length === 0 && (
              <p className="px-5 py-8 text-center text-sm text-slate-400">
                No users yet.
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminUsersPage;
