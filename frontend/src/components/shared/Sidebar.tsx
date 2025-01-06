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
      </div>
    </div>
  );
};

export default Sidebar;