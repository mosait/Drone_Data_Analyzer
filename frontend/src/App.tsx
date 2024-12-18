// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './components/theme/theme-provider';
import Layout from './components/shared/Layout';
import Dashboard from './features/dashboard/Dashboard';
import DataTable from './features/data-table/DataTable';
import Analysis from './features/analysis/Analysis';

const queryClient = new QueryClient();

function App() {
  return (
    <ThemeProvider defaultTheme="system">
      <QueryClientProvider client={queryClient}>
        <Router>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="table" element={<DataTable />} />
              <Route path="analysis" element={<Analysis />} />
            </Route>
          </Routes>
        </Router>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
