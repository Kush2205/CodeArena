'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export interface DecodedToken {
  userId: number;
  email: string;
  role?: string;
  exp?: number;
}

export function useAuth() {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<DecodedToken | null>(null);

  useEffect(() => {
    const checkAuth = () => {
      // Don't check auth on auth pages
      if (pathname?.startsWith('/signin') || pathname?.startsWith('/signup')) {
        setIsLoading(false);
        return;
      }

      const token = localStorage.getItem('token');
      
      if (!token) {
        setIsAuthenticated(false);
        setIsLoading(false);
        router.push('/signin');
        return;
      }

      try {
        // Decode JWT to check expiration
        const parts = token.split('.');
        if (parts.length !== 3 || !parts[1]) {
          throw new Error('Invalid token format');
        }
        
        const payload = JSON.parse(atob(parts[1])) as DecodedToken;
        
        // Check if token is expired
        if (payload.exp && payload.exp * 1000 < Date.now()) {
          localStorage.removeItem('token');
          setIsAuthenticated(false);
          setIsLoading(false);
          router.push('/signin');
          return;
        }

        setUser(payload);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Invalid token:', error);
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        router.push('/signin');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [pathname, router]);

  return { isAuthenticated, isLoading, user };
}

export function isAdmin(user: DecodedToken | null): boolean {
  return user?.role === 'admin';
}
