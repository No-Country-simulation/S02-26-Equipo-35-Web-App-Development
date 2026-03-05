import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getShortsByVideo } from "../services/shortService";
import { getVideoById, updateVideoName } from "../services/videoService";
import { ArrowLeft, Pencil, Check, X } from "lucide-react";
import { deleteShort } from "../services/shortService";
import { ConfirmModal } from "./common/ConfirmModal";
export const VideoShortsView = () => {
  const { videoId } = useParams();
  const navigate = useNavigate();

  const [shorts, setShorts] = useState([]);
  const [videoName, setVideoName] = useState("");
  const [editName, setEditName] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [shortToDelete, setShortToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteShort = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this short?",
    );

    if (!confirmDelete) return;

    try {
      await deleteShort(id);

      setShorts((prev) => prev.filter((s) => s.id !== id));
    } catch (error) {
      console.error(error);
      alert("Error deleting short");
    }
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [videoData, shortsData] = await Promise.all([
          getVideoById(videoId),
          getShortsByVideo(videoId),
        ]);

        setVideoName(videoData.file_name);
        setEditName(videoData.file_name);
        setShorts(shortsData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [videoId]);

  const handleSave = async () => {
    if (!editName.trim()) return;

    try {
      setSaving(true);
      const updated = await updateVideoName(videoId, editName);
      setVideoName(updated.file_name);
      setIsEditing(false);
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className='text-center py-5'>Loading...</div>;
  }

  return (
    <div className='container py-4'>
      {/* Back */}
      <button
        onClick={() => navigate("/")}
        className='btn btn-primary border d-flex align-items-center gap-2 mb-4 shadow-sm'
      >
        <ArrowLeft size={18} />
        Back to Dashboard
      </button>

      {/* 🎬 Video Name Editable */}
      <div className='d-flex align-items-center gap-3 mb-4'>
        {isEditing ? (
          <>
            <input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className='form-control'
              style={{ maxWidth: "400px" }}
            />

            <button
              onClick={handleSave}
              className='btn btn-primary btn-sm'
              disabled={saving}
            >
              <Check size={16} />
            </button>

            <button
              onClick={() => {
                setEditName(videoName);
                setIsEditing(false);
              }}
              className='btn btn-secondary btn-sm'
            >
              <X size={16} />
            </button>
          </>
        ) : (
          <>
            <h2 className='fw-bold mb-0'>{videoName}</h2>

            <button
              onClick={() => setIsEditing(true)}
              className='btn btn-primary btn-sm d-flex align-items-center gap-2 '
            >
              <Pencil size={16} />
              Edit
            </button>
          </>
        )}
      </div>

      {/* Shorts */}
      <div className='row g-4'>
        {shorts.map((short) => (
          <div key={short.id} className='col-md-4'>
            <div className='card shadow-sm border-0 h-100'>
              <button
                className='btn btn-danger btn-sm position-absolute top-0 end-0 m-2 z-3'
                onClick={() => {
                  setShortToDelete(short);
                  setShowDeleteModal(true);
                }}
              >
                Delete
              </button>
              <div className='ratio' style={{ aspectRatio: "9 / 16" }}>
                <video
                  src={short.file_url}
                  controls
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    backgroundColor: "black",
                  }}
                />
              </div>
              <div className='card-body'>
                <p className='small text-muted mb-1'>
                  Start: {short.start_second}s
                </p>
                <p className='small text-muted'>End: {short.end_second}s</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <ConfirmModal
        show={showDeleteModal}
        title='Delete Short'
        confirmText='Yes, Delete Short'
        loading={deleting}
        onCancel={() => {
          setShowDeleteModal(false);
          setShortToDelete(null);
        }}
        onConfirm={async () => {
          try {
            setDeleting(true);
            await deleteShort(shortToDelete.id);

            setShorts((prev) => prev.filter((s) => s.id !== shortToDelete.id));

            setShowDeleteModal(false);
            setShortToDelete(null);
          } finally {
            setDeleting(false);
          }
        }}
        message={
          <>
            <p>Are you sure you want to delete this short?</p>

            <p className='mt-3 mb-2 fw-semibold text-danger'>
              This will permanently delete:
            </p>

            <ul className='ps-3'>
              <li>The short video file</li>
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
