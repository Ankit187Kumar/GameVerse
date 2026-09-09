const serverHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
const API_BASE = `http://${serverHost}:5000/api/users`;

export const registerUser = async (userData) => {
  try {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error || 'Failed to submit details');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

export const pollStatus = async (userId) => {
  try {
    const response = await fetch(`${API_BASE}/${userId}/status`);
    if (!response.ok) {
      throw new Error('Failed to fetch status');
    }
    return await response.json();
  } catch (error) {
    console.error('Error polling status:', error);
    throw error;
  }
};

export const getUserDetails = async (userId) => {
  try {
    const response = await fetch(`${API_BASE}/${userId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch user details');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};
