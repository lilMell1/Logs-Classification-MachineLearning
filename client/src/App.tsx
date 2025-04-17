import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import LogsPage from './components/LogsPage';
import ProtectedRoute from './components/ProtectedRoute';
import ResearchesPage from './components/ResearchesPage';
import ProfileSettingsPage from './components/ProfileSettingsPage';
const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/LogsPage" element={<LogsPage />} />
          <Route path="/researchesPage" element={<ResearchesPage />} />
          <Route path="/settings" element={<ProfileSettingsPage />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
