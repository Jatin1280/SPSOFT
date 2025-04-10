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
          // Parse the hash parameters
          const hashParams = new URLSearchParams(location.hash.substring(1));
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');
          const providerToken = hashParams.get('provider_token');

          if (!accessToken) {
            throw new Error('No access token found');
          }

          // Set the session with the tokens
          const { data: { session }, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || ''
          });

          if (error) {
            throw error;
          }

          if (session) {
            // Store additional tokens if needed
            if (providerToken) {
              localStorage.setItem('provider_token', providerToken);
            }

            toast.success('Signed in successfully');
            // Use replace to prevent going back to the callback URL
            navigate('/', { replace: true });
          } else {
            throw new Error('No session found');
          }
        } else {
          // If no hash, check for existing session
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error) {
            throw error;
          }

          if (session) {
            toast.success('Already signed in');
            navigate('/', { replace: true });
          } else {
            throw new Error('No session found');
          }
        }
      } catch (error: any) {
        console.error('Error in auth callback:', error);
        toast.error(error.message || 'Failed to complete authentication');
        navigate('/auth/signin', { replace: true });
      }
    };

    // Execute the callback handler
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