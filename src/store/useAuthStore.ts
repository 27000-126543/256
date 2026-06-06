import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, UserRole } from '../types';
import { mockUsers } from '../data/mockData';
import { authApi } from '../services/api';

interface AuthState {
  currentUser: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (username: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      currentUser: null,
      token: null,
      isAuthenticated: false,
      login: async (username, password, role) => {
        try {
          const result = await authApi.login(username, password, role);
          if (result.user && result.token) {
            set({
              currentUser: result.user,
              token: result.token,
              isAuthenticated: true,
            });
            return true;
          }
        } catch (error) {
          console.warn('API登录失败，尝试使用Mock数据登录:', error);
          const user = mockUsers.find(
            (u) => u.role === role && (u.phone === username || u.employeeId === username || u.name === username)
          );
          if (user && password === '123456') {
            set({
              currentUser: user,
              token: `mock-token-${user.id}`,
              isAuthenticated: true,
            });
            return true;
          }
        }
        return false;
      },
      logout: () => {
        set({ currentUser: null, token: null, isAuthenticated: false });
      },
      switchRole: (role) => {
        const user = mockUsers.find((u) => u.role === role);
        if (user) {
          set({ currentUser: user });
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
