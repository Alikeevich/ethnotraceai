import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface User {
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  connectedMarkets: string[];
  login: (email: string, name?: string) => Promise<void>;
  logout: () => void;
  connectMarket: (marketId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [connectedMarkets, setConnectedMarkets] = useState<string[]>([]); // Какие магазины подключены

  const login = async (email: string, name: string = 'Мастер') => {
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setUser({ email, name });
    setConnectedMarkets([]); // При входе пока ничего не подключено
  };

  const logout = () => {
    setUser(null);
    setConnectedMarkets([]);
  };

  // Имитация OAuth авторизации (загрузка 1.5 секунды)
  const connectMarket = async (marketId: string) => {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setConnectedMarkets((prev) => [...prev, marketId]);
  };

  return (
    <AuthContext.Provider value={{ user, connectedMarkets, login, logout, connectMarket }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}