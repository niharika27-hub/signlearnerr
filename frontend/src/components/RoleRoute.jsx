import { Navigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";

function RoleRoute({ allowedRoles, children, fallbackTo = "/" }) {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const roleValue = String(user?.role || "").toLowerCase();
  if (allowedRoles.includes("admin") && Boolean(user?.isAdminOverride)) {
    return children;
  }

  if (!allowedRoles.includes(roleValue)) {
    return <Navigate to={fallbackTo} replace />;
  }

  return children;
}

export default RoleRoute;