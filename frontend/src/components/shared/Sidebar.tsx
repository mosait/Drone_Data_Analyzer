// src/components/shared/Sidebar.tsx
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Table, 
  LineChart 
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();

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

  return (
    <div className="w-64 bg-card fixed h-screen border-r border-border">
      <div className="flex flex-col h-full">
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
                className={`${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent/10 hover:text-accent'
                } group flex flex-col px-3 py-2 rounded-md transition-colors`}
              >
                <div className="flex items-center">
                  <item.icon
                    className={`${
                      isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-accent'
                    } mr-3 flex-shrink-0 h-5 w-5 transition-colors`}
                  />
                  <span>{item.name}</span>
                </div>
                <span className="text-xs text-muted-foreground mt-1 ml-8">
                  {item.description}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;