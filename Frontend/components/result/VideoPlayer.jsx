import React, { useRef, useEffect } from "react";
import { Play, Pause } from "lucide-react";

export const VideoPlayer = ({ isPlaying, onTogglePlay, shorts, t }) => {
  const videoRef = useRef(null);

  const currentShort = shorts && shorts.length > 0 ? shorts[0] : null;

  // Control play / pause real del video
  useEffect(() => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
    }
  }, [isPlaying]);

  return (
    <div className='card border-0 shadow-sm rounded-5 flex-grow-1 bg-surface d-flex align-items-center justify-content-center p-4 position-relative overflow-hidden border-base bg-glass'>
      <div
        className='position-relative bg-black rounded-5 shadow-2xl overflow-hidden group'
        style={{
          aspectRatio: "9/16",
          maxHeight: "100%",
          width: "auto",
          border: "8px solid #222",
        }}
      >
        {/* 🎥 Video real */}
        {currentShort ? (
          <video
            ref={videoRef}
            src={currentShort.file_url}
            poster={currentShort.cover_url}
            className='w-100 h-100 object-fit-cover'
            loop
            muted
            playsInline
          />
        ) : (
          <div className='w-100 h-100 d-flex align-items-center justify-content-center text-white'>
            <span>No short available</span>
          </div>
        )}

        {/* 🏷 Info overlay */}
        {currentShort && (
          <div className='position-absolute bottom-0 start-0 end-0 mb-5 pb-5 px-4 text-center'>
            <div className='d-inline-flex flex-column align-items-center mb-3'>
              <div className='d-inline-block bg-dark bg-opacity-80 px-4 py-3 rounded-4 text-white fw-bold h6 shadow-lg border border-white border-opacity-20'>
                {currentShort.video_title}
              </div>

              {currentShort.status === "ready" && (
                <span
                  className='badge rounded-pill bg-success mt-2 shadow-sm'
                  style={{ fontSize: "0.65rem" }}
                >
                  READY
                </span>
              )}

              <span className='small text-white mt-2'>
                {currentShort.start_second.toFixed(1)}s -{" "}
                {currentShort.end_second.toFixed(1)}s
              </span>
            </div>
          </div>
        )}

        {/* ▶ Play overlay */}
        {!isPlaying && currentShort && (
          <div className='position-absolute inset-0 d-flex align-items-center justify-content-center bg-dark bg-opacity-30'>
            <button
              onClick={onTogglePlay}
              className='btn btn-white btn-lg rounded-circle shadow p-4 d-flex align-items-center justify-content-center'
            >
              <Play className='w-8 h-8 text-dark ms-1' fill='currentColor' />
            </button>
          </div>
        )}
      </div>

      {/* 🎚 Controls bar */}
      {currentShort && (
        <div className='position-absolute bottom-0 start-0 end-0 m-4 p-3 rounded-pill bg-white bg-opacity-90 shadow-lg d-flex align-items-center gap-3'>
          <span className='small text-muted font-monospace fw-bold ps-2'>
            {currentShort.duration_seconds.toFixed(1)}s
          </span>

          <div
            className='progress flex-grow-1 rounded-pill bg-secondary bg-opacity-10'
            style={{ height: "6px" }}
          >
            <div
              className='progress-bar bg-primary rounded-pill'
              style={{
                width: isPlaying ? "100%" : "0%",
                transition: isPlaying
                  ? `${currentShort.duration_seconds}s linear`
                  : "width 0.3s ease-out",
              }}
            ></div>
          </div>

          <button
            className='btn btn-link text-dark p-1 border-0 rounded-circle'
            onClick={onTogglePlay}
          >
            {isPlaying ? (
              <Pause className='w-4 h-4' />
            ) : (
              <Play className='w-4 h-4' fill='currentColor' />
            )}
          </button>
        </div>
      )}
    </div>
  );
};
