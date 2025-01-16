// src/components/shared/Navbar.tsx
import { ThemeToggle } from '../theme/theme-toggle';
import { useLocation } from 'react-router-dom';
import { useDataStore } from '@/store/useDataStore';
import { FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const Navbar = () => {
  const location = useLocation();
  const { fileSlots } = useDataStore();
  
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

  // Render loaded files information
  const renderLoadedFiles = () => {
    const hasFiles = fileSlots.slot1 || fileSlots.slot2;

    if (!hasFiles) {
      return (
        <div className="flex items-center text-sm text-muted-foreground">
          <FileText className="h-4 w-4 mr-2" />
          No files loaded
        </div>
      );
    }

    return (
      <div className="flex items-center gap-3">
        {fileSlots.slot1 && (
          <Badge variant="secondary" className="flex items-center">
            <FileText className="h-3 w-3 mr-1" />
            File 1: {fileSlots.slot1.filename}
          </Badge>
        )}
        {fileSlots.slot1 && fileSlots.slot2 && (
          <Separator orientation="vertical" className="h-4" />
        )}
        {fileSlots.slot2 && (
          <Badge variant="secondary" className="flex items-center">
            <FileText className="h-3 w-3 mr-1" />
            File 2: {fileSlots.slot2.filename}
          </Badge>
        )}
      </div>
    );
  };

  return (
    <nav className="border-b bg-background fixed top-0 right-0 left-64 z-10">
      <div className="mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <span className="text-xl font-bold">{getPageTitle()}</span>
            <Separator orientation="vertical" className="h-6" />
            {renderLoadedFiles()}
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