import React, { useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { Dashboard } from "./components/Dashboard";
import { ProcessingView } from "./components/ProcessingView";
import { ResultView } from "./components/ResultView";
import { ProjectsView } from "./components/ProjectsView";
import { HelpView } from "./components/HelpView";
import { ProfileView } from "./components/ProfileView";

import { uploadVideo } from "./services/videoService";
import { getShortsByVideo } from "./services/shortService";
import { AppProvider, useApp } from "./contexts/AppContext";

import { MOCK_PROJECTS } from "./utils/mockData";

import { Sidebar } from "./components/layout/Sidebar";
import { MobileHeader } from "./components/layout/MobileHeader";
import { LoginView } from "./components/auth/LoginView";
import { RegisterView } from "./components/auth/RegisterView";

function AppContent() {
  const navigate = useNavigate();

  const [selectedFile, setSelectedFile] = useState(null);
  const [logs, setLogs] = useState([]);
  const [shorts, setShorts] = useState([]);

  const { theme, toggleTheme, language, setLanguage, t } = useApp();

  const addLog = (message, type = "info") => {
    const newLog = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString([], {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
      message,
      type,
    };
    setLogs((prev) => [...prev, newLog]);
  };

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    setLogs([]);
    navigate("/processing");
  };

  const handleProcessingComplete = async () => {
    if (!selectedFile) return;

    try {
      addLog("Uploading video...", "info");

      const video = await uploadVideo(selectedFile);
      const videoId = video.id ?? video.video_id;

      if (!videoId) {
        throw new Error("Video ID not found in response");
      }

      addLog("Video uploaded. Processing started...", "info");
      addLog("Waiting for shorts to be generated...", "info");

      let generatedShorts = [];
      let attempts = 0;
      const maxAttempts = 20;
      const delay = 3000;

      while (attempts < maxAttempts) {
        generatedShorts = await getShortsByVideo(videoId);
        console.log("Attempt", attempts, "shorts:", generatedShorts);
        if (generatedShorts.length === 3) break;

        attempts++;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }

      if (generatedShorts.length === 0) {
        addLog("Processing is taking longer than expected.", "warning");
        return;
      }

      addLog("Shorts generated successfully!", "success");

      setShorts(generatedShorts);
      navigate("/result");
    } catch (error) {
      console.error(error);
      addLog("Error processing video", "error");
    }
  };

  const handleBackToDashboard = () => {
    setSelectedFile(null);
    setLogs([]);
    setShorts([]);
    navigate("/");
  };

  return (
    <div className='container-fluid min-vh-100 bg-light-subtle font-sans transition-all duration-300'>
      <div className='row h-100'>
        <Sidebar
          language={language}
          setLanguage={setLanguage}
          theme={theme}
          toggleTheme={toggleTheme}
          t={t}
        />

        <main className='ms-md-auto col-md-9 col-lg-10 px-md-4 py-4 min-vh-100 position-relative'>
          <MobileHeader onProfileClick={() => navigate("/profile")} />

          <div className='container-xl p-2 p-md-4'>
            <Routes>
              <Route path='/login' element={<LoginView />} />
              <Route path='/register' element={<RegisterView />} />
              <Route
                path='/'
                element={
                  <Dashboard
                    onFileSelect={handleFileSelect}
                    recentProjects={MOCK_PROJECTS.slice(0, 3)}
                  />
                }
              />

              <Route
                path='/processing'
                element={
                  <ProcessingView
                    file={selectedFile}
                    onComplete={handleProcessingComplete}
                    addLog={addLog}
                    logs={logs}
                  />
                }
              />

              <Route
                path='/result'
                element={
                  <ResultView shorts={shorts} onBack={handleBackToDashboard} />
                }
              />

              <Route
                path='/projects'
                element={<ProjectsView projects={MOCK_PROJECTS} />}
              />

              <Route path='/help' element={<HelpView />} />
              <Route path='/profile' element={<ProfileView />} />

              <Route path='*' element={<Navigate to='/' />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </AppProvider>
  );
}
