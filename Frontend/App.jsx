import React, { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { ProcessingView } from './components/ProcessingView';
import { ResultView } from './components/ResultView';
import { ProjectsView } from './components/ProjectsView';
import { HelpView } from './components/HelpView';
import { ProfileView } from './components/ProfileView';
import { uploadVideo } from './services/videoService';
import { AppProvider, useApp } from './contexts/AppContext';

import { MOCK_PROJECTS } from './utils/mockData';

import { Sidebar } from './components/layout/Sidebar';
import { MobileHeader } from './components/layout/MobileHeader';

function AppContent() {
  const [currentScreen, setCurrentScreen] = useState('dashboard');
  const [selectedFile, setSelectedFile] = useState(null);
  const [logs, setLogs] = useState([]);
  const [shorts, setShorts] = useState([]);
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
    if (!selectedFile) return;

    try {
      addLog("Uploading video...", "info");
      const response = await uploadVideo(selectedFile);

      addLog("Video uploaded successfully", "success");

      // setShorts(response.shorts); código acá cuando devuelva los shorts

    } catch (error) {
      console.error(error);
      addLog("Error processing video", "error");
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
        <Sidebar
          currentScreen={currentScreen}
          onNavigate={setCurrentScreen}
          language={language}
          setLanguage={setLanguage}
          theme={theme}
          toggleTheme={toggleTheme}
          t={t}
        />

        {/* Main Content Area */}
        <main className="ms-md-auto col-md-9 col-lg-10 px-md-4 py-4 min-vh-100 position-relative">
          <MobileHeader onProfileClick={() => setCurrentScreen('profile')} />

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
                shorts={shorts}
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

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}