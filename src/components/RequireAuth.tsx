import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router";
import { getAccessToken, getCustomerAccessToken } from "@/lib/api";

interface RequireAuthProps {
  role: "admin" | "customer";
  children: ReactNode;
}

export default function RequireAuth({ role, children }: RequireAuthProps) {
  const location = useLocation();
  const token = role === "admin" ? getAccessToken() : getCustomerAccessToken();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}
