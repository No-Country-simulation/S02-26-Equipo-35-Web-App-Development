export const uploadVideo = async (file) => {
  const token = 'c51cf9d114e7046a7d0986f1665235b3b8f49697';

  const formData = new FormData();
  formData.append("file_name", file.name);
  formData.append("video_file", file);

  const response = await fetch(
    "https://s02-26-equipo-35-web-app-development.onrender.com/api/videos/",
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
