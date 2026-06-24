import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '@/context/useUser.jsx';
import api from '@/shared/utils/api';

export default function SignupForm({ accountType = 'client' }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useUser();

  const normalizeUsernameInput = (value = '') =>
    value
      .replace(/[\u2018\u2019\u201A\u201B\u2032]/g, "'")
      .replace(/[\u201C\u201D\u201E\u201F\u2033]/g, '"')
      .replace(/\u00A0/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

  const handleSignup = async (e) => {
    e.preventDefault();

    const normalizedUsername = normalizeUsernameInput(username);
    if (!normalizedUsername || !email.trim() || !password) {
      setError('Username, email, and password are required.');
      return;
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!passwordRegex.test(password)) {
      setError(
        'Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character.'
      );
      return;
    }

    try {
      await api.post('/auth/signup', {
        username: normalizedUsername,
        email: email.trim(),
        password,
        role: 'user',
        accountType,
      });
      await login(email.trim().toLowerCase(), password);
      if (accountType === 'client') navigate('/client/dashboard');
      else navigate('/user/dashboard');
    } catch (err) {
      setError(err?.response?.data?.error || 'Server error: ' + (err?.message || ''));
    }
  };

  return (
    <form onSubmit={handleSignup} className="flex flex-col w-full">

      {/* Username */}
      <input
        type="text"
        placeholder="Create a username"
        className="border-2 border-pink-600 m-2 px-2 py-1.5 text-[1rem] text-black bg-white placeholder-gray-500 rounded-lg w-full"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        autoComplete="username"
        required
      />

      {/* Email */}
      <input
        type="email"
        placeholder="Enter your email"
        className="border-2 border-pink-600 m-2 px-2 py-1.5 text-[1rem] text-black bg-white placeholder-gray-500 rounded-lg w-full"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        autoComplete="email"
        required
      />

      {/* Password */}
      <input
        type="password"
        placeholder="Enter your password"
        className="border-2 border-pink-600 m-2 px-2 py-1.5 text-[1rem] text-black bg-white placeholder-gray-500 rounded-lg w-full"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoCapitalize="none"
        autoCorrect="off"
        autoComplete="new-password"
        required
      />

      <button
        type="submit"
        className="border-2 border-white m-1 px-1 text-black text-[1.3rem] rounded-md"
      >
        Sign Up
      </button>

      {error && <div className="text-red-600 text-sm m-2">{error}</div>}

      <div>
        <h3 className="text-black text-[1rem] underline">
          Already have an account?{' '}
          <Link to="/signin" className="text-pink-700">
            Sign In
          </Link>
        </h3>
        <Link to="/home">
          <p className="underline text-pink-700">Return home</p>
        </Link>
      </div>
    </form>
  );
}

