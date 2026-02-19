const API_URL = "http://localhost:8000/api/auth";

export const loginRequest = async (username, password) => {
  const formData = new FormData();
  formData.append("username", username);
  formData.append("password", password);

  const response = await fetch(`${API_URL}/login/`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Invalid credentials");
  }

  return await response.json();
};

export const logoutRequest = async (token) => {
  const response = await fetch(`${API_URL}/logout/`, {
    method: "POST",
    headers: {
      Authorization: `Token ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Logout failed");
  }

  return await response.json();
};


