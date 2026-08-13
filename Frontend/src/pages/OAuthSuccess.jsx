import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const OAuthSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      navigate('/login');
      return;
    }

    localStorage.setItem('token', token); // set early so the interceptor can use it

    api
      .get('/auth/me')
      .then((res) => {
        login(token, res.data);
        navigate('/dashboard');
      })
      .catch(() => navigate('/login'));
  }, []);

  return <div className="p-8 text-center">Signing you in...</div>;
};

export default OAuthSuccess;