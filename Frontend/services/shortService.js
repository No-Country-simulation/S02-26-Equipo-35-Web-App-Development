export const getShortsByVideo = async (videoId, page = 1) => {
  const token = 'a930231548cd62f2de6b6d0fcc2cd10205be265d';

  const response = await fetch(
    `http://localhost:8000/api/shorts/by_video/?video_id=${videoId}&page=${page}`,
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

  // 👇 DEVOLVEMOS SOLO EL ARRAY
  return data.shorts ?? [];
};
