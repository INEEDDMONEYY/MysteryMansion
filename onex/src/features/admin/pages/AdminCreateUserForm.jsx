import { useState } from "react";
import api from "@/shared/utils/api";

export default function AdminCreateUserForm() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const { data } = await api.post("/admin/create-user", {
        username,
        email,
        password,
        role,
      });
      setMessage(data?.message || "User created successfully.");
      setUsername("");
      setEmail("");
      setPassword("");
      setRole("user");
    } catch (err) {
      console.error(err);
      setMessage(err?.response?.data?.error || "Server error. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
      <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-5">
        Create New User
      </h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          className="bg-neutral-800 border border-neutral-700 text-white placeholder:text-neutral-500 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-500 w-full"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <input
          className="bg-neutral-800 border border-neutral-700 text-white placeholder:text-neutral-500 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-500 w-full"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          className="bg-neutral-800 border border-neutral-700 text-white placeholder:text-neutral-500 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-500 w-full"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <select
          className="bg-neutral-800 border border-neutral-700 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-500 w-full"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>

        <button
          type="submit"
          disabled={loading}
          className="bg-rose-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-rose-700 transition disabled:opacity-50"
        >
          {loading ? "Creating…" : "Create User"}
        </button>

        {message && (
          <p className="text-center text-sm text-neutral-400">{message}</p>
        )}
      </form>
    </div>
  );
}