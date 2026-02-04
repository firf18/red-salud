import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import Login from './pages/Login';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardPage from './pages/Dashboard';

const App: React.FC = () => {
    return (
        <>
            <Toaster position="top-right" richColors expand closeButton />
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/dashboard" element={<DashboardLayout />}>
                    <Route index element={<DashboardPage />} />
                </Route>
                <Route path="/" element={<Navigate to="/login" replace />} />
            </Routes>
        </>
    );
};

export default App;
