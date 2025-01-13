// src/components/shared/Sidebar.tsx
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Table, 
  LineChart,
  Upload,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog';
import { FileUpload } from './FileUpload';
import { ExportDialog } from './ExportDialog';
import { useDataStore } from '@/store/useDataStore';

const Sidebar = () => {
  const location = useLocation();
  const { uploadFile, selectedFile } = useDataStore();

  const navigation = [
    { 
      name: 'Dashboard', 
      href: '/', 
      icon: LayoutDashboard,
      description: 'File management and overview'
    },
    { 
      name: 'Data Table', 
      href: '/table', 
      icon: Table,
      description: 'View and filter raw data'
    },
    { 
      name: 'Analysis', 
      href: '/analysis', 
      icon: LineChart,
      description: 'Visualize and analyze data'
    }
  ];

  const handleFileUpload = async (file: File) => {
    try {
      await uploadFile(file);
    } catch (error) {
      console.error('Upload error:', error);
    }
  };

  return (
    <div className="w-64 bg-card fixed h-screen border-r border-border flex flex-col">
      <div className="flex items-center h-16 px-4 border-b border-border">
        <span className="text-xl font-bold text-primary">Drone Analytics</span>
      </div>
      
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`
                group flex px-3 py-3 rounded-md transition-colors
                ${isActive 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }
              `}
            >
              <div className="flex items-center w-full">
                <div className="flex-shrink-0 h-5 w-5">
                  <item.icon
                    className={`
                      h-full w-full transition-colors
                      ${isActive 
                        ? 'text-primary-foreground' 
                        : 'text-muted-foreground group-hover:text-accent-foreground'
                      }
                    `}
                  />
                </div>
                <div className="ml-3 flex flex-col -mt-1">
                  <span className="leading-none">{item.name}</span>
                  <span className={`
                    text-xs mt-1 transition-colors
                    ${isActive 
                      ? 'text-primary-foreground' 
                      : 'text-muted-foreground group-hover:text-accent-foreground'
                    }
                  `}>
                    {item.description}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom section with Import/Export buttons */}
      <div className="p-4 border-t border-border space-y-2">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Import Data
            </Button>
          </DialogTrigger>
          <DialogContent>
            <FileUpload
              onFileAccepted={handleFileUpload}
              maxSize={10}
              allowedTypes={['.csv', '.json']}
            />
          </DialogContent>
        </Dialog>

        <ExportDialog
          selectedFile={selectedFile}
          disabled={!selectedFile}
        />
      </div>
    </div>
  );
};

export default Sidebar;