// Front-end Forgot Password Form Component
import { useState } from "react";
import { Link } from "react-router";
import api from "@/shared/utils/api";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    setLoading(true);

    try {
      const res = await api.post("/auth/forgot-password", { email });
      setMessage(
        res.data?.message ||
          " A password reset link was sent to your email."
      );
      setEmail("");
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Unable to send reset email please make sure email is the exact one used when signed up. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col w-full"
      >
        <input
          type="email"
          name="email"
          placeholder="Enter your email"
          className="border-2 border-red-600 m-2 px-1 text-[1rem] text-black rounded-lg"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {message && (
          <p className="text-green-600 text-[0.9rem] m-2">{message}</p>
        )}
        {error && (
          <p className="text-red-600 text-[0.9rem] m-2">{error}</p>
        )}

        <div>
          <button
            name="submit-btn"
            type="submit"
            disabled={loading}
            className="border-2 border-black m-1 px-1 text-red-700 text-[1.2rem] rounded-md"
            id="reset-password-btn"
          >
            {loading ? "Sending..." : "Send Email"}
          </button>
        </div>

        <div>
          <h3 className="text-black text-[1rem] underline">
            Don't have an account yet?{" "}
            <Link to="/signup" className="text-pink-700">
              Sign Up
            </Link>
          </h3>
          <Link to="/home">
            <p className="underline text-pink-700">Return home</p>
          </Link>
        </div>
      </form>
    </>
  );
}
