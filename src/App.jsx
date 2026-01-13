import { Routes, Route, Navigate } from "react-router-dom";
import { Dashboard, Auth } from "@/layouts";
import ProtectedRoute from "./layouts/protected-route";

function App() {
  return (
    <Routes>
      <Route path="/auth/*" element={<Auth />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/*" element={<Dashboard />} />
      </Route>
      <Route path="*" element={<Navigate to="/auth/sign-in" replace />} />
    </Routes>
  );
}

export default App;
