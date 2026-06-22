import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '@/context/useUser.jsx';

export default function SigninForm({ setLoading }) {
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { login } = useUser();

  const handleSubmit = async (event) => {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password) {
      setError('Email and password are required.');
      return;
    }

    setLoading(true); // 🔥 Trigger loader in parent

    try {
      const authUser = await login(normalizedEmail, password);

      if (authUser?.role === 'admin') navigate('/admin');
      else navigate('/home');
    } catch (err) {
      setError(err?.message || 'Sign in failed');
      setLoading(false); // ❌ Stop loader on error
    }

    setEmail('');
    setPassword('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col w-full">
      <input
        type="email"
        placeholder="Enter your email"
        className="border-2 border-pink-600 m-2 px-1 text-[1rem] text-black rounded-lg"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        autoComplete="email"
        required
      />
      <input
        type="password"
        placeholder="Enter your password"
        className="border-2 border-pink-600 m-2 px-1 text-[1rem] text-black rounded-lg"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoCapitalize="none"
        autoCorrect="off"
        autoComplete="current-password"
        required
      />

      <button
        type="submit"
        className="border-2 border-white m-1 px-1 text-black text-[1.3rem] rounded-md"
      >
        Sign In
      </button>

      {error && <div className="text-red-600 text-sm m-2">{error}</div>}

      <div>
        <h3 className="text-black text-[1rem] underline">
          Don't have an account?{' '}
          <Link to="/signup" className="text-pink-700">
            Sign Up
          </Link>
        </h3>
        <Link to="/forgotpass">
          <p className="underline text-red-700">Forgot password?</p>
        </Link>
        <Link to="/home">
          <p className="underline text-pink-700">Return home</p>
        </Link>
      </div>
    </form>
  );
}
