import { Navigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";

const ProtectedRoute = ({ children }) => {
	const { isAuthenticated, loading } = useAuth();

	// Don't call init() here - App.jsx handles it once on load
	// Just check the current auth state

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

	return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
