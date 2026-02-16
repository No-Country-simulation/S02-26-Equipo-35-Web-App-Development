export const uploadVideo = async (file) => {
  const token = 'a930231548cd62f2de6b6d0fcc2cd10205be265d';

  const formData = new FormData();
  formData.append("file_name", file.name);
  formData.append("video_file", file);

  const response = await fetch(
    "http://localhost:8000/api/videos/",
    {
      method: "POST",
      headers: {
        Authorization: `Token ${token}`, // usa el token dinámico
      },
      body: formData,
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Backend error:", errorData);
    throw new Error(JSON.stringify(errorData));
  }

  return await response.json();
};
