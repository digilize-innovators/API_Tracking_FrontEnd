import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useAuth } from '../Context/AuthContext';

const ProtectedRoute = (WrappedComponent) => {
  const ProtectedComponent = (props) => {
    const data = useAuth();
    const { user } = data || {};
    const router = useRouter();

    useEffect(() => {
      const token = document.cookie.split('; ').find((row) => row.startsWith('token='))?.split('=')[1];
      if (!token) {
        router && router.replace('/login');
      }
    }, [user, router]);

    return <WrappedComponent {...props} />;
  };
  return ProtectedComponent;
};

export default ProtectedRoute;