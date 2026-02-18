const API_URL = "http://localhost:8000/api";

const getAuthToken = () => {
  return localStorage.getItem("token");
};

export const uploadVideo = async (file) => {
  const token = getAuthToken();

  if (!token) {
    throw new Error("User not authenticated");
  }

  const formData = new FormData();
  formData.append("file_name", file.name);
  formData.append("video_file", file);

  const response = await fetch(`${API_URL}/videos/`, {
    method: "POST",
    headers: {
      Authorization: `Token ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Backend error:", errorData);
    throw new Error(JSON.stringify(errorData));
  }

  return await response.json();
};

export const getVideos = async (page = 1) => {
  const token = getAuthToken();

  if (!token) {
    throw new Error("User not authenticated");
  }

  const response = await fetch(
    `${API_URL}/videos/?page=${page}`,
    {
      headers: {
        Authorization: `Token ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      `Error ${response.status}: ${await response.text()}`
    );
  }

  const data = await response.json();
  return data.results ?? [];
};
