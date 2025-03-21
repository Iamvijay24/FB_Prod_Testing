import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import RegisterPage from "./pages/account/register";
import MainLayout from "./layouts/mainLayout";
import Dashboard from "./pages/dashboard/Dashboard";
import Onboard from "./pages/onboard";
import ContentKB from "./pages/contentKB";
import { useContext } from "react";
import { FbContext } from "./shared/rbac/context";

function RootRouter() {

  const authCxt = useContext(FbContext);

  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route
          path="/"
          element={authCxt.authenticated ? <Navigate to="/dashboard" replace /> : <div></div>}
        />
        <Route index path="/register" element={<RegisterPage />} />
        <Route path="/onboard" element={<Onboard />} />

        {/* Dashboard */}
        <Route
          path="/dashboard"
          element={
            authCxt.authenticated ? (
              <MainLayout />
            ) : (
              <Navigate to="/" replace /> // Redirect to login if not authenticated
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