// utils/api.js

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Auth headers utility function
const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

// Error handling utility
const handleResponse = async (response) => {
  const contentType = response.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');
  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const error = isJson ? data.error || data.detail || 'An error occurred' : data;
    throw new Error(error);
  }

  return data;
};

// Registration
export const registerUser = async (userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/register/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Registration failed');
    }

    return response.json();
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

// Authentication functions
export const loginUser = async (credentials) => {
  try {
    const response = await fetch(`${API_BASE_URL}/token/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: credentials.username,
        password: credentials.password,
      }),
    });

    const data = await handleResponse(response);
    
    // Store tokens
    if (data.access) {
      localStorage.setItem('accessToken', data.access);
    }
    if (data.refresh) {
      localStorage.setItem('refreshToken', data.refresh);
    }
    
    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const refreshAccessToken = async () => {
  try {
    const refresh = localStorage.getItem('refreshToken');
    if (!refresh) throw new Error('No refresh token available');

    const response = await fetch(`${API_BASE_URL}/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    });

    const data = await handleResponse(response);
    if (data.access) {
      localStorage.setItem('accessToken', data.access);
    }
    return data;
  } catch (error) {
    console.error('Token refresh error:', error);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    throw error;
  }
};

export const logout = async () => {
  try {
    const headers = getAuthHeaders();
    // Optional: Call logout endpoint if your backend has one
    await fetch(`${API_BASE_URL}/logout/`, {
      method: 'POST',
      headers,
    }).catch(() => {});  // Ignore errors on logout request
  } finally {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }
};

// Blog CRUD operations
// utils/api.js
export const createBlog = async (blogData) => {
    try {
      // Ensure we're only sending title and content
      const { title, content } = blogData;
      
      const response = await fetch(`${API_BASE_URL}/blogs/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ title, content }),
      });
  
      const data = await handleResponse(response);
      
      return {
        success: true,
        blog: data.blog || data
      };
    } catch (error) {
      console.error('Create blog error:', error);
      throw error;
    }
};
export const getBlogs = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/blogs/`, {
      headers: getAuthHeaders(),
    });
    const data = await handleResponse(response);
    return {
      success: true,
      blogs: data.blogs || data
    };
  } catch (error) {
    console.error('Fetch blogs error:', error);
    throw error;
  }
};

export const getBlog = async (id) => {
  try {
    if (!id) throw new Error('Blog ID is required');
    
    console.log('Fetching blog with ID:', id); // Debug log
    const response = await fetch(`${API_BASE_URL}/blogs/${id}/`, {
      headers: getAuthHeaders(),
    });

    const data = await handleResponse(response);
    console.log('Blog data received:', data); // Debug log
    
    return {
      success: true,
      blog: data.blog || data
    };
  } catch (error) {
    console.error('Fetch blog error:', error);
    throw error;
  }
};

export const updateBlog = async (id, blogData) => {
  try {
    if (!id) throw new Error('Blog ID is required');
    
    console.log('Updating blog:', id, blogData); // Debug log
    const response = await fetch(`${API_BASE_URL}/blogs/${id}/`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(blogData),
    });

    const data = await handleResponse(response);
    console.log('Update response:', data); // Debug log
    
    return {
      success: true,
      blog: data.blog || data
    };
  } catch (error) {
    console.error('Update blog error:', error);
    throw error;
  }
};

export const deleteBlog = async (id) => {
  try {
    if (!id) throw new Error('Blog ID is required');

    const response = await fetch(`${API_BASE_URL}/blogs/${id}/`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete blog');
    }
    
    return {
      success: true,
      message: 'Blog deleted successfully'
    };
  } catch (error) {
    console.error('Delete blog error:', error);
    throw error;
  }
};

// User operations
export const getCurrentUser = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/me/`, {
      headers: getAuthHeaders(),
    });
    const data = await handleResponse(response);
    return {
      success: true,
      user: data.user || data
    };
  } catch (error) {
    console.error('Fetch current user error:', error);
    throw error;
  }
};

export const updateUserProfile = async (userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/me/`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData),
    });
    const data = await handleResponse(response);
    return {
      success: true,
      user: data.user || data
    };
  } catch (error) {
    console.error('Update profile error:', error);
    throw error;
  }
};