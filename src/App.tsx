import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layout/MainLayout';
import Inicio from './views/Inicio';
import Reportes from './views/Reportes';
import Ventas from './views/Ventas';
import Nomina from './views/Nomina';
import NominaPago from './views/NominaPago';
import NominaCaboPago from './views/NominaCaboPago';
import NominaHistorialDetalle from './views/NominaHistorialDetalle';
import Gastos from './views/Gastos';
import Cobranza from './views/Cobranza';
import Catalogos from './views/Catalogos';
import Login from './views/Login';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { ToastContainer } from './components/Toast';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/inicio" replace />} />
            <Route path="inicio" element={<Inicio />} />
            <Route path="reportes" element={<Reportes />} />
            <Route path="ventas" element={<Ventas />} />
            <Route path="nomina" element={<Nomina />} />
            <Route path="nomina/pago/:semana" element={<NominaPago />} />
            <Route path="nomina/cabo-pago/:id" element={<NominaCaboPago />} />
            <Route path="nomina/historial/:semana" element={<NominaHistorialDetalle />} />
            <Route path="gastos" element={<Gastos />} />
            <Route path="cxc" element={<Cobranza />} />
            <Route path="catalogos" element={<Catalogos />} />
          </Route>
        </Routes>
        <ToastContainer />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
