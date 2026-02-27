import { useEffect } from 'react';
import { RouterProvider, useNavigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { router } from './lib/router';
import { supabase } from './lib/supabase';

function AuthHandler() {
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        window.location.href = '/reset-password';
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  return null;
}

function App() {
  return (
    <AuthProvider>
      <AuthHandler />
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;
