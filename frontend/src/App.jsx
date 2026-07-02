import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthPanel from './components/AuthPanel';
import Dashboard from './components/Dashboard'; // Ensures it points to your new Dashboard.jsx

const AppContent = () => {
  const { isAuthenticated } = useAuth();
  // If logged in, show the Dashboard component instead of a text string!
  return isAuthenticated ? <Dashboard /> : <AuthPanel />;
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;