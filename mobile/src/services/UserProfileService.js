import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

class UserProfileService {
  constructor() {
    const raw = process.env.EXPO_PUBLIC_API_URL || (Platform.OS === 'android' ? 'http://10.0.2.2:5000' : 'http://localhost:5000');
    this.baseURL = raw.replace(/\/$/, '');
  }

  // Get user profile
  async getProfile(userId = null) {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const endpoint = userId ? `/auth/profile/${userId}` : '/auth/profile';
      
      const response = await axios.get(`${this.baseURL}${endpoint}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      return response.data;
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener el perfil');
    }
  }

  // Update user profile
  async updateProfile(profileData) {
    try {
      const token = await AsyncStorage.getItem('userToken');
      
      const response = await axios.put(
        `${this.baseURL}/auth/profile`,
        profileData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw new Error(error.response?.data?.message || 'Error al actualizar el perfil');
    }
  }

  // Upload profile picture
  async uploadProfilePicture(imageUri) {
    try {
      const token = await AsyncStorage.getItem('userToken');
      
      const formData = new FormData();
      formData.append('profilePicture', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'profile.jpg',
      });
      
      const response = await axios.post(
        `${this.baseURL}/auth/profile/picture`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      throw new Error(error.response?.data?.message || 'Error al subir la foto de perfil');
    }
  }

  // Get user's events (created, attending, etc.)
  async getUserEvents(type = 'all') {
    try {
      const token = await AsyncStorage.getItem('userToken');
      
      const response = await axios.get(
        `${this.baseURL}/events/user/events?type=${type}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error getting user events:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener los eventos del usuario');
    }
  }

  // Get user's saved posts
  async getSavedPosts(page = 1, limit = 20) {
    try {
      const token = await AsyncStorage.getItem('userToken');
      
      const response = await axios.get(
        `${this.baseURL}/posts/user/saved?page=${page}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error getting saved posts:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener los posts guardados');
    }
  }

  // Get user's tribes
  async getUserTribes(page = 1, limit = 20) {
    try {
      const token = await AsyncStorage.getItem('userToken');
      
      const response = await axios.get(
        `${this.baseURL}/tribes/user/tribes?page=${page}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error getting user tribes:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener las tribus del usuario');
    }
  }

  // Get user's posts
  async getUserPosts(page = 1, limit = 20) {
    try {
      const token = await AsyncStorage.getItem('userToken');
      
      const response = await axios.get(
        `${this.baseURL}/posts/user/posts?page=${page}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error getting user posts:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener los posts del usuario');
    }
  }

  // Get user's activity feed
  async getActivityFeed(page = 1, limit = 20) {
    try {
      const token = await AsyncStorage.getItem('userToken');
      
      const response = await axios.get(
        `${this.baseURL}/user/activity?page=${page}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error getting activity feed:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener el feed de actividad');
    }
  }

  // Get user's statistics
  async getUserStats() {
    try {
      const token = await AsyncStorage.getItem('token');
      
      const response = await axios.get(`${this.baseURL}/user/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      return response.data;
    } catch (error) {
      console.error('Error getting user stats:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener las estadísticas del usuario');
    }
  }

  // Update user preferences
  async updatePreferences(preferences) {
    try {
      const token = await AsyncStorage.getItem('token');
      
      const response = await axios.put(
        `${this.baseURL}/user/preferences`,
        preferences,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error updating preferences:', error);
      throw new Error(error.response?.data?.message || 'Error al actualizar las preferencias');
    }
  }

  // Get user preferences
  async getPreferences() {
    try {
      const token = await AsyncStorage.getItem('token');
      
      const response = await axios.get(`${this.baseURL}/user/preferences`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      return response.data;
    } catch (error) {
      console.error('Error getting preferences:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener las preferencias');
    }
  }

  // Delete user account
  async deleteAccount(password) {
    try {
      const token = await AsyncStorage.getItem('token');
      
      const response = await axios.delete(`${this.baseURL}/auth/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: { password },
      });
      
      return response.data;
    } catch (error) {
      console.error('Error deleting account:', error);
      throw new Error(error.response?.data?.message || 'Error al eliminar la cuenta');
    }
  }

  // Block user
  async blockUser(userId) {
    try {
      const token = await AsyncStorage.getItem('token');
      
      const response = await axios.post(
        `${this.baseURL}/user/block`,
        { userId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error blocking user:', error);
      throw new Error(error.response?.data?.message || 'Error al bloquear usuario');
    }
  }

  // Unblock user
  async unblockUser(userId) {
    try {
      const token = await AsyncStorage.getItem('token');
      
      const response = await axios.delete(`${this.baseURL}/user/block/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      return response.data;
    } catch (error) {
      console.error('Error unblocking user:', error);
      throw new Error(error.response?.data?.message || 'Error al desbloquear usuario');
    }
  }

  // Get blocked users
  async getBlockedUsers() {
    try {
      const token = await AsyncStorage.getItem('token');
      
      const response = await axios.get(`${this.baseURL}/user/blocked`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      return response.data;
    } catch (error) {
      console.error('Error getting blocked users:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener usuarios bloqueados');
    }
  }

  // Follow user
  async followUser(userId) {
    try {
      const token = await AsyncStorage.getItem('token');
      
      const response = await axios.post(
        `${this.baseURL}/user/follow`,
        { userId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error following user:', error);
      throw new Error(error.response?.data?.message || 'Error al seguir usuario');
    }
  }

  // Unfollow user
  async unfollowUser(userId) {
    try {
      const token = await AsyncStorage.getItem('token');
      
      const response = await axios.delete(`${this.baseURL}/user/follow/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      return response.data;
    } catch (error) {
      console.error('Error unfollowing user:', error);
      throw new Error(error.response?.data?.message || 'Error al dejar de seguir usuario');
    }
  }

  // Get followers
  async getFollowers(page = 1, limit = 20) {
    try {
      const token = await AsyncStorage.getItem('token');
      
      const response = await axios.get(
        `${this.baseURL}/user/followers?page=${page}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error getting followers:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener seguidores');
    }
  }

  // Get following
  async getFollowing(page = 1, limit = 20) {
    try {
      const token = await AsyncStorage.getItem('token');
      
      const response = await axios.get(
        `${this.baseURL}/user/following?page=${page}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error getting following:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener seguidos');
    }
  }
}

export default new UserProfileService();






