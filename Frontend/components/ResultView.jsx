import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { VideoPlayer } from './result/VideoPlayer';
import { ShortsEditor } from './result/ShortsEditor';

export const ResultView = ({ shorts: initialShorts, onBack }) => {
  const [shorts, setShorts] = useState(initialShorts);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedShortId, setSelectedShortId] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const { t } = useApp();

  const handleTextChange = (id, newText) => {
    setShorts(prev => prev.map(s => s.shorts_id === id ? { ...s, text: newText } : s));
  };

  const handleExport = () => {
    setIsExporting(true);
    // Simulate export process
    setTimeout(() => {
      setIsExporting(false);
      alert("Video exported successfully! (Simulation)");
    }, 2000);
  };

  const handleShare = () => {
    alert("Link copied to clipboard! (Simulation)");
  };

  // Simulate video playback progress
  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        // Logic to update progress bar could go here
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="container-fluid p-0 animate-fade-in h-100 pb-5">
      <div className="row g-4 h-100">
        {/* Left: Video Player */}
        <div className="col-lg-7 d-flex flex-column h-100">
          <VideoPlayer
            isPlaying={isPlaying}
            onTogglePlay={() => setIsPlaying(!isPlaying)}
            shorts={shorts}
            t={t}
          />
        </div>

        {/* Right: Editor & Actions */}
        <div className="col-lg-5 d-flex flex-column h-100" style={{ maxHeight: 'calc(100vh - 120px)' }}>
          <ShortsEditor
            shorts={shorts}
            selectedShortId={selectedShortId}
            onSelectShort={setSelectedShortId}
            onTextChange={handleTextChange}
            onExport={handleExport}
            isExporting={isExporting}
            onBack={onBack}
            onShare={handleShare}
            t={t}
          />
        </div>
      </div>
    </div>
  );
};