import { logout } from '../redux/slices/authSlice';
import { store } from '../redux/store';

export const handleLogout = () => {
  store.dispatch(logout());
};
