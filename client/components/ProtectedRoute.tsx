import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  try {
    const { isAuthenticated, isLoading } = useAuth();

    // While loading auth state, show nothing to avoid flashing content
    if (isLoading) {
      return null;
    }

    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
  } catch (error) {
    console.error("ProtectedRoute error:", error);
    // If auth context is not available, redirect to login
    return <Navigate to="/login" replace />;
  }
}
