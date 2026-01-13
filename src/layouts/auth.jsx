import { Routes, Route } from "react-router-dom";
import { SignIn } from "@/pages/auth";

export function Auth() {
  return (
    <div className="relative min-h-screen w-full">
      <Routes>
        <Route exact path="/sign-in" element={<SignIn />} />
      </Routes>
    </div>
  );
}

Auth.displayName = "/src/layout/Auth.jsx";

export default Auth;
