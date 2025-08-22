//artemis-admin/src/routes.tsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { 
  Typography, 
  Button 
} from '@mui/material';
import apiService from './services/apiService';

// Sayfalar
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import MailQueuePage from './pages/MailQueuePage';
import EmployeesPage from './pages/EmployeesPage';
import VehiclesPage from './pages/VehiclesPage';
import ReportApprovalPage from './pages/ReportApprovalPage';
import FirmaListPage from './pages/FirmaListPage';
import FirmaDetayPage from './pages/FirmaDetayPage';
import RouteAnalysisPage from './pages/RouteAnalysisPage';


// Private Route bileşeni
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = apiService.isAuthenticated();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      
      <Route 
        path="/dashboard" 
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } 
      />
      
      <Route 
        path="/mail-queue" 
        element={
          <PrivateRoute>
            <MailQueuePage />
          </PrivateRoute>
        } 
      />
      
      <Route 
        path="/employees" 
        element={
          <PrivateRoute>
            <EmployeesPage />
          </PrivateRoute>
        } 
      />
      
      <Route 
        path="/vehicles" 
        element={
          <PrivateRoute>
            <VehiclesPage />
          </PrivateRoute>
        } 
      />
      
      <Route 
        path="/firmalar" 
        element={
          <PrivateRoute>
            <FirmaListPage />
          </PrivateRoute>
        } 
      />

      <Route 
        path="/firma-detay/:companyId" 
        element={
          <PrivateRoute>
            <FirmaDetayPage />
          </PrivateRoute>
        } 
      />

      <Route 
        path="/report-approval" 
        element={
          <PrivateRoute>
            <ReportApprovalPage />
          </PrivateRoute>
        } 
      />

      <Route 
        path="/route-analysis" 
        element={
          <PrivateRoute>
            <RouteAnalysisPage />
          </PrivateRoute>
        } 
      />
      
      {/* Varsayılan yönlendirme */}
      <Route path="/" element={<Navigate to="/dashboard" />} />
      
      {/* 404 Not Found */}
      <Route 
        path="*" 
        element={
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100vh',
            backgroundColor: '#f0f2f5'
          }}>
            <Typography variant="h4" color="error" gutterBottom>
              404 - Sayfa Bulunamadı
            </Typography>
            <Typography variant="subtitle1">
              Aradığınız sayfa sistemde mevcut değil.
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => window.location.href = '/dashboard'}
              sx={{ mt: 2 }}
            >
              Ana Sayfaya Dön
            </Button>
          </div>
        } 
      />
    </Routes>
  );
};

export default AppRoutes;