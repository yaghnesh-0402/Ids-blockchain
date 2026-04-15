import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Detection from "./pages/Detection";
import Logs from "./pages/Logs";
import Login from "./pages/Login";
import Register from "./pages/Register";
import RealtimeMonitoring from "./pages/RealtimeMonitoring";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="detect" element={<Detection />} />
        <Route path="logs" element={<Logs />} />
        <Route path="realtime" element={<RealtimeMonitoring />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
