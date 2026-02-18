import React from 'react';
import { Clock, CheckCircle2, AlertCircle, Play, Film } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

export const ShortCard = ({ short }) => {
  const { t } = useApp();

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ready':
        return <CheckCircle2 size={14} className="text-success" />;
      case 'processing':
        return <Clock size={14} className="text-warning" />;
      case 'failed':
        return <AlertCircle size={14} className="text-danger" />;
      default:
        return null;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden bg-card border-base">
      {/* VIDEO AREA */}
      <div
        className="position-relative bg-dark"
        style={{ aspectRatio: '9/16' }}
      >
        <video
          src={short.file_url}
          poster={short.cover_url}
          className="w-100 h-100 object-fit-cover"
          controls
        />

        {/* STATUS BADGE */}
        <span
          className={`position-absolute top-0 end-0 m-3 badge rounded-pill px-3 py-2 fw-bold text-uppercase ${
            short.status === 'ready'
              ? 'bg-success'
              : short.status === 'processing'
                ? 'bg-warning text-dark'
                : 'bg-danger'
          }`}
          style={{ fontSize: '0.65rem', letterSpacing: '0.05rem' }}
        >
          {short.status}
        </span>
      </div>

      {/* BODY */}
      <div className="card-body p-3">
        {/* TITLE */}
        <h6 className="fw-bold mb-2 text-truncate">{short.video_title}</h6>

        {/* META INFO */}
        <div className="d-flex justify-content-between align-items-center small text-muted mb-2">
          <div className="d-flex align-items-center gap-1">
            <Film size={14} />
            <span>ID: {short.id}</span>
          </div>

          <div className="d-flex align-items-center gap-1">
            {getStatusIcon(short.status)}
          </div>
        </div>

        {/* TIME INFO */}
        <div className="small text-muted mb-2">
          <div>
            ⏱ Duration: <strong>{short.duration_seconds}s</strong>
          </div>
          <div>
            🎬 Range: {short.start_second}s - {short.end_second}s
          </div>
        </div>

        {/* DATE */}
        <div className="d-flex align-items-center small text-muted pt-2 border-top">
          <Clock size={14} className="me-2" />
          {formatDate(short.created_at)}
        </div>
      </div>
    </div>
  );
};
