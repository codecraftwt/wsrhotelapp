import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create an Axios instance
const api = axios.create({
  baseURL: 'https://orange-cat-558017.hostingersite.com/api/',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add an interceptor to attach the token to every request
api.interceptors.request.use(
  async (config) => {
    // Get the token from AsyncStorage
    const token = await AsyncStorage.getItem('token');
    console.log("token", token)
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    // If an error occurs in the request, return the error
    return Promise.reject(error);
  }
);

export default api;
