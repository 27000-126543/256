import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, UserRole } from '../types';
import { mockUsers } from '../data/mockData';

interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string, role: UserRole) => boolean;
  logout: () => void;
  switchRole: (role: UserRole) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      currentUser: null,
      isAuthenticated: false,
      login: (username, password, role) => {
        const user = mockUsers.find(
          (u) => u.role === role && (u.phone === username || u.employeeId === username || u.name === username)
        );
        if (user && password === '123456') {
          set({ currentUser: user, isAuthenticated: true });
          return true;
        }
        return false;
      },
      logout: () => {
        set({ currentUser: null, isAuthenticated: false });
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
