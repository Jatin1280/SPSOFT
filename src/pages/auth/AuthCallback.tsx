import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the session from the URL hash
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }

        if (session) {
          // Store the session
          await supabase.auth.setSession(session);
          toast.success('Signed in successfully');
          navigate('/');
        } else {
          throw new Error('No session found');
        }
      } catch (error: any) {
        console.error('Error handling auth callback:', error);
        toast.error('Failed to complete authentication');
        navigate('/auth/signin');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
        <p className="mt-4 text-gray-600 dark:text-gray-400">Completing authentication...</p>
      </div>
    </div>
  );
} 