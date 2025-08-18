import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { login, register, logout, getProfile } from '../store/slices/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, token, isAuthenticated, loading, error } = useSelector(
    (state: RootState) => state.auth
  );

  const loginUser = async (credentials: { email: string; password: string }) => {
    return await dispatch(login(credentials));
  };

  const registerUser = async (userData: { email: string; password: string; name: string }) => {
    return await dispatch(register(userData));
  };

  const logoutUser = () => {
    dispatch(logout());
  };

  const fetchProfile = async () => {
    return await dispatch(getProfile());
  };

  return {
    user,
    token,
    isAuthenticated,
    loading,
    error,
    loginUser,
    registerUser,
    logoutUser,
    fetchProfile,
  };
}; 