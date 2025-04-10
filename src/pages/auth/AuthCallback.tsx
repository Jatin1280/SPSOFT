import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Check if we have a hash in the URL
        if (location.hash) {
          const hashParams = new URLSearchParams(location.hash.substring(1));
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');
          
          if (!accessToken) throw new Error('No access token found');

          // Set the session manually
          const { data: { session }, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || ''
          });

          if (error) throw error;

          if (session) {
            toast.success('Signed in successfully');
            navigate('/', { replace: true });
          } else {
            throw new Error('No session found');
          }
        } else {
          // If no hash, try to get existing session
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error) throw error;

          if (session) {
            toast.success('Signed in successfully');
            navigate('/', { replace: true });
          } else {
            throw new Error('No session found');
          }
        }
      } catch (error: any) {
        console.error('Error handling auth callback:', error);
        toast.error('Failed to complete authentication');
        navigate('/auth/signin', { replace: true });
      }
    };

    handleAuthCallback();
  }, [navigate, location]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
        <p className="mt-4 text-gray-600 dark:text-gray-400">Completing authentication...</p>
      </div>
    </div>
  );
} 