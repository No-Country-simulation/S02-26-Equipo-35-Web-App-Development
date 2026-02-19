const API_URL = "http://localhost:8000/api";

//obtener datos perfil
export const getProfile = async (token) => {
  const response = await fetch(`${API_URL}/auth/profile/`, {
    method: "GET",
    headers: {
      Authorization: `Token ${token}`,
    },
  });


  if (!response.ok) {
    throw new Error("Failed to fetch profile");
  }

  return await response.json();


}