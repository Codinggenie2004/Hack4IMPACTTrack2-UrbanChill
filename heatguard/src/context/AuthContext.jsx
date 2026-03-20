import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    // Check local storage for existing token on load
    const savedToken = localStorage.getItem('heatguard_token');
    const savedUser = localStorage.getItem('heatguard_user');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      try {
        setUser(JSON.parse(savedUser));
      } catch(e) {
        console.error("Failed to parse user from local storage", e);
      }
    }
  }, []);

  const login = (newUser, newToken) => {
    setUser(newUser);
    setToken(newToken);
    localStorage.setItem('heatguard_token', newToken);
    localStorage.setItem('heatguard_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('heatguard_token');
    localStorage.removeItem('heatguard_user');
  };

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  return (
    <AuthContext.Provider value={{
      user, token, login, logout,
      isAuthModalOpen, openAuthModal, closeAuthModal
    }}>
      {children}
    </AuthContext.Provider>
  );
}
