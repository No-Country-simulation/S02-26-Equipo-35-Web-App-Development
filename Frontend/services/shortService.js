export const getShortsByVideo = async (videoId, page = 1) => {
  const token = '03a510b3be1e61a13752a6563606fa002d568775';
  console.log(videoId);

  const response = await fetch(
    `http://localhost:8000/api/shorts/by_video/?video_id=${videoId}&page=${page}`,
    {
      headers: {
        Authorization: `Token ${token}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error(await response.text());
  }

  const data = await response.json();

  // 👇 DEVOLVEMOS SOLO EL ARRAYy
  return data.shorts ?? [];
};

export const getShorts = async (videoId, page = 1) => {
  const token = '03a510b3be1e61a13752a6563606fa002d568775';
  console.log(videoId);

  const response = await fetch(
    `http://localhost:8000/api/shorts/?page=${page}`,
    {
      headers: {
        Authorization: `Token ${token}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error(await response.text());
  }

  const data = await response.json();
  console.log('DATA BACKEND:', data);
  // 👇 DEVOLVEMOS SOLO EL ARRAYy
  return data.results ?? [];
};
