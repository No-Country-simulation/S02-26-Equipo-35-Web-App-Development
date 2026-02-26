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


export const getVideoById = async (videoId) => {
  const token = getAuthToken();

  const response = await fetch(`${API_URL}/videos/${videoId}/`, {
    headers: {
      Authorization: `Token ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return await response.json();
};

export const updateVideoName = async (videoId, file_name) => {
  const token = getAuthToken();

  const formData = new FormData();
  formData.append("file_name", file_name);

  const response = await fetch(`${API_URL}/videos/${videoId}/`, {
    method: "PATCH",
    headers: {
      Authorization: `Token ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return await response.json();
};
export const deleteVideo = async (id) => {
  const token = getAuthToken();

  if (!token) {
    throw new Error("User not authenticated");
  }

  const response = await fetch(`${API_URL}/videos/${id}/`, {
    method: "DELETE",
    headers: {
      Authorization: `Token ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return true;
};
export const getVideoStatus = async (videoId) => {
  const token = getAuthToken();

  if (!token) {
    throw new Error("User not authenticated");
  }

  const response = await fetch(
    `${API_URL}/videos/${videoId}/status/`,
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

  return await response.json();
};
