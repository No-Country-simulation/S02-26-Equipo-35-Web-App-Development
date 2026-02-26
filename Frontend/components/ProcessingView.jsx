import React, { useEffect, useState, useRef } from "react";
import { Cpu } from "lucide-react";
import { useApp } from "../contexts/AppContext";
import { translations } from "../utils/translations";
import { LogTerminal } from "./processing/LogTerminal";
import { VisualPreview } from "./processing/VisualPreview";
import { getVideoStatus } from "../services/videoService";
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
      {
        p: 10,
        msg: stagesText[0].replace("{filename}", file?.name || "video"),
        delay: 500,
        status: "running",
      },
      { p: 25, msg: stagesText[1], delay: 2000, status: "running" },
      { p: 40, msg: stagesText[2], delay: 4000, status: "running" },
      { p: 55, msg: stagesText[3], delay: 6000, status: "running" },
      { p: 70, msg: stagesText[4], delay: 8000, status: "running" },
      { p: 85, msg: stagesText[5], delay: 10000, status: "running" },
      { p: 95, msg: stagesText[6], delay: 12000, status: "running" },
      { p: 100, msg: stagesText[7], delay: 13500, status: "completed" },
    ];

    let currentStage = 0;

    const runSimulation = () => {
      if (!isMounted) return;

      if (currentStage >= stages.length) {
        timeoutId = setTimeout(onComplete, 1000);
        return;
      }

      const stage = stages[currentStage];
      const delay =
        stage.delay - (currentStage > 0 ? stages[currentStage - 1].delay : 0);

      timeoutId = setTimeout(() => {
        if (!isMounted) return;
        setProgress(stage.p);
        addLog(stage.msg, stage.status === "completed" ? "success" : "info");
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
    <div
      className='container py-5 animate-fade-in'
      style={{ maxWidth: "900px" }}
    >
      <div className='text-center mb-5'>
        <div className='position-relative d-inline-block mb-4'>
          <div className='position-absolute inset-0 bg-primary bg-opacity-10 rounded-circle animate-ping'></div>
          <div
            className='position-relative bg-card shadow-lg rounded-circle d-flex align-items-center justify-content-center border border-primary border-opacity-10'
            style={{ width: "80px", height: "80px" }}
          >
            <Cpu className='w-10 h-10 text-primary animate-pulse' />
          </div>
        </div>
        <h2 className='h3 fw-bold text-base'>{t("processing.title")}</h2>
        <p className='text-muted'>{t("processing.subtitle")}</p>
      </div>

      {/* Progress Bar */}
      <div
        className='progress rounded-pill mb-5 border border-base shadow-sm bg-secondary bg-opacity-10 overflow-hidden'
        style={{ height: "20px" }}
      >
        <div
          className='progress-bar progress-bar-striped progress-bar-animated bg-primary bg-gradient shadow-sm transition-all'
          role='progressbar'
          style={{ width: `${progress}%`, transition: "width 0.5s ease" }}
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <span className='small fw-bold'>{progress}%</span>
        </div>
      </div>

      <div className='row g-4 mb-5'>
        {/* Visual Preview */}
        <div className='col-md-6'>
          <VisualPreview t={t} />
        </div>

        {/* Logs Terminal */}
        <div className='col-md-6'>
          <LogTerminal logs={logs} logContainerRef={logContainerRef} t={t} />
        </div>
      </div>
    </div>
  );
};
