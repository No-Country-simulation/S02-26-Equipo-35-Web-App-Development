import React, { useCallback, useEffect, useState } from "react";
import { useApp } from "../contexts/AppContext";
import { UploadArea } from "./dashboard/UploadArea";
import { VideoConfig } from "./dashboard/VideoConfig";
import { ProjectCard } from "./common/ProjectCard";
import { Button } from "./Button";
import { getVideos } from "../services/videoService";
import { useNavigate } from "react-router-dom";
export const Dashboard = ({ onFileSelect, recentProjects }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [recentVideos, setRecentVideos] = useState([]);
  const { t } = useApp();
  const navigate = useNavigate();
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const file = e.dataTransfer.files[0];
        if (file.type.startsWith("video/")) {
          onFileSelect(file);
        } else {
          alert(t("dashboard.fileError"));
        }
      }
    },
    [onFileSelect, t],
  );

  useEffect(() => {
    const fetchRecentVideos = async () => {
      const videos = await getVideos();
      setRecentVideos(videos);
    };
    fetchRecentVideos();
  }, []);

  return (
    <div className='container-fluid p-0 animate-fade-in'>
      {/* Header Section */}
      <div className='mb-4'>
        <h1 className='display-5 fw-bold text-dark text-gradient mb-1'>
          {t("dashboard.title")}
        </h1>
        <p className='text-muted small'>{t("dashboard.subtitle")}</p>
      </div>

      <div className='row g-4 mb-5'>
        {/* Upload Area */}
        <div className='col-lg-12'>
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
        {/* <div className='col-lg-4'>
          <VideoConfig t={t} />
        </div> */}
      </div>

      {/* Recent Projects */}
      <div className='mb-4'>
        <div className='d-flex align-items-center justify-content-between mb-4'>
          <h2 className='h4 fw-bold text-base mb-0'>{t("dashboard.recent")}</h2>
          <Button
            variant='link'
            size='sm'
            className='text-primary fw-bold text-decoration-none p-0'
          >
            View All
          </Button>
        </div>
        <div className='row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4'>
          {recentVideos.map((video) => (
            <div
              key={video.id}
              className='col'
              style={{ cursor: "pointer" }}
              onClick={() =>
                navigate(`/projects/${video.id}`, {
                  state: { videoName: video.file_name },
                })
              }
            >
              <ProjectCard
                project={{
                  id: video.id,
                  file_name: video.file_name,
                  cover_original_url: video.cover_original_url,
                  file_url: video.file_url,
                  status: video.status,
                  create_at: new Date(video.created_at).toLocaleString(),
                }}
                variant='row'
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
