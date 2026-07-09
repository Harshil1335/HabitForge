import { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';
import { getToken, setToken as saveToken, removeToken as clearToken } from '../utils/tokenStorage';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(getToken());
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && !!token;

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = getToken();
      if (!storedToken) {
        setIsLoading(false);
        return;
      }
      
      try {
        const response = await authApi.getMe();
        if (response.success) {
          setUser(response.data.user);
        } else {
          clearToken();
          setTokenState(null);
        }
      } catch (error) {
        clearToken();
        setTokenState(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (data) => {
    const response = await authApi.login(data);
    if (response.success) {
      saveToken(response.data.token);
      setTokenState(response.data.token);
      setUser(response.data.user);
    }
    return response;
  };

  const register = async (data) => {
    return await authApi.register(data);
  };

  const logout = () => {
    clearToken();
    setTokenState(null);
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
