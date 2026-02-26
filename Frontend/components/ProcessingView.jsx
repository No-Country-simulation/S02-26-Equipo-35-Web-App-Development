import React, { useEffect, useState } from "react";
import { Cpu } from "lucide-react";
import { useApp } from "../contexts/AppContext";
import { getVideoStatus } from "../services/videoService";

export const ProcessingView = ({ videoId, onComplete }) => {
  const [progress, setProgress] = useState(0);
  const { t } = useApp();

  useEffect(() => {
    if (!videoId) return;

    let interval;

    const checkStatus = async () => {
      try {
        const data = await getVideoStatus(videoId);

        setProgress(data.progress ?? 0);

        if (data.status === "ready") {
          clearInterval(interval);
          onComplete();
        }

        if (data.status === "failed") {
          clearInterval(interval);
          alert("Processing failed. Please try again.");
        }
      } catch (error) {
        console.error(error);
        clearInterval(interval);
      }
    };

    checkStatus();
    interval = setInterval(checkStatus, 2000);

    return () => clearInterval(interval);
  }, [videoId, onComplete]);

  return (
    <div
      className="container py-5 animate-fade-in"
      style={{ maxWidth: "700px" }}
    >
      <div className="text-center mb-5">
        <div className="position-relative d-inline-block mb-4">
          <div className="position-absolute inset-0 bg-primary bg-opacity-10 rounded-circle animate-ping"></div>
          <div
            className="position-relative bg-card shadow-lg rounded-circle d-flex align-items-center justify-content-center border border-primary border-opacity-10"
            style={{ width: "80px", height: "80px" }}
          >
            <Cpu className="w-10 h-10 text-primary animate-pulse" />
          </div>
        </div>

        <h2 className="h3 fw-bold text-base">
          {t("processing.title")}
        </h2>
        <p className="text-muted">
          {t("processing.subtitle")}
        </p>
      </div>

      {/* Progress Bar */}
      <div
        className="progress rounded-pill border shadow-sm bg-secondary bg-opacity-10 overflow-hidden"
        style={{ height: "22px" }}
      >
        <div
          className="progress-bar progress-bar-striped progress-bar-animated bg-primary bg-gradient"
          role="progressbar"
          style={{ width: `${progress}%`, transition: "width 0.4s ease" }}
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <span className="small fw-bold">{progress}%</span>
        </div>
      </div>
    </div>
  );
};
