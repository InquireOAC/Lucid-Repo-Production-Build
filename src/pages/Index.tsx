
import { Navigate } from "react-router-dom";

const Index = () => {
  // Redirect to Journal page which is the main page of the app
  return <Navigate to="/journal" replace />;
};

export default Index;
