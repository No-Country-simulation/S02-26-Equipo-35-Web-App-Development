import React, { useRef, useState, useEffect } from "react";
import { Play, Pause } from "lucide-react";

export const ShortVideo = ({ short }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!videoRef.current) return;

    if (isPlaying) videoRef.current.play().catch(() => {});
    else videoRef.current.pause();
  }, [isPlaying]);

  return (
    <div
      className='position-relative bg-black rounded-5 shadow-2xl overflow-hidden mb-4'
      style={{
        width: "250px",
        aspectRatio: "9/16",
        border: "6px solid #222",
      }}
    >
      {/* Video */}
      <video
        ref={videoRef}
        src={short.file_url}
        poster={short.cover_url}
        className='w-100 h-100 object-fit-cover'
        loop
        muted
        playsInline
      />

      {/* Info overlay arriba */}
      <div className='position-absolute top-0 start-0 end-0 p-3 text-center'>
        <div className='d-inline-block bg-dark bg-opacity-75 px-3 py-2 rounded-4 text-white small fw-bold shadow-sm'>
          {short.video_title}
        </div>

        {short.status === "ready" && (
          <span
            className='badge rounded-pill bg-success mt-2 shadow-sm'
            style={{ fontSize: "0.65rem" }}
          >
            READY
          </span>
        )}

        <div className='small text-white mt-1'>
          {Number(short.start_second).toFixed(1)}s -{" "}
          {Number(short.end_second).toFixed(1)}s
        </div>
      </div>

      {/* Play overlay */}
      {!isPlaying && (
        <div className='position-absolute inset-0 d-flex align-items-center justify-content-center bg-dark bg-opacity-30'>
          <button
            onClick={() => setIsPlaying(true)}
            className='btn btn-white btn-lg rounded-circle shadow p-4 d-flex align-items-center justify-content-center'
          >
            <Play className='w-6 h-6 text-dark' />
          </button>
        </div>
      )}

      {/* Barra de progreso */}
      <div className='position-absolute bottom-0 start-0 end-0 m-3 p-2 rounded-pill bg-white bg-opacity-90 shadow d-flex align-items-center gap-2'>
        <span className='small text-muted font-monospace fw-bold'>
          {short.duration_seconds.toFixed(1)}s
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
                ? `${short.duration_seconds}s linear`
                : "width 0.3s ease-out",
            }}
          ></div>
        </div>
        <button
          className='btn btn-link text-dark p-1 border-0 rounded-circle'
          onClick={() => setIsPlaying(!isPlaying)}
        >
          {isPlaying ? (
            <Pause className='w-4 h-4' />
          ) : (
            <Play className='w-4 h-4' fill='currentColor' />
          )}
        </button>
      </div>
    </div>
  );
};
