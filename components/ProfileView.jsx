import React from 'react';
import { User, Zap, Video, LogOut, Sun, Moon, Globe } from 'lucide-react';
import { Button } from './Button';
import { useApp } from '../contexts/AppContext';

export const ProfileView = () => {
  const { t, theme, toggleTheme, language, setLanguage } = useApp();

  const handleAction = (action) => {
    alert(`${action} (Simulation)`);
  }

  return (
    <div className="container py-4 animate-fade-in">
      {/* Header Card */}
      <div className="card border-0 shadow-sm rounded-5 mb-4 overflow-hidden bg-card border-base">
        <div className="card-body p-4 p-md-5">
          <div className="row align-items-center">
            <div className="col-auto mb-4 mb-md-0">
              <div className="position-relative">
                <div className="rounded-circle bg-primary bg-gradient d-flex align-items-center justify-content-center text-white shadow fw-bold border border-4 border-card" style={{ width: '110px', height: '110px', fontSize: '2.5rem' }}>
                  JD
                </div>
                <div className="position-absolute bottom-0 end-0 bg-success border border-4 border-card rounded-circle shadow-sm" style={{ width: '1.8rem', height: '1.8rem' }}></div>
              </div>
            </div>

            <div className="col text-center text-md-start mb-4 mb-md-0 ps-md-4">
              <h1 className="h2 fw-bold text-base mb-1">John Doe</h1>
              <p className="text-muted mb-3 opacity-75">john.doe@example.com</p>
              <div className="d-flex flex-wrap justify-content-center justify-content-md-start gap-2">
                <span className="badge rounded-pill bg-primary bg-opacity-10 text-primary px-3 py-2 text-uppercase fw-bold" style={{ fontSize: '0.65rem', border: '1px solid var(--bs-primary)' }}>
                  Pro Plan
                </span>
                <span className="badge rounded-pill bg-surface text-muted px-3 py-2 fw-medium border border-base shadow-none" style={{ fontSize: '0.65rem' }}>
                  Member since 2023
                </span>
              </div>
            </div>

            <div className="col-md-auto text-center">
              <Button variant="outline" size="md" className="rounded-pill px-4" icon={<User className="w-4 h-4" />} onClick={() => handleAction('Edit Profile')}>
                Edit Profile
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4 mb-5">
        {/* Plan Stats */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-lg rounded-5 bg-dark text-white h-100 overflow-hidden position-relative">
            <div className="position-absolute top-0 end-0 translate-middle-y mt-5 me-n5 bg-primary bg-opacity-25 rounded-circle blur-3xl opacity-25" style={{ width: '300px', height: '300px' }}></div>
            <div className="card-body p-4 p-md-5 position-relative z-1">
              <div className="d-flex justify-content-between align-items-start mb-5">
                <div>
                  <h6 className="text-white text-opacity-50 text-uppercase fw-bold mb-3 small tracking-widest">{t('profile.plan')}</h6>
                  <div className="h1 fw-bold d-flex align-items-center mb-0">
                    <Zap className="w-8 h-8 text-warning me-3" fill="currentColor" />
                    Professional
                  </div>
                  <p className="small text-white text-opacity-50 mt-2 mb-0 fw-medium">Next billing cycle: Oct 24, 2024</p>
                </div>
                <Button size="sm" variant="white" className="rounded-pill px-4 text-dark border-0 hover-translate-y" onClick={() => handleAction('Upgrade Plan')}>
                  {t('profile.upgrade')}
                </Button>
              </div>

              <div className="pt-2">
                <div className="d-flex justify-content-between small mb-3 text-white text-opacity-75 fw-bold">
                  <span className="tracking-tight">{t('profile.mins')}</span>
                  <span className="font-monospace">450 / 1000 Mins</span>
                </div>
                <div className="progress bg-white bg-opacity-10 rounded-pill shadow-inner overflow-hidden" style={{ height: '12px' }}>
                  <div className="progress-bar bg-primary bg-gradient rounded-pill shadow-sm transition-all" role="progressbar" style={{ width: '45%', transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)' }} aria-valuenow={45} aria-valuemin={0} aria-valuemax={100}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stat */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-5 h-100 text-center bg-card hover-translate-y transition-all overflow-hidden border border-base">
            <div className="card-body d-flex flex-column justify-content-center align-items-center p-5">
              <div className="p-4 bg-success bg-opacity-10 rounded-circle mb-4 shadow-sm">
                <Video className="w-10 h-10 text-success" />
              </div>
              <div className="h1 fw-bold text-base mb-0 tracking-tight" style={{ fontSize: '3.5rem' }}>124</div>
              <div className="text-muted small fw-bold text-uppercase tracking-widest mt-1">{t('profile.videos')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Sections: Appearance & Account */}
      <div className="row g-4 pb-5">
        {/* Appearance Settings */}
        <div className="col-md-6">
          <div className="card border-0 shadow-sm rounded-5 h-100 bg-card border-base">
            <div className="card-body p-4 p-md-5">
              <h5 className="fw-bold text-base mb-5 d-flex align-items-center">
                <div className="p-2 bg-primary bg-opacity-10 rounded-circle me-3">
                  <Sun className="w-5 h-5 text-primary" />
                </div>
                {t('settings.appearance')}
              </h5>

              <div className="d-flex align-items-center justify-content-between mb-4 pb-3 border-bottom border-base">
                <div>
                  <label className="d-block h6 fw-bold text-base mb-1">{t('settings.theme')}</label>
                  <p className="small text-muted mb-0">Select your preferred visual mode</p>
                </div>
                <div className="btn-group rounded-pill bg-surface p-1 shadow-sm border border-base">
                  <button
                    onClick={() => theme === 'dark' && toggleTheme()}
                    className={`btn btn-sm border-0 rounded-pill px-3 py-2 transition-all ${theme === 'light' ? 'bg-card shadow-sm text-primary fw-bold' : 'text-muted'}`}
                  >
                    <Sun className="w-4 h-4 me-2" /> Light
                  </button>
                  <button
                    onClick={() => theme === 'light' && toggleTheme()}
                    className={`btn btn-sm border-0 rounded-pill px-3 py-2 transition-all ${theme === 'dark' ? 'bg-primary shadow-sm text-white fw-bold' : 'text-muted'}`}
                  >
                    <Moon className="w-4 h-4 me-2" /> Dark
                  </button>
                </div>
              </div>

              <div className="d-flex align-items-center justify-content-between pt-2">
                <div>
                  <label className="d-block h6 fw-bold text-base mb-1">{t('settings.language')}</label>
                  <p className="small text-muted mb-0">Choose the system interface language</p>
                </div>
                <div className="btn-group rounded-pill bg-surface p-1 shadow-sm border border-base">
                  <button
                    onClick={() => setLanguage('en')}
                    className={`btn btn-sm border-0 rounded-pill px-3 py-2 transition-all fw-bold ${language === 'en' ? 'bg-card shadow-sm text-primary' : 'text-muted'}`}
                  >
                    EN
                  </button>
                  <button
                    onClick={() => setLanguage('es')}
                    className={`btn btn-sm border-0 rounded-pill px-3 py-2 transition-all fw-bold ${language === 'es' ? 'bg-card shadow-sm text-primary' : 'text-muted'}`}
                  >
                    ES
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Account Controls */}
        <div className="col-md-6">
          <div className="card border-0 shadow-sm rounded-5 h-100 bg-card border-base">
            <div className="card-body p-4 p-md-5 d-flex flex-column align-items-center justify-content-center">
              <div className="bg-danger bg-opacity-10 p-4 rounded-circle mb-4">
                <LogOut className="w-10 h-10 text-danger" />
              </div>
              <h5 className="fw-bold text-base mb-2">Security & Access</h5>
              <p className="text-muted small text-center mb-4 px-lg-5">Ensure your account is secure by managing active sessions.</p>
              <button
                className="btn btn-outline-danger w-100 py-3 rounded-pill fw-bold shadow-sm d-flex align-items-center justify-content-center transition-all hover-translate-y"
                onClick={() => handleAction('Sign Out')}
              >
                <LogOut className="w-5 h-5 me-2" />
                Sign Out from all devices
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};