import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
  Navigate,
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
import { Button, Result } from "antd";
import Facebot from "./pages/facebot";

function RootRouter() {

  const authCxt = useContext(FbContext);

  const { authenticated: isAuthenticated, onboarded: isOnboarded } = authCxt;

  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route
          path="/login"
          element={isAuthenticated ? (isOnboarded ? <Navigate to="/" replace /> : <Navigate to="/onboard" replace />) : <LoginPage />}
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
              <Navigate to="/dashboard" replace />
            )
          }
        />

        {/* Dashboard */}
        <Route
          path="/"
          element={
            isAuthenticated && isOnboarded ? (
              <MainLayout />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        >
          <Route index path="/dashboard" element={<Dashboard />} />
          <Route path="content-kb" element={<ContentKB />} />
          <Route path="content-facebot" element={<Facebot />} />

          {/* Reports Routes */}
          <Route path="reports">
            <Route path=":dashboardID" element={<Dashboard />} />
          </Route>

          {/* 404 Route within Dashboard Layout */}
          <Route path="*" element={  <Result
            status="404"
            title="404"
            subTitle="Sorry, the page you visited does not exist."
            extra={<Button type="primary" onClick={() => window.history.back() }>Back Home</Button>}
          />} />

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