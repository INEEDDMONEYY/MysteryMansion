import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/shared/utils/api";
import { setSEO } from "@/shared/utils/seo";

export default function ResetPassword() {
  const { token } = useParams(); // ✅ Step 3: read token from URL
  const navigate = useNavigate();

  useEffect(() => {
    setSEO('Reset Password | Mystery Mansion', '', { robots: 'noindex, nofollow' });
  }, []);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!token) {
      setError("Invalid or missing reset token.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await api.post(`/auth/reset-password/${token}`, {
        password,
      });

      setMessage(res.data.message || "Password reset successfully");

      setTimeout(() => navigate("/signin"), 2000);
    } catch (err) {
      if (!err.response) {
        setError("Could not reach the server. Please check your connection and try again.");
      } else {
        setError(err.response?.data?.error || "Reset link is invalid or expired.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white p-6 rounded-xl shadow-md flex flex-col gap-4"
      >
        <h1 className="text-2xl font-bold text-center">
          Reset Your Password
        </h1>

        <input
          type="password"
          placeholder="New password"
          className="border p-2 rounded-lg"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Confirm new password"
          className="border p-2 rounded-lg"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        {error && <p className="text-red-600 text-sm">{error}</p>}
        {message && <p className="text-green-600 text-sm">{message}</p>}

        <button
          type="submit"
          disabled={loading}
          className="bg-black text-white py-2 rounded-lg hover:opacity-90"
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
}
