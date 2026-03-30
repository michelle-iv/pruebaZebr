import {
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import {
  StorageKeys,
  deleteKey,
  getKey,
} from '@/src/common/services/storage.service';
import { login as loginService } from '@/src/common/services/auth.service';
import type { FormStatus, User } from '@/src/common/types';

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  requiresPasswordChange: boolean;
}

interface AuthContextType extends AuthState {
  login: (data: { username: string; password: string }) => Promise<FormStatus>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    requiresPasswordChange: false,
  });

  useEffect(() => {
    const checkAuthStatus = async () => {
      setIsLoading(true);
      try {
        const storedUserData = await getKey(StorageKeys.USER_DATA);
        const storedRequiresPasswordChange = await getKey(
          StorageKeys.REQUIRES_PASSWORD_CHANGE,
        );

        if (storedUserData) {
          const user = JSON.parse(storedUserData) as User;
          setAuthState({
            isAuthenticated: true,
            user,
            requiresPasswordChange:
              storedRequiresPasswordChange === 'true',
          });
        } else {
          setAuthState({
            isAuthenticated: false,
            user: null,
            requiresPasswordChange: false,
          });
        }
      } catch {
        setAuthState({
          isAuthenticated: false,
          user: null,
          requiresPasswordChange: false,
        });
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  async function login(data: {
    username: string;
    password: string;
  }): Promise<FormStatus> {
    setIsLoading(true);
    try {
      const result = await loginService(data);

      if (!result.success) {
        return result;
      }

      setAuthState({
        isAuthenticated: true,
        user: result.user ?? null,
        requiresPasswordChange: result.requiresPasswordChange ?? false,
      });

      return result;
    } finally {
      setIsLoading(false);
    }
  }

  async function logout() {
    setIsLoading(true);
    try {
      await deleteKey(StorageKeys.USER_DATA);
      await deleteKey(StorageKeys.REQUIRES_PASSWORD_CHANGE);
      setAuthState({
        isAuthenticated: false,
        user: null,
        requiresPasswordChange: false,
      });
    } finally {
      setIsLoading(false);
    }
  }

  const value: AuthContextType = {
    ...authState,
    login,
    logout,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
