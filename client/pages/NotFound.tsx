import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import Layout from "@/components/Layout";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <Layout>
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="mb-6">
            <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
            <p className="text-2xl font-bold text-slate-900 mb-2">Page not found</p>
            <p className="text-slate-600 mb-6">
              The page you're looking for doesn't exist or may have been moved.
            </p>
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-primary hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default NotFound;
