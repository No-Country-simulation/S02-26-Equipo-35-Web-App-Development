const API_URL = "http://localhost:8000/api";

const getAuthToken = () => {
  return localStorage.getItem("token");
};

export const getShortsByVideo = async (videoId, page = 1) => {
  const token = getAuthToken();

  if (!token) {
    throw new Error("User not authenticated");
  }

  const response = await fetch(
    `${API_URL}/shorts/by_video/?video_id=${videoId}&page=${page}`,
    {
      headers: {
        Authorization: `Token ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(await response.text());
  }

  const data = await response.json();
  return data.shorts ?? [];
};

export const getShorts = async (page = 1) => {
  const token = getAuthToken();

  if (!token) {
    throw new Error("User not authenticated");
  }

  const response = await fetch(
    `${API_URL}/shorts/?page=${page}`,
    {
      headers: {
        Authorization: `Token ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(await response.text());
  }

  const data = await response.json();
  return data.results ?? [];
};
