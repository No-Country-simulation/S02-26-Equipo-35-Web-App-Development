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
import { useLocation } from "react-router-dom";
import { Sidebar } from "./components/layout/Sidebar";
import { MobileHeader } from "./components/layout/MobileHeader";
import { LoginView } from "./components/auth/LoginView";
import { RegisterView } from "./components/auth/RegisterView";
import { PrivateRoute } from "./components/auth/PrivateRoute";
import { useAuth } from "./contexts/AuthContext";
import { VideoShortsView } from "./components/VideoShortsView";

function AppContent() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [selectedFile, setSelectedFile] = useState(null);
  const [logs, setLogs] = useState([]);
  const [shorts, setShorts] = useState([]);
  const location = useLocation();
  const { theme, toggleTheme, language, setLanguage, t } = useApp();
  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/register";

  const isAuthenticated = !!token;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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
        {/* Sidebar mobile React-controlled */}
        {isAuthenticated && !isAuthPage && (
          <>
            {/* Desktop Sidebar */}
            <div className='d-none d-md-block col-md-3 col-lg-2 p-0'>
              <Sidebar
                language={language}
                setLanguage={setLanguage}
                theme={theme}
                toggleTheme={toggleTheme}
                t={t}
              />
            </div>

            {/* Mobile Sidebar */}
            <div className={`mobile-sidebar ${isSidebarOpen ? "open" : ""}`}>
              <Sidebar
                language={language}
                setLanguage={setLanguage}
                theme={theme}
                toggleTheme={toggleTheme}
                t={t}
              />
            </div>

            {/* Overlay */}
            {isSidebarOpen && (
              <div
                className='sidebar-overlay'
                onClick={() => setIsSidebarOpen(false)}
              />
            )}
          </>
        )}
        <main
          className={`
   ${isAuthenticated && !isAuthPage ? "col-12 col-md-9 col-lg-10 ms-md-auto" : "col-12"}
          px-md-4  min-vh-100 position-relative
        `}
        >
          {/* Mostrar MobileHeader solo cuando está autenticado */}
          {isAuthenticated && !isAuthPage && (
            <MobileHeader onMenuClick={() => setIsSidebarOpen(true)} />
          )}

          <div className='container-xl p-2 p-md-4'>
            <Routes>
              <Route
                path='/login'
                element={token ? <Navigate to='/' replace /> : <LoginView />}
              />
              <Route path='/register' element={<RegisterView />} />

              <Route
                path='/'
                element={
                  <PrivateRoute>
                    <Dashboard
                      onFileSelect={handleFileSelect}
                      recentProjects={MOCK_PROJECTS.slice(0, 3)}
                    />
                  </PrivateRoute>
                }
              />

              <Route
                path='/processing'
                element={
                  <PrivateRoute>
                    <ProcessingView
                      file={selectedFile}
                      onComplete={handleProcessingComplete}
                      addLog={addLog}
                      logs={logs}
                    />
                  </PrivateRoute>
                }
              />

              <Route
                path='/result'
                element={
                  <PrivateRoute>
                    <ResultView
                      shorts={shorts}
                      onBack={handleBackToDashboard}
                    />
                  </PrivateRoute>
                }
              />

              <Route
                path='/projects'
                element={
                  <PrivateRoute>
                    <ProjectsView projects={MOCK_PROJECTS} />
                  </PrivateRoute>
                }
              />

              <Route
                path='/profile'
                element={
                  <PrivateRoute>
                    <ProfileView />
                  </PrivateRoute>
                }
              />
              <Route
                path='/help'
                element={
                  <PrivateRoute>
                    <HelpView />
                  </PrivateRoute>
                }
              />
              <Route
                path='/projects/:videoId'
                element={
                  <PrivateRoute>
                    <VideoShortsView />
                  </PrivateRoute>
                }
              />

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
