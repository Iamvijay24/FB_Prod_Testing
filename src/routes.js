import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import LoginPage from "./pages/account/login";
import RegisterPage from "./pages/account/register";
import MainLayout from "./layouts/mainLayout";
import Dashboard from "./pages/dashboard/Dashboard";
import Onboard from "./pages/onboard";
import ContentKB from "./pages/contentKB";

function RootRouter() {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route index path="/login" element={<LoginPage />} />
        <Route index path="/register" element={<RegisterPage />} />
        <Route index path="/onboard" element={<Onboard />} />

        {/* Dashboard */}
        <Route path="/" element={<MainLayout />} >
          <Route index element={<Dashboard />} />
          <Route path="/content-kb" element={<ContentKB />} />
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
