import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { LogIn, User, Lock } from "lucide-react";
import { loginRequest } from "../../services/authService";
import { Button } from "../Button";

export const LoginView = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await loginRequest(username, password);
      login(data.user, data.token);
      navigate("/");
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='container min-vh-100 d-flex align-items-center justify-content-center py-5'>
      <div
        className='card shadow-lg rounded-5 w-100 border-0'
        style={{ maxWidth: "480px" }}
      >
        <div className='card-body p-5'>
          <div className='text-center mb-5'>
            <div className='bg-primary bg-opacity-10 p-4 rounded-circle d-inline-flex mb-4'>
              <LogIn className='text-primary' size={32} />
            </div>
            <h2 className='fw-bold mb-2'>Welcome Back</h2>
            <p className='text-muted small'>
              Sign in to continue to your dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Username */}
            <div className='mb-4'>
              <label className='form-label fw-bold small'>Username</label>
              <div className='input-group rounded-pill border shadow-sm'>
                <span className='input-group-text bg-transparent border-0'>
                  <User size={18} />
                </span>
                <input
                  type='text'
                  className='form-control border-0 rounded-pill'
                  placeholder='Enter your username'
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className='mb-4'>
              <label className='form-label fw-bold small'>Password</label>
              <div className='input-group rounded-pill border shadow-sm'>
                <span className='input-group-text bg-transparent border-0'>
                  <Lock size={18} />
                </span>
                <input
                  type='password'
                  className='form-control border-0 rounded-pill'
                  placeholder='••••••••'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button
              type='submit'
              className='w-100 rounded-pill py-3 fw-bold'
              disabled={loading}
            >
              {loading ? "Signing In..." : "Sign In"}
            </Button>
          </form>

          <div className='text-center mt-4 small'>
            <span className='text-muted'>Don't have an account? </span>
            <Link to='/register' className='fw-bold text-primary'>
              Create one
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
