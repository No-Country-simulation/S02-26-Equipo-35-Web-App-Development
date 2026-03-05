import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { UserPlus, Mail, Lock, User } from "lucide-react";
import { Button } from "../Button";
import { registerRequest } from "../../services/authService";

export const RegisterView = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    try {
      const data = await registerRequest({
        username,
        email,
        password,
        password2: password,
        first_name: firstName,
        last_name: lastName,
      });

      register(data.user, data.token);
      navigate("/");
    } catch (err) {
      console.error("Register error:", err.message);
      setError("Registration failed. Please check your data.");
    }
  };

  return (
    <div className='container min-vh-100 d-flex align-items-center justify-content-center py-5'>
      <div
        className='card border-0 shadow-lg rounded-5 bg-card border-base w-100'
        style={{ maxWidth: "500px" }}
      >
        <div className='card-body p-5'>
          <div className='text-center mb-4'>
            <div className='bg-success bg-opacity-10 p-4 rounded-circle d-inline-flex mb-3'>
              <UserPlus className='w-8 h-8 text-success' />
            </div>
            <h2 className='fw-bold'>Create Account</h2>
          </div>

          {error && (
            <div className='alert alert-danger small py-2'>{error}</div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Username */}
            <div className='mb-3'>
              <label className='form-label fw-bold small'>Username</label>
              <div className='input-group rounded-pill border shadow-sm'>
                <span className='input-group-text bg-transparent border-0'>
                  <User className='w-4 h-4 text-muted' />
                </span>
                <input
                  type='text'
                  className='form-control border-0 rounded-pill'
                  placeholder='username123'
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* First Name */}
            <div className='mb-3'>
              <label className='form-label fw-bold small'>First Name</label>
              <input
                type='text'
                className='form-control rounded-pill shadow-sm'
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>

            {/* Last Name */}
            <div className='mb-3'>
              <label className='form-label fw-bold small'>Last Name</label>
              <input
                type='text'
                className='form-control rounded-pill shadow-sm'
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>

            {/* Email */}
            <div className='mb-3'>
              <label className='form-label fw-bold small'>Email</label>
              <div className='input-group rounded-pill border shadow-sm'>
                <span className='input-group-text bg-transparent border-0'>
                  <Mail className='w-4 h-4 text-muted' />
                </span>
                <input
                  type='email'
                  className='form-control border-0 rounded-pill'
                  placeholder='you@example.com'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className='mb-4'>
              <label className='form-label fw-bold small'>
                Password (min 6 characters)
              </label>
              <div className='input-group rounded-pill border shadow-sm'>
                <span className='input-group-text bg-transparent border-0'>
                  <Lock className='w-4 h-4 text-muted' />
                </span>
                <input
                  type='password'
                  className='form-control border-0 rounded-pill'
                  placeholder='••••••'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                  required
                />
              </div>
            </div>

            <Button
              type='submit'
              className='w-100 rounded-pill py-3 fw-bold shadow-sm'
            >
              Create Account
            </Button>
          </form>

          <div className='text-center mt-4 small'>
            <span className='text-muted'>Already have an account? </span>
            <Link to='/login' className='fw-bold text-primary'>
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
