import React, { useState } from 'react';
import { Layout, Clapperboard, HelpCircle, LogOut, Sun, Moon, Globe, User } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { ProcessingView } from './components/ProcessingView';
import { ResultView } from './components/ResultView';
import { ProjectsView } from './components/ProjectsView';
import { HelpView } from './components/HelpView';
import { ProfileView } from './components/ProfileView';
import { generateSmartCaptions } from './services/geminiService';
import { AppProvider, useApp } from './contexts/AppContext';

const MOCK_PROJECTS = [
  {
    video_id: '1',
    file_name: 'Tech Review - iPhone 15',
    created_at: '2 hours ago',
    status: 'ready',
    file_url: 'https://picsum.photos/seed/tech/200/300',
    duration_seconds: 120,
    shorts_requested: 3,
    width: 1920,
    height: 1080,
    aspect_ratio: '16:9',
    file_size: 15728640 // 15MB
  },
  {
    video_id: '2',
    file_name: 'Gym Vlog #42',
    created_at: 'Yesterday',
    status: 'ready',
    file_url: 'https://picsum.photos/seed/gym/200/300',
    duration_seconds: 300,
    shorts_requested: 5,
    width: 3840,
    height: 2160,
    aspect_ratio: '16:9',
    file_size: 104857600 // 100MB
  },
  {
    video_id: '3',
    file_name: 'Cooking Pasta',
    created_at: '3 days ago',
    status: 'failed',
    file_url: 'https://picsum.photos/seed/food/200/300',
    duration_seconds: 45,
    shorts_requested: 1,
    width: 1080,
    height: 1920,
    aspect_ratio: '9:16',
    file_size: 5242880 // 5MB
  },
  {
    video_id: '4',
    file_name: 'Travel Vlog: Japan',
    created_at: '1 week ago',
    status: 'processing',
    file_url: 'https://picsum.photos/seed/japan/200/300',
    duration_seconds: 600,
    shorts_requested: 10,
    width: 1920,
    height: 1080,
    aspect_ratio: '16:9',
    file_size: 209715200 // 200MB
  },
  {
    video_id: '5',
    file_name: 'Coding Tutorial',
    created_at: '2 weeks ago',
    status: 'ready',
    file_url: 'https://picsum.photos/seed/code/200/300',
    duration_seconds: 1200,
    shorts_requested: 2,
    width: 2560,
    height: 1440,
    aspect_ratio: '16:9',
    file_size: 419430400 // 400MB
  },
  {
    video_id: '6',
    file_name: 'Cat Compilation',
    created_at: '1 month ago',
    status: 'ready',
    file_url: 'https://picsum.photos/seed/cat/200/300',
    duration_seconds: 60,
    shorts_requested: 4,
    width: 1280,
    height: 720,
    aspect_ratio: '16:9',
    file_size: 8388608 // 8MB
  },
];

