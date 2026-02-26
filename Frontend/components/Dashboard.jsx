import React, { useCallback, useEffect, useState } from "react";
import { useApp } from "../contexts/AppContext";
import { UploadArea } from "./dashboard/UploadArea";
import { VideoConfig } from "./dashboard/VideoConfig";
import { ProjectCard } from "./common/ProjectCard";
import { Button } from "./Button";
import { getVideos, deleteVideo } from "../services/videoService";
import { useNavigate } from "react-router-dom";
import { ConfirmModal } from "./common/ConfirmModal";
export const Dashboard = ({ onFileSelect, recentProjects }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [recentVideos, setRecentVideos] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
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

  const handleDeleteVideo = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this video and all its shorts?",
    );

    if (!confirmDelete) return;

    try {
      await deleteVideo(id);

      // 🔥 actualizar estado sin recargar
      setRecentVideos((prev) => prev.filter((v) => v.id !== id));
    } catch (error) {
      console.error(error);
      alert("Error deleting video");
    }
  };

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
            <div key={video.id} className='col'>
              <div className='position-relative'>
                {/* Delete Button */}
                <button
                  className='position-absolute top-0 end-0 m-3 z-3 border-0'
                  style={{
                    background: "rgba(220,53,69,0.85)",
                    backdropFilter: "blur(6px)",
                    borderRadius: "12px",
                    padding: "4px 8px",
                    fontSize: "0.75rem",
                    fontWeight: "600",
                    color: "white",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
                    transition: "all 0.2s ease",
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setVideoToDelete(video);
                    setShowDeleteModal(true);
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.05)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                >
                  Delete
                </button>

                <div
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
              </div>
            </div>
          ))}
        </div>
      </div>
      <ConfirmModal
        show={showDeleteModal}
        title='Delete Video'
        confirmText='Yes, Delete Everything'
        loading={deleting}
        onCancel={() => {
          setShowDeleteModal(false);
          setVideoToDelete(null);
        }}
        onConfirm={async () => {
          try {
            setDeleting(true);
            await deleteVideo(videoToDelete.id);

            setRecentVideos((prev) =>
              prev.filter((v) => v.id !== videoToDelete.id),
            );

            setShowDeleteModal(false);
            setVideoToDelete(null);
          } finally {
            setDeleting(false);
          }
        }}
        message={
          <>
            <p>
              Are you sure you want to delete{" "}
              <strong>"{videoToDelete?.file_name}"</strong>?
            </p>

            <p className='mt-3 mb-2 fw-semibold text-danger'>
              This will permanently delete:
            </p>

            <ul className='ps-3'>
              <li>The original video</li>
              <li>All generated shorts</li>
              <li>All associated Cloudinary resources</li>
            </ul>

            <p className='mt-3 small text-muted'>
              This action cannot be undone.
            </p>
          </>
        }
      />
    </div>
  );
};
