import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { checkAuth } from "./app/slices/authSlice";
import Loader from "./components/common/Loader";
import Navbar from "./components/common/Navbar";
function App() {
  const dispatch = useDispatch();
  const location = useLocation();
  const { isLoading, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      dispatch(checkAuth());
    }
  }, [dispatch]);

  if (isLoading) {
    return <Loader />;
  }

  // Don't show global navbar on dashboard routes (layouts have their own)
  const isDashboardRoute = location.pathname.startsWith("/dashboard");

  return (
    <div>
      {<Navbar />}

      <div className="min-h-screen bg-gray-50">
        <AppRoutes />
      </div>
    </div>
  );
}

export default App;
