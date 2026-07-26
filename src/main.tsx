import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import store from "./store/store";
import App from "./App";
import { AuthLayout } from "./components";
import Capture from "./pages/Capture";
import Home from "./pages/Home";
import LeadDetail from "./pages/LeadDetail";
import Leads from "./pages/Leads";
import Login from "./pages/Login";
import Team from "./pages/Team";
import "./index.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: "capture", element: <Capture /> },
      {
        path: "login",
        element: (
          <AuthLayout authentication={false}>
            <Login />
          </AuthLayout>
        ),
      },
      {
        path: "leads",
        element: (
          <AuthLayout>
            <Leads />
          </AuthLayout>
        ),
      },
      {
        path: "leads/:id",
        element: (
          <AuthLayout>
            <LeadDetail />
          </AuthLayout>
        ),
      },
      {
        path: "team",
        element: (
          <AuthLayout requireRole="admin">
            <Team />
          </AuthLayout>
        ),
      },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>
);
