const API_URL = import.meta.env.VITE_API_URL;
console.log(import.meta.env.VITE_API_URL);
console.log(import.meta.env);
export const loginRequest = async (username, password) => {
  const formData = new FormData();
  formData.append('username', username);
  formData.append('password', password);

  const response = await fetch(`${API_URL}/auth/login/`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Invalid credentials');
  }

  return await response.json();
};

export const registerRequest = async ({
  username,
  email,
  password,
  password2,
  first_name,
  last_name,
}) => {
  const formData = new FormData();
  formData.append('username', username);
  formData.append('email', email);
  formData.append('password', password);
  formData.append('password2', password2);
  formData.append('first_name', first_name);
  formData.append('last_name', last_name);

  const response = await fetch(`${API_URL}/auth/register/`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(JSON.stringify(error));
  }

  return await response.json();
};

export const logoutRequest = async (token) => {
  const response = await fetch(`${API_URL}/auth/logout/`, {
    method: 'POST',
    headers: {
      Authorization: `Token ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Logout failed');
  }

  return await response.json();
};
