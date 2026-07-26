import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAppSelector } from "../store/hooks";
import { hasRole } from "../utils/permissions";
import type { UserRole } from "../types/auth";
import Spinner from "./Spinner";

interface AuthLayoutProps {
  children: ReactNode;
  /** false = guest-only page (e.g. login) */
  authentication?: boolean;
  requireRole?: UserRole;
}

function AuthLayout({
  children,
  authentication = true,
  requireRole,
}: AuthLayoutProps) {
  const { user, status } = useAppSelector((state) => state.auth);
  const location = useLocation();

  if (status === "loading") return <Spinner />;

  if (authentication && !user) {
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${redirect}`} replace />;
  }

  if (!authentication && user) {
    return <Navigate to="/leads" replace />;
  }

  if (requireRole && !hasRole(user, requireRole)) {
    return <Navigate to="/leads" replace />;
  }

  return <>{children}</>;
}

export default AuthLayout;