function AppContent() {
  const [currentScreen, setCurrentScreen] = useState('dashboard');
  const [selectedFile, setSelectedFile] = useState(null);
  const [logs, setLogs] = useState([]);
  const [captions, setCaptions] = useState([]);
  const { theme, toggleTheme, language, setLanguage, t } = useApp();

  const addLog = (message, type = 'info') => {
    const newLog = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      message,
      type
    };
    setLogs(prev => [...prev, newLog]);
  };

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    setCurrentScreen('processing');
    setLogs([]);
  };

  const handleProcessingComplete = async () => {
    try {
      const generated = await generateSmartCaptions(selectedFile?.name || "Viral Video", language);
      setCaptions(generated);
    } catch (e) {
      console.error(e);
    }
    setCurrentScreen('result');
  };

  const handleBackToDashboard = () => {
    setSelectedFile(null);
    setLogs([]);
    setCurrentScreen('dashboard');
  };

  return (
    <div className="container-fluid min-vh-100 bg-light-subtle font-sans transition-all duration-300">
      <div className="row h-100">
        {/* Sidebar Navigation */}
        <nav id="sidebar" className="col-md-3 col-lg-2 d-md-block bg-white sidebar shadow-sm px-0 h-100 bg-glass position-fixed top-0 start-0 z-3 p-0">
          <div className="d-flex flex-column h-100">
            {/* Logo area */}
            <div className="py-4 px-4 mb-3 border-bottom d-flex align-items-center">
              <div className="bg-primary bg-opacity-10 p-2 rounded-4 shadow-sm border border-primary border-opacity-10">
                <Clapperboard className="w-5 h-5 text-primary" />
              </div>
              <span className="ms-3 h6 mb-0 fw-bold tracking-wider text-gradient">VERTICAL AI</span>
            </div>

            <div className="flex-grow-1 px-3 py-3 overflow-auto">
              <NavItem
                icon={<Layout />}
                label={t('sidebar.dashboard')}
                active={currentScreen === 'dashboard'}
                onClick={handleBackToDashboard}
              />
              <NavItem
                icon={<Clapperboard />}
                label={t('sidebar.projects')}
                active={currentScreen === 'projects'}
                onClick={() => setCurrentScreen('projects')}
              />
              <NavItem
                icon={<HelpCircle />}
                label={t('sidebar.help')}
                active={currentScreen === 'help'}
                onClick={() => setCurrentScreen('help')}
              />
            </div>

            {/* Footer Sidebar Actions */}
            <div className="px-3 py-4 border-top mt-auto bg-surface">
              {/* Language Selection */}
              <div className="px-3 pb-3">
                <div className="d-flex align-items-center justify-content-between">
                  <span className="small fw-bold text-muted text-uppercase tracking-wider" style={{ fontSize: '0.65rem' }}>Language</span>
                  <div className="btn-group p-1 bg-surface border border-base rounded-pill shadow-sm">
                    <button
                      onClick={() => setLanguage('en')}
                      className={`btn btn-sm px-3 rounded-pill border-0 transition-all fw-bold ${language === 'en' ? 'btn-primary text-white shadow-sm' : 'text-muted'}`}
                      style={{ fontSize: '0.7rem' }}
                    >
                      EN
                    </button>
                    <button
                      onClick={() => setLanguage('es')}
                      className={`btn btn-sm px-3 rounded-pill border-0 transition-all fw-bold ${language === 'es' ? 'btn-primary text-white shadow-sm' : 'text-muted'}`}
                      style={{ fontSize: '0.7rem' }}
                    >
                      ES
                    </button>
                  </div>
                </div>
              </div>

              {/* Theme & User Profile */}
              <div className="px-1">
                <button
                  onClick={toggleTheme}
                  className="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-between px-3 py-2 rounded-4 border-dashed mb-3 transition-all hover-translate-y shadow-sm bg-card border-base"
                >
                  <div className="d-flex align-items-center fw-bold small">
                    {theme === 'dark' ? <Moon className="w-4 h-4 me-2 text-primary" /> : <Sun className="w-4 h-4 me-2 text-warning" />}
                    {t('sidebar.theme')}
                  </div>
                  <span className={`badge rounded-pill px-2 py-1 text-uppercase ${theme === 'dark' ? 'bg-primary' : 'bg-dark'}`} style={{ fontSize: '0.55rem' }}>
                    {theme}
                  </span>
                </button>

                <button
                  onClick={() => setCurrentScreen('profile')}
                  className={`btn d-flex align-items-center w-100 px-3 py-3 rounded-4 border border-secondary-subtle transition-all bg-card shadow-sm ${currentScreen === 'profile' ? 'border-primary' : ''}`}
                >
                  <div className="rounded-circle bg-primary bg-gradient d-flex align-items-center justify-content-center text-white fw-bold shadow-sm" style={{ width: '36px', height: '36px', fontSize: '0.8rem' }}>
                    JD
                  </div>
                  <div className="ms-3 text-start flex-grow-1 overflow-hidden">
                    <div className="small fw-bold text-base text-truncate">John Doe</div>
                    <div className="text-muted" style={{ fontSize: '0.65rem' }}>john.doe@example.com</div>
                  </div>
                  <LogOut className="w-4 h-4 text-muted ms-2 opacity-50" />
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="ms-md-auto col-md-9 col-lg-10 px-md-4 py-4 min-vh-100 position-relative">
          {/* Mobile Header */}
          <div className="d-md-none bg-primary bg-gradient border-bottom d-flex align-items-center justify-content-between px-4 py-3 sticky-top z-10 shadow-sm rounded-bottom-4 mb-4">
            <div className="d-flex align-items-center">
              <div className="bg-white p-1 rounded-circle me-3">
                <Clapperboard className="w-5 h-5 text-primary" />
              </div>
              <span className="fw-bold text-white tracking-wider">VERTICAL AI</span>
            </div>
            <button onClick={() => setCurrentScreen('profile')} className="btn btn-light rounded-circle p-2 shadow-sm border-0">
              <User className="w-5 h-5 text-primary" />
            </button>
          </div>

          <div className="container-xl p-2 p-md-4">
            {currentScreen === 'dashboard' && (
              <Dashboard
                onFileSelect={handleFileSelect}
                recentProjects={MOCK_PROJECTS.slice(0, 3)}
              />
            )}

            {currentScreen === 'processing' && (
              <ProcessingView
                file={selectedFile}
                onComplete={handleProcessingComplete}
                addLog={addLog}
                logs={logs}
              />
            )}

            {currentScreen === 'result' && (
              <ResultView
                shorts={captions}
                onBack={handleBackToDashboard}
              />
            )}

            {currentScreen === 'projects' && (
              <ProjectsView projects={MOCK_PROJECTS} />
            )}

            {currentScreen === 'help' && <HelpView />}

            {currentScreen === 'profile' && <ProfileView />}
          </div>
        </main>
      </div >
    </div >
  );
}

// Sub-component for nav items
function NavItem({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`btn d-flex align-items-center w-100 px-4 py-3 rounded-4 transition-all mb-1 border-0 text-start group ${active ? 'btn-primary text-white shadow shadow-primary-subtle' : 'btn-link text-muted text-decoration-none hover-bg-light fw-bold small'}`}
    >
      <span className={`me-3 d-flex align-items-center transition-transform ${active ? 'scale-110' : 'group-hover-translate-x'}`}>
        {React.cloneElement(icon, { size: 18, strokeWidth: active ? 2.5 : 2 })}
      </span>
      <span>{label}</span>
    </button>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}