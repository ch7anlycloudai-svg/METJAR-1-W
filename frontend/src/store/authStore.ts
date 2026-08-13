import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthStore {
  token: string | null;
  admin: { id: string; email: string; name: string } | null;
  isAuthenticated: boolean;
  login: (token: string, admin: { id: string; email: string; name: string }) => void;
  logout: () => void;
}

export const useAuth = create<AuthStore>()(
  persist(
    (set) => ({
      token: null,
      admin: null,
      isAuthenticated: false,
      login: (token, admin) => {
        localStorage.setItem('admin_token', token);
        set({ token, admin, isAuthenticated: true });
      },
      logout: () => {
        localStorage.removeItem('admin_token');
        set({ token: null, admin: null, isAuthenticated: false });
      },
    }),
    { name: 'wwenatou-auth' }
  )
);
