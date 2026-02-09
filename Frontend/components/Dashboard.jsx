import React, { useCallback, useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { UploadArea } from './dashboard/UploadArea';
import { VideoConfig } from './dashboard/VideoConfig';
import { ProjectCard } from './common/ProjectCard';
import { Button } from './Button';

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
          <UploadArea
            isDragging={isDragging}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onSelectFile={onFileSelect}
            t={t}
          />
        </div>

        {/* Video Configuration */}
        <div className="col-lg-4">
          <VideoConfig t={t} />
        </div>
      </div>

      {/* Recent Projects */}
      <div className="mb-4">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <h2 className="h4 fw-bold text-base mb-0">{t('dashboard.recent')}</h2>
          <Button variant="link" size="sm" className="text-primary fw-bold text-decoration-none p-0">View All</Button>
        </div>
        <div className="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4">
          {recentProjects.map((project) => (
            <div key={project.video_id} className="col">
              <ProjectCard project={project} variant="row" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};