export const uploadVideo = async (file) => {
  const formData = new FormData();
  formData.append("video", file);

  const response = await fetch("http://127.0.0.1:8000/api/videos/upload/", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Video upload failed");
  }

  return response.json();
};
