// src/components/shared/Layout.tsx
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 min-h-screen p-6 ml-64">
          <div className="mt-16"> {/* Add margin-top to account for fixed navbar */}
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;