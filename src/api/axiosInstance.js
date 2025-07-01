import axios from 'axios';

const api = axios.create({
  baseURL: 'https://orange-cat-558017.hostingersite.com/',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
