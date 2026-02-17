import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { UserPlus, Mail, Lock, User } from "lucide-react";
import { Button } from "../Button";

export const RegisterView = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    const fakeResponse = {
      user: { id: 2, name, email },
      token: "fake-jwt-token",
    };

    register(fakeResponse.user, fakeResponse.token);
    navigate("/");
  };

  return (
    <div className='container min-vh-100 d-flex align-items-center justify-content-center py-5 animate-fade-in'>
      <div
        className='card border-0 shadow-lg rounded-5 bg-card border-base w-100'
        style={{ maxWidth: "480px" }}
      >
        <div className='card-body p-5'>
          <div className='text-center mb-5'>
            <div className='bg-success bg-opacity-10 p-4 rounded-circle d-inline-flex mb-4'>
              <UserPlus className='w-8 h-8 text-success' />
            </div>
            <h2 className='fw-bold text-base mb-2'>Create Account</h2>
            <p className='text-muted small'>
              Start creating powerful AI video shorts
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className='mb-4'>
              <label className='form-label fw-bold text-base small'>
                Full Name
              </label>
              <div className='input-group bg-surface rounded-pill border border-base shadow-sm'>
                <span className='input-group-text bg-transparent border-0'>
                  <User className='w-4 h-4 text-muted' />
                </span>
                <input
                  type='text'
                  className='form-control border-0 bg-transparent rounded-pill'
                  placeholder='John Doe'
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className='mb-4'>
              <label className='form-label fw-bold text-base small'>
                Email
              </label>
              <div className='input-group bg-surface rounded-pill border border-base shadow-sm'>
                <span className='input-group-text bg-transparent border-0'>
                  <Mail className='w-4 h-4 text-muted' />
                </span>
                <input
                  type='email'
                  className='form-control border-0 bg-transparent rounded-pill'
                  placeholder='you@example.com'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className='mb-4'>
              <label className='form-label fw-bold text-base small'>
                Password
              </label>
              <div className='input-group bg-surface rounded-pill border border-base shadow-sm'>
                <span className='input-group-text bg-transparent border-0'>
                  <Lock className='w-4 h-4 text-muted' />
                </span>
                <input
                  type='password'
                  className='form-control border-0 bg-transparent rounded-pill'
                  placeholder='••••••••'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
