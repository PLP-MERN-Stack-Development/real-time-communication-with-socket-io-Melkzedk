import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

function Register() {
  const [form, setForm] = useState({ username: '', password: '' });
  const navigate = useNavigate();

  // Change this to your Render backend URL
  const API_URL = 'https://real-time-communication-with-socket-io-d2o0.onrender.com/api';

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/auth/register`, form);
      localStorage.setItem('token', res.data.token);
      navigate('/chat');
    } catch (err) {
      console.error(err.response || err);
      alert('Registration failed. Please check your credentials or try again.');
    }
  };

  return (
    <div className="container mt-4">
      <h3>Register</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="username"
          className="form-control my-2"
          placeholder="Username"
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          className="form-control my-2"
          placeholder="Password"
          onChange={handleChange}
          required
        />
        <button type="submit" className="btn btn-primary">Register</button>
        <p className="mt-2">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </form>
    </div>
  );
}

export default Register;
