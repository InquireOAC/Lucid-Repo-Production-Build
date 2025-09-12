import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center starry-background pt-safe-top pl-safe-left pr-safe-right">
      <div className="text-center glass-card rounded-2xl p-8">
        <h1 className="text-4xl font-bold mb-4 gradient-text">404</h1>
        <p className="text-xl text-white/70 mb-4">Oops! Page not found</p>
        <a href="/" className="text-purple-300 hover:text-white underline transition-colors">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
