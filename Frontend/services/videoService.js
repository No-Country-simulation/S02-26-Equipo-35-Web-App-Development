export const uploadVideo = async (file) => {
  const token = '03a510b3be1e61a13752a6563606fa002d568775';

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


export const getVideos = async (page = 1) => {
  const token = '03a510b3be1e61a13752a6563606fa002d568775';
  const url = `http://localhost:8000/api/videos/?page=${page}`;

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Token ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${await response.text()}`);
    }

    const data = await response.json();
    return data.results ?? [];
  } catch (error) {
    console.error('Error fetching videos:', error.message);
    return [];
  }
};
