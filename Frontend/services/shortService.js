export const getShortsByVideo = async (videoId, page = 1) => {
  const token = 'c51cf9d114e7046a7d0986f1665235b3b8f49697';

  const response = await fetch(
    `https://s02-26-equipo-35-web-app-development.onrender.com/api/shorts/by_video/?video_id=${videoId}&page=${page}`,
    {
      headers: {
        Authorization: `Token ${token}`,
      },
    }
  );

  if (!response.ok) {
    const text = await response.text();
    console.error("Shorts fetch error:", text);
    throw new Error(text);
  }

  return await response.json();
};
