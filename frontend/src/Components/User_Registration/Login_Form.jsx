import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import axios from 'axios';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    non_field_errors: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({ email: '', password: '', non_field_errors: '' });
    setLoading(true);

    const loginData = {
      email: email,
      password: password
    };

    axios.post('http://127.0.0.1:8000/api/login/', loginData, {
      headers: { 'Content-Type': 'application/json' }
    })
    .then(response => {
      console.log('Login successful:', response.data);
      document.cookie = `token=${response.data.token}; path=/`
      navigate("/chats");
    })
    .catch(error => {
      if (error.response && error.response.data) {
        const data = error.response.data;
        setErrors({
          email: data.email ? data.email[0] : '',
          password: data.password ? data.password[0] : '',
          non_field_errors: data.non_field_errors ? data.non_field_errors[0] : ''
        });
      } else {
        console.error('Error logging in:', error);
      }
    })
    .finally(() => {
      setLoading(false);
    });
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-800">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-900 p-8 rounded-lg shadow-md w-full max-w-sm flex flex-col gap-4"
      >
        <h1 className="text-white text-2xl font-semibold text-center mb-4">Login</h1>

        {errors.non_field_errors && (
          <p className="text-red-500 text-sm mb-2 text-center">{errors.non_field_errors}</p>
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setErrors((prev) => ({ ...prev, email: '', non_field_errors: '' }));
          }}
          required
          className="text-white border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-800 placeholder-gray-400"
        />
        {errors.email && (
          <p className="text-red-500 text-sm mt-1">{errors.email}</p>
        )}

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setErrors((prev) => ({ ...prev, password: '', non_field_errors: '' }));
          }}
          required
          className="text-white border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-800 placeholder-gray-400"
        />
        {errors.password && (
          <p className="text-red-500 text-sm mt-1">{errors.password}</p>
        )}

        <button
          type="submit"
          disabled={loading} // disable button while loading
          className={`bg-blue-500 text-white py-2 rounded-md mt-2 transition-colors hover:bg-blue-600 flex justify-center items-center ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}

export default LoginForm;
