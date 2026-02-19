import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getShortsByVideo } from "../services/shortService";
import { getVideoById, updateVideoName } from "../services/videoService";
import { ArrowLeft, Pencil, Check, X } from "lucide-react";

export const VideoShortsView = () => {
  const { videoId } = useParams();
  const navigate = useNavigate();

  const [shorts, setShorts] = useState([]);
  const [videoName, setVideoName] = useState("");
  const [editName, setEditName] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
              <video
                src={short.file_url}
                controls
                className='card-img-top rounded'
                style={{ height: "400px", objectFit: "cover" }}
              />
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
    </div>
  );
};
