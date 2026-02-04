import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PrivateRoute } from './components/auth/PrivateRoute';
import { Toaster } from 'sonner';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardPage from './pages/DashboardPage';
import POSPage from './pages/POSPage';
import InventoryPage from './pages/InventoryPage';
import RecetasPage from './pages/RecetasPage';
import VentasPage from './pages/VentasPage';
import EntregasPage from './pages/EntregasPage';
import ReportesPage from './pages/ReportesPage';
import ProveedoresPage from './pages/ProveedoresPage';
import AlertasPage from './pages/AlertasPage';
import ConfigPage from './pages/ConfigPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          path="/"
          element={
            <PrivateRoute>
              <DashboardLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="caja" element={<POSPage />} />
          <Route
            path="inventario"
            element={
              <PrivateRoute requiredRoles={['admin', 'manager', 'pharmacist']}>
                <InventoryPage />
              </PrivateRoute>
            }
          />
          <Route path="recetas" element={<RecetasPage />} />
          <Route path="ventas" element={<VentasPage />} />
          <Route path="entregas" element={<EntregasPage />} />
          <Route
            path="reportes"
            element={
              <PrivateRoute requiredRoles={['admin', 'manager']}>
                <ReportesPage />
              </PrivateRoute>
            }
          />
          <Route path="proveedores" element={<ProveedoresPage />} />
          <Route path="alertas" element={<AlertasPage />} />
          <Route
            path="config"
            element={
              <PrivateRoute requiredRoles={['admin']}>
                <ConfigPage />
              </PrivateRoute>
            }
          />
        </Route>
      </Routes>
      <Toaster position="top-right" richColors />
    </BrowserRouter>
  );
}

export default App;
