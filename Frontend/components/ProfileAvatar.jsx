import { useState, useRef } from "react";
import { updateProfileImage, deleteProfileImage } from "../services/userService";
import { toast } from "react-toastify";
import 'react-toastify/ReactToastify.css';

export const ProfileAvatar = ({ profile, setProfile, token }) => {
    
    const [hovering, setHovering] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const allowedTypes = ["image/png", "image/jpeg"];
        if (!allowedTypes.includes(file.type)) {
            toast.error("Solo se permiten imágenes PNG o JPG");
            e.target.value = null;
            return;
        }

        const maxSize = 2 * 1024 * 1024; // 2MB
        if (file.size > maxSize) {
            toast.error("La imagen no puede superar los 2MB");
            e.target.value = null;
            return;
        }

        try {
          setUploading(true);

          const response = await updateProfileImage(token, file);

          setProfile((prev) => ({
            ...prev,
            profile_image: response.profile_image,
          }));
          
          toast.success('Imagen actualizada con éxito');

        } catch (error) {
          console.error(error);
        } finally {
          setUploading(false);
          e.target.value = null;
        }
    };

    const handleDeleteImage = async () => {
        try {
          await deleteProfileImage(token);

          setProfile((prev) => ({
            ...prev,
            profile_image: null,
          }));
        } catch (error) {
          console.error(error);
        }
    };

    return (
        <div
            className="position-relative"
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
        >
            <div
                className="rounded-circle bg-primary bg-gradient d-flex align-items-center justify-content-center text-white shadow fw-bold border border-4 border-card"
                style={{
                    width: "110px",
                    height: "110px",
                    fontSize: "2.5rem",
                    overflow: "hidden",
                    cursor: uploading ? "not-allowed" : "pointer",
                    opacity: uploading ? 0.7 : 1,
                    transition: "opacity 0.2s ease",
                }}
                onClick={() => !uploading && fileInputRef.current?.click()}
            >
                {uploading ? (
                    <div className="d-flex align-items-center justify-content-center w-100 h-100">
                      <div className="spinner-border text-light" role="status" />
                    </div>
                ) : profile.profile_image ? (
                  <img
                    src={profile.profile_image}
                    alt="profile"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  profile.username?.charAt(0).toUpperCase()
                )}
            </div>

            {profile.profile_image && hovering && (
                <div
                  className="position-absolute top-0 end-0 bg-danger text-white rounded-circle d-flex align-items-center justify-content-center shadow"
                  style={{
                    width: "32px",
                    height: "32px",
                    cursor: "pointer",
                  }}
                  onClick={handleDeleteImage}
                >
                  🗑
                </div>
            )}

            <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleImageUpload}
            />
        </div>
    );

};