import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
  Navigate, // Import Navigate
} from "react-router-dom";
import LoginPage from "./pages/account/login";
import RegisterPage from "./pages/account/register";
import MainLayout from "./layouts/mainLayout";
import Dashboard from "./pages/dashboard/Dashboard";
import Onboard from "./pages/onboard";
import OTPValidationPage from "./pages/account/verify";
import ForgotPasswordPage from "./pages/account/forgot-password";
import ContentKB from "./pages/contentKB";
import { useContext } from "react";
import { FbContext } from "./shared/rbac/context";

function RootRouter() {

  const authCxt = useContext(FbContext);

  // Assuming authCxt has properties like 'authenticated' and 'onboarded'
  const { authenticated: isAuthenticated, onboarded: isOnboarded } = authCxt;


  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route
          path="/"
          element={isAuthenticated ? (isOnboarded ? <Navigate to="/dashboard" replace /> : <Navigate to="/onboard" replace />) : <LoginPage />}
        />
        <Route index path="/register" element={<RegisterPage />} />
        <Route path="/verify" element={<OTPValidationPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        <Route
          path="/onboard"
          element={
            isAuthenticated && !isOnboarded ? (
              <Onboard />
            ) : (
              <Navigate to="/" replace /> // Redirect to dashboard or login depending on auth status
            )
          }
        />

        {/* Dashboard */}
        <Route
          path="/dashboard"
          element={
            isAuthenticated && isOnboarded ? (
              <MainLayout />
            ) : (
              <Navigate to="/" replace /> // Redirect to login or onboard if not authenticated
            )
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="content-kb" element={<ContentKB />} />
        </Route>


        {/* 404 Route */}
        <Route path="*" element={<h1>404 - Page Not Found</h1>} />
      </>
    )
  );

  return (
    <RouterProvider router={router}/>
  );
}

export default RootRouter;