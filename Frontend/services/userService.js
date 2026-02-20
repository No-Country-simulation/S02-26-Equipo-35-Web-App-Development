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

};

export const updateProfileImage = async (token, imageFile) => {
  const formData = new FormData();
  formData.append("profile_image", imageFile);

  const response = await fetch(`${API_URL}/auth/update_image/`, {
    method: "PATCH",
    headers: {
      Authorization: `Token ${token}`,
    },
    body: formData,
  });
  
  const data = await response.json();
  console.log("Server response: ", data);

  if (!response.ok) {
    throw new Error("Error updating profile image");
  }

  return data;
};

export const deleteProfileImage = async (token) => {
  const response = await fetch(`${API_URL}/auth/delete_image/`, {
    method: "DELETE",
    headers: {
      Authorization: `Token ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Error deleting profile image");
  }

  return await response.json();
};