import React, { useCallback, useState } from 'react';
import { UploadCloud, FileVideo, MoreHorizontal, Play, Clock, CheckCircle2, AlertCircle, Smartphone, Settings } from 'lucide-react';
import { Button } from './Button';
import { useApp } from '../contexts/AppContext';

export const Dashboard = ({ onFileSelect, recentProjects }) => {
  const [isDragging, setIsDragging] = useState(false);
  const { t } = useApp();

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('video/')) {
        onFileSelect(file);
      } else {
        alert(t('dashboard.fileError'));
      }
    }
  }, [onFileSelect, t]);

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ready': return <CheckCircle2 className="w-4 h-4 text-success" />;
      case 'processing': return <Clock className="w-4 h-4 text-warning" />;
      case 'failed': return <AlertCircle className="w-4 h-4 text-danger" />;
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      'ready': 'Completed',
      'processing': 'Processing',
      'failed': 'Failed'
    };
    return t(`dashboard.status.${statusMap[status] || status}`);
  };

  return (
    <div className="container-fluid p-0 animate-fade-in">
      {/* Header Section */}
      <div className="mb-4">
        <h1 className="display-5 fw-bold text-dark text-gradient mb-1">{t('dashboard.title')}</h1>
        <p className="text-muted small">{t('dashboard.subtitle')}</p>
      </div>

      <div className="row g-4 mb-5">
        {/* Upload Area */}
        <div className="col-lg-8">
          <div
            className={`card h-100 border-dashed border-2 rounded-5 transition-all overflow-hidden ${isDragging ? 'border-primary bg-primary bg-opacity-10 scale-102' : 'bg-card shadow-sm border-base'}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-upload')?.click()}
            style={{ cursor: 'pointer', minHeight: '320px' }}
          >
            <input
              id="file-upload"
              type="file"
              className="d-none"
              accept="video/*"
              onChange={handleFileInput}
            />

            <div className="card-body d-flex flex-column align-items-center justify-content-center text-center p-5">
              <div className="p-4 rounded-circle bg-primary bg-opacity-10 shadow-sm mb-4 animate-bounce-subtle">
                <UploadCloud className="w-10 h-10 text-primary" />
              </div>
              <h3 className="h5 fw-bold text-dark mb-2">{t('dashboard.dragText')}</h3>
              <p className="small text-muted mb-4 px-lg-5">{t('dashboard.formats')}</p>
              <Button variant="primary" size="lg" className="px-5 rounded-pill shadow-sm">
                {t('dashboard.selectBtn')}
              </Button>
            </div>
          </div>
        </div>

        {/* Video Configuration - Premium Integrated Design */}
        <div className="col-lg-4">
          <div className="card h-100 border-0 shadow-sm rounded-5 overflow-hidden bg-card">
            <div className="card-header bg-transparent border-0 pt-4 px-4 pb-0">
              <h5 className="fw-bold text-base d-flex align-items-center mb-0">
                <Smartphone className="w-5 h-5 me-2 text-primary" />
                {t('settings.videoDefaults')}
              </h5>
            </div>
            <div className="card-body p-4 d-flex flex-column">
              <div className="mb-4">
                <label className="form-label small fw-bold text-muted mb-2">{t('settings.aspectRatio')}</label>
                <div className="position-relative">
                  <select className="form-select border border-secondary-subtle bg-light rounded-4 py-2 ps-3 shadow-none">
                    <option>9:16 (TikTok, Reels, Shorts)</option>
                    <option>1:1 (Square)</option>
                    <option>4:5 (Instagram Feed)</option>
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label small fw-bold text-muted mb-2">{t('settings.quality')}</label>
                <div className="position-relative">
                  <select className="form-select border border-secondary-subtle bg-light rounded-4 py-2 ps-3 shadow-none">
                    <option>1080p HD (Recommended)</option>
                    <option>4K Ultra HD</option>
                    <option>720p Fast Render</option>
                  </select>
                </div>
              </div>

              <div className="mt-auto">
                <div className="p-3 rounded-4 bg-primary bg-opacity-10 border border-primary border-opacity-10 shadow-sm">
                  <p className="small text-primary fw-medium mb-0 d-flex align-items-start">
                    <Settings className="w-4 h-4 me-2 mt-1 flex-shrink-0" />
                    <span>These settings will be applied to your next upload for consistent branding.</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Projects - Premium Grid */}
      <div className="mb-4">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <h2 className="h4 fw-bold text-base mb-0">{t('dashboard.recent')}</h2>
          <Button variant="link" size="sm" className="text-primary fw-bold text-decoration-none p-0">View All</Button>
        </div>
        <div className="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4">
          {recentProjects.map((project) => (
            <div key={project.video_id} className="col">
              <div className="card h-100 border-0 shadow-sm rounded-5 overflow-hidden project-card transition-all hover-translate-y">
                <div className="card-body p-3">
                  <div className="d-flex align-items-center">
                    <div className="position-relative bg-secondary bg-opacity-10 rounded-4 overflow-hidden shadow-sm" style={{ width: '85px', height: '115px' }}>
                      <img src={project.file_url} alt={project.file_name} className="w-100 h-100 object-fit-cover opacity-90 transition-all" />
                      <div className="position-absolute inset-0 d-flex align-items-center justify-content-center bg-primary bg-opacity-25 opacity-0 project-play transition-all">
                        <div className="bg-white rounded-circle p-2 shadow-sm">
                          <Play className="w-4 h-4 text-primary" fill="currentColor" />
                        </div>
                      </div>
                    </div>
                    <div className="ms-3 flex-grow-1 overflow-hidden">
                      <div className="d-flex justify-content-between align-items-start mb-1">
                        <h6 className="text-dark fw-bold mb-0 text-truncate pe-2">{project.file_name}</h6>
                        <button className="btn btn-link text-muted p-0 border-0 flex-shrink-0">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="small text-muted mb-2 d-flex align-items-center">
                        <Clock className="w-3 h-3 me-1" />
                        {project.created_at}
                      </p>
                      <div className="d-flex align-items-center pt-2">
                        <div className={`p-1 rounded-circle me-2 d-flex align-items-center ${project.status === 'ready' ? 'bg-success bg-opacity-10 text-success' :
                          project.status === 'processing' ? 'bg-warning bg-opacity-10 text-warning' : 'bg-danger bg-opacity-10 text-danger'
                          }`}>
                          {getStatusIcon(project.status)}
                        </div>
                        <span className={`small fw-bold ${project.status === 'ready' ? 'text-success' :
                          project.status === 'processing' ? 'text-warning' : 'text-danger'
                          }`}>
                          {getStatusText(project.status)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};