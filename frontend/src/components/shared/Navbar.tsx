// src/components/shared/Navbar.tsx
import { ThemeToggle } from '../theme/theme-toggle';
import { useLocation } from 'react-router-dom';
import { useDataStore } from '@/store/useDataStore';
import { FileText, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

const Navbar = () => {
  const location = useLocation();
  const { fileSlots, removeFileFromSlot } = useDataStore();
  
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
          <Badge variant="secondary" className="flex items-center gap-2">
            <FileText className="h-3 w-3" />
            File 1: {fileSlots.slot1.filename}
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-4 w-4 p-0 hover:bg-destructive/10"
              onClick={() => removeFileFromSlot(1)}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        )}
        {fileSlots.slot1 && fileSlots.slot2 && (
          <Separator orientation="vertical" className="h-4" />
        )}
        {fileSlots.slot2 && (
          <Badge variant="secondary" className="flex items-center gap-2">
            <FileText className="h-3 w-3" />
            File 2: {fileSlots.slot2.filename}
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-4 w-4 p-0 hover:bg-destructive/10"
              onClick={() => removeFileFromSlot(2)}
            >
              <X className="h-3 w-3" />
            </Button>
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