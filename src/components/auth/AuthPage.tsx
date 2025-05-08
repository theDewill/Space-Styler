
import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';

const AuthPage: React.FC = () => {
  return <Navigate to="/dashboard" replace />;
};

export default AuthPage;
