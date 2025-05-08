
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const SignupForm: React.FC = () => {
  const { isAuthenticated } = useAuth();

  // Since we're always authenticated now, just redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="text-center">
      <p>Redirecting to dashboard...</p>
    </div>
  );
};

export default SignupForm;
