// src/components/shared/Navbar.tsx
import { ThemeToggle } from '../theme/theme-toggle';
import { useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();
  
  // Get current page title based on route
  const getPageTitle = () => {
    switch(location.pathname) {
      case '/':
        return 'Dashboard';
      case '/table':
        return 'Data Table';
      case '/analysis':
        return 'Analysis';
      default:
        return 'Dashboard';
    }
  };

  return (
    <nav className="border-b bg-background fixed top-0 right-0 left-64 z-10">
      <div className="mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <span className="text-xl font-bold">{getPageTitle()}</span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;