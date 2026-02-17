import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { LogIn, Mail, Lock } from "lucide-react";
import { Button } from "../Button";
import { useApp } from "../../contexts/AppContext";

export const LoginView = () => {
  const { login } = useAuth();
  const { t } = useApp();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    const fakeResponse = {
      user: { id: 1, name: "Camilo", email },
      token: "fake-jwt-token",
    };

    login(fakeResponse.user, fakeResponse.token);
    navigate("/");
  };

  return (
    <div className="container min-vh-100 d-flex align-items-center justify-content-center py-5 animate-fade-in">
      <div className="card border-0 shadow-lg rounded-5 bg-card border-base w-100"
           style={{ maxWidth: "480px" }}>

        <div className="card-body p-5">

          {/* Header */}
          <div className="text-center mb-5">
            <div className="bg-primary bg-opacity-10 p-4 rounded-circle d-inline-flex mb-4">
              <LogIn className="w-8 h-8 text-primary" />
            </div>
            <h2 className="fw-bold text-base mb-2">Welcome Back</h2>
            <p className="text-muted small">
              Sign in to continue to your dashboard
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>

            <div className="mb-4">
              <label className="form-label fw-bold text-base small">
                Email
              </label>
              <div className="input-group bg-surface rounded-pill border border-base shadow-sm">
                <span className="input-group-text bg-transparent border-0">
                  <Mail className="w-4 h-4 text-muted" />
                </span>
                <input
                  type="email"
                  className="form-control border-0 bg-transparent rounded-pill"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label fw-bold text-base small">
                Password
              </label>
              <div className="input-group bg-surface rounded-pill border border-base shadow-sm">
                <span className="input-group-text bg-transparent border-0">
                  <Lock className="w-4 h-4 text-muted" />
                </span>
                <input
                  type="password"
                  className="form-control border-0 bg-transparent rounded-pill"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-100 rounded-pill py-3 fw-bold shadow-sm"
            >
              Sign In
            </Button>
          </form>

          {/* Footer */}
          <div className="text-center mt-4 small">
            <span className="text-muted">
              Don't have an account?{" "}
            </span>
            <Link to="/register" className="fw-bold text-primary">
              Create one
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};
