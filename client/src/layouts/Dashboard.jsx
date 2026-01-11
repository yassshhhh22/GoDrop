import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import UserMenu from "../components/UserMenu";
import useAuthStore from "../stores/authStore";
import Loading from "../components/Loading"; // Add import for Loading component

const Dashboard = () => {
  const { user, isAuthenticated, isLoading } = useAuthStore();

  // Show loading state
  if (isLoading) {
    return <Loading size={150} />;
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <section className="bg-gray-50 min-h-screen">
      <div className="container mx-auto p-3 lg:p-4 grid lg:grid-cols-[280px_1fr] gap-4">
        {/* Left Sidebar - User Menu */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 max-h-[calc(100vh-112px)] overflow-y-auto bg-gray-50 rounded-lg border border-gray-200 p-4 shadow-sm">
            <UserMenu />
          </div>
        </aside>

        {/* Right Content Area */}
        <main className="bg-gray-50 min-h-[75vh]">
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 lg:p-6 shadow-sm">
            <Outlet context={{ user }} />
          </div>
        </main>
      </div>
    </section>
  );
};

export default Dashboard;
