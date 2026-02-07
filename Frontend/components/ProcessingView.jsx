import React, { useEffect, useState, useRef } from 'react';
import { Terminal, Cpu, Check, Video } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { translations } from '../utils/translations';

export const ProcessingView = ({ file, onComplete, addLog, logs }) => {
  const [progress, setProgress] = useState(0);
  const logContainerRef = useRef(null);
  const { t, language } = useApp();

  // Auto-scroll logs
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  // Simulation Effect
  useEffect(() => {
    let timeoutId;
    let isMounted = true;

    // Get localized stages
    const stagesText = translations[language].processing.stages;

    const stages = [
      { p: 10, msg: stagesText[0].replace('{filename}', file?.name || 'video'), delay: 500, status: 'running' },
      { p: 25, msg: stagesText[1], delay: 2000, status: 'running' },
      { p: 40, msg: stagesText[2], delay: 4000, status: 'running' },
      { p: 55, msg: stagesText[3], delay: 6000, status: 'running' },
      { p: 70, msg: stagesText[4], delay: 8000, status: 'running' },
      { p: 85, msg: stagesText[5], delay: 10000, status: 'running' },
      { p: 95, msg: stagesText[6], delay: 12000, status: 'running' },
      { p: 100, msg: stagesText[7], delay: 13500, status: 'completed' },
    ];

    let currentStage = 0;

    const runSimulation = () => {
      if (!isMounted) return;

      if (currentStage >= stages.length) {
        timeoutId = setTimeout(onComplete, 1000);
        return;
      }

      const stage = stages[currentStage];
      const delay = stage.delay - (currentStage > 0 ? stages[currentStage - 1].delay : 0);

      timeoutId = setTimeout(() => {
        if (!isMounted) return;
        setProgress(stage.p);
        addLog(stage.msg, stage.status === 'completed' ? 'success' : 'info');
        currentStage++;
        runSimulation();
      }, delay);
    };

    runSimulation();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  return (
    <div className="container py-5 animate-fade-in" style={{ maxWidth: '900px' }}>
      <div className="text-center mb-5">
        <div className="position-relative d-inline-block mb-4">
          <div className="position-absolute inset-0 bg-primary bg-opacity-10 rounded-circle animate-ping"></div>
          <div className="position-relative bg-card shadow-lg rounded-circle d-flex align-items-center justify-content-center border border-primary border-opacity-10" style={{ width: '80px', height: '80px' }}>
            <Cpu className="w-10 h-10 text-primary animate-pulse" />
          </div>
        </div>
        <h2 className="h3 fw-bold text-base">{t('processing.title')}</h2>
        <p className="text-muted">{t('processing.subtitle')}</p>
      </div>

      {/* Progress Bar */}
      <div className="progress rounded-pill mb-5 border border-base shadow-sm bg-secondary bg-opacity-10 overflow-hidden" style={{ height: '20px' }}>
        <div
          className="progress-bar progress-bar-striped progress-bar-animated bg-primary bg-gradient shadow-sm transition-all"
          role="progressbar"
          style={{ width: `${progress}%`, transition: 'width 0.5s ease' }}
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <span className="small fw-bold">{progress}%</span>
        </div>
      </div>

      <div className="row g-4 mb-5">
        {/* Visual Preview (Mock) */}
        <div className="col-md-6">
          <div className="card h-100 border-0 shadow-sm rounded-5 overflow-hidden bg-surface position-relative" style={{ minHeight: '380px' }}>
            <div className="position-absolute inset-0 opacity-25" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')", backgroundSize: 'cover', backgroundPosition: 'center', filter: 'grayscale(100%)' }}></div>
            <div className="card-body d-flex flex-column align-items-center justify-content-center position-relative z-1">
              {/* Smart Crop Overlay Simulation */}
              <div className="position-relative bg-dark bg-opacity-75 border-primary border-4 shadow-lg rounded-4 overflow-hidden d-flex align-items-center justify-content-center" style={{ width: '130px', height: '230px' }}>
                <Video className="w-8 h-8 text-primary text-opacity-75" />
                <div className="position-absolute top-0 end-0 m-3 d-flex gap-1">
                  <div className="badge bg-danger rounded-circle p-1 animate-pulse" style={{ width: '8px', height: '8px' }}></div>
                </div>
                <div className="position-absolute bottom-0 start-0 w-100 bg-primary bg-opacity-20 py-1 text-center" style={{ fontSize: '0.6rem' }}>
                  <span className="text-white fw-bold tracking-widest">AI CROP</span>
                </div>
              </div>
              <p className="mt-4 small fw-bold text-primary d-flex align-items-center mb-0 bg-card px-3 py-1 rounded-pill shadow-sm border border-base">
                <Check className="w-4 h-4 me-2" /> {t('processing.cropActive')}
              </p>
            </div>
          </div>
        </div>

        {/* Logs Terminal */}
        <div className="col-md-6">
          <div className="card h-100 border-0 shadow-lg rounded-5 overflow-hidden bg-dark text-light font-monospace" style={{ minHeight: '380px' }}>
            <div className="card-header bg-secondary bg-opacity-10 border-bottom border-base d-flex align-items-center justify-content-between px-4 py-3">
              <div className="d-flex align-items-center small text-secondary">
                <Terminal className="w-4 h-4 me-2 text-primary" />
                <span className="fw-bold" style={{ fontSize: '0.75rem', letterSpacing: '0.05rem' }}>{t('processing.logs').toUpperCase()}</span>
              </div>
              <div className="d-flex gap-1">
                <div className="bg-danger rounded-circle shadow-sm" style={{ width: '12px', height: '12px', opacity: 0.8 }}></div>
                <div className="bg-warning rounded-circle shadow-sm" style={{ width: '12px', height: '12px', opacity: 0.8 }}></div>
                <div className="bg-success rounded-circle shadow-sm" style={{ width: '12px', height: '12px', opacity: 0.8 }}></div>
              </div>
            </div>
            <div
              ref={logContainerRef}
              className="card-body p-4 overflow-auto scrollbar-dark"
              style={{ fontSize: '0.75rem', lineHeight: '1.6', background: '#0a0a0c' }}
            >
              {logs.map((log) => (
                <div key={log.id} className="d-flex mb-3 animate-fade-in border-start border-primary border-opacity-10 ps-3">
                  <span className="text-secondary text-opacity-50 me-2" style={{ whiteSpace: 'nowrap', fontSize: '0.65rem' }}>{log.timestamp}</span>
                  <span className={`
                    ${log.type === 'info' ? 'text-white-50' : ''}
                    ${log.type === 'success' ? 'text-success fw-bold' : ''}
                    ${log.type === 'warning' ? 'text-warning' : ''}
                    ${log.type === 'error' ? 'text-danger' : ''}
                  `}>
                    {log.type === 'info' && '➜ '}
                    {log.type === 'success' && '✓ '}
                    {log.message}
                  </span>
                </div>
              ))}
              <div className="text-primary opacity-50 animate-pulse ps-3">█</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};