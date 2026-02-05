import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { Download, Share2, Play, Pause, Settings, RotateCcw } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

export const ResultView = ({ captions: initialCaptions, onBack }) => {
  const [captions, setCaptions] = useState(initialCaptions);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedCaptionId, setSelectedCaptionId] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const { t } = useApp();

  const handleTextChange = (id, newText) => {
    setCaptions(prev => prev.map(c => c.id === id ? { ...c, text: newText } : c));
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
          <div className="card border-0 shadow-sm rounded-5 flex-grow-1 bg-surface d-flex align-items-center justify-content-center p-4 position-relative overflow-hidden border-base bg-glass">
            <div className="position-relative bg-black rounded-5 shadow-2xl overflow-hidden group" style={{ aspectRatio: '9/16', maxHeight: '100%', width: 'auto', border: '8px solid #222' }}>
              {/* Placeholder Video Background */}
              <img
                src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1000&auto=format&fit=crop"
                alt="Vertical Result"
                className={`w-100 h-100 object-fit-cover transition-all duration-700 ${isPlaying ? 'opacity-100 scale-100' : 'opacity-60 scale-105'}`}
              />

              {/* Overlay Captions Simulation */}
              <div className="position-absolute bottom-0 start-0 end-0 mb-5 pb-5 px-4 text-center">
                {captions.slice(0, 1).map(c => (
                  <div key={c.id} className="d-inline-block bg-dark bg-opacity-80 backdrop-blur-md px-4 py-3 rounded-4 text-white fw-bold h5 shadow-lg border border-white border-opacity-20 animate-slide-up">
                    {c.text}
                  </div>
                ))}
              </div>

              {/* Controls Overlay */}
              <div className={`position-absolute inset-0 d-flex align-items-center justify-content-center bg-dark bg-opacity-30 transition-all duration-500 ${isPlaying ? 'opacity-0 scale-110 pointer-events-none' : 'opacity-100 scale-100'}`}>
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="btn btn-white btn-lg rounded-circle shadow-2xl p-4 d-flex align-items-center justify-content-center transition-all hover-scale"
                >
                  {isPlaying ? <Pause className="w-8 h-8 text-dark" /> : <Play className="w-8 h-8 text-dark ms-1" fill="currentColor" />}
                </button>
              </div>
            </div>

            {/* Player Controls Bar */}
            <div className="position-absolute bottom-0 start-0 end-0 m-4 p-3 rounded-pill bg-white bg-opacity-90 backdrop-blur shadow-lg border border-white d-flex align-items-center gap-3">
              <span className="small text-muted font-monospace fw-bold ps-2">00:02</span>
              <div className="progress flex-grow-1 rounded-pill bg-secondary bg-opacity-10" style={{ height: '6px' }}>
                <div
                  className={`progress-bar bg-primary bg-gradient rounded-pill shadow-sm`}
                  style={{
                    width: isPlaying ? '100%' : '25%',
                    transition: isPlaying ? 'width 15s linear' : 'width 0.5s ease-out'
                  }}
                ></div>
              </div>
              <span className="small text-muted font-monospace fw-bold pe-2">00:15</span>
              <div className="vr mx-1 opacity-10"></div>
              <button className="btn btn-link text-dark p-1 border-0 rounded-circle hover-bg-light" onClick={() => setIsPlaying(!isPlaying)}>
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" fill="currentColor" />}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Editor & Actions */}
        <div className="col-lg-5 d-flex flex-column h-100" style={{ maxHeight: 'calc(100vh - 120px)' }}>
          <div className="card h-100 border-0 shadow-lg rounded-5 overflow-hidden d-flex flex-column bg-card border-base">

            {/* Editor Header */}
            <div className="card-header bg-transparent border-bottom border-base p-4 pt-xl-5 d-flex justify-content-between align-items-center">
              <div>
                <h5 className="fw-bold text-base mb-1 tracking-tight">{t('result.editorTitle')}</h5>
                <p className="small text-muted mb-0 fw-medium">{t('result.editorSubtitle')}</p>
              </div>
              <Button variant="outline" size="sm" className="rounded-pill" icon={<Settings className="w-4 h-4" />}>
                {t('result.styles')}
              </Button>
            </div>

            {/* Captions List */}
            <div className="card-body p-4 p-xl-5 overflow-auto flex-grow-1 custom-scrollbar">
              <div className="d-flex flex-column gap-3">
                {captions.map((caption) => (
                  <div
                    key={caption.id}
                    className={`p-4 rounded-5 border-2 transition-all cursor-pointer ${selectedCaptionId === caption.id
                      ? 'bg-primary bg-opacity-5 border-primary shadow-sm'
                      : 'bg-light bg-opacity-50 border-transparent hover-border-light shadow-none'
                      }`}
                    onClick={() => setSelectedCaptionId(caption.id)}
                  >
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <span className="badge rounded-pill bg-surface text-primary border border-base shadow-sm font-monospace px-3 py-2" style={{ fontSize: '0.65rem' }}>
                        {caption.start} → {caption.end}
                      </span>
                    </div>
                    <textarea
                      className="form-control form-control-sm border-0 bg-transparent p-0 shadow-none text-base fw-bold"
                      value={caption.text}
                      onChange={(e) => handleTextChange(caption.id, e.target.value)}
                      rows={2}
                      style={{ resize: 'none', fontSize: '0.95rem', letterSpacing: '-0.01rem' }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Action Footer */}
            <div className="card-footer bg-transparent border-top border-base p-4 pt-3 pt-xl-4 pb-4 pb-xl-5">
              <Button
                className="w-100 py-3 rounded-pill shadow-lg mb-3"
                size="md"
                variant="primary"
                icon={!isExporting ? <Download className="w-5 h-5" /> : undefined}
                onClick={handleExport}
                isLoading={isExporting}
              >
                {isExporting ? t('result.export') + '...' : t('result.export')}
              </Button>
              <div className="row g-2">
                <div className="col-6">
                  <Button variant="outline" className="w-100 rounded-pill py-2.5" onClick={onBack} icon={<RotateCcw className="w-4 h-4" />}>
                    {t('result.processNew')}
                  </Button>
                </div>
                <div className="col-6">
                  <Button variant="secondary" className="w-100 rounded-pill py-2.5" icon={<Share2 className="w-4 h-4" />} onClick={handleShare}>
                    {t('result.share')}
                  </Button>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};