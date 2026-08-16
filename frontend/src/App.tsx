import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AuthPage from './routes/auth';
import Dashboard from './routes/dashboard';
import Calls from './routes/calls';
import Leads from './routes/leads';
import Opportunities from './routes/opportunities';
import Outreach from './routes/outreach';
import Followups from './routes/followups';
import Discovery from './routes/discovery';
import Reports from './routes/reports';
import Settings from './routes/settings';
import AppLayout from './components/app-layout';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="calls" element={<Calls />} />
          <Route path="leads" element={<Leads />} />
          <Route path="opportunities" element={<Opportunities />} />
          <Route path="outreach" element={<Outreach />} />
          <Route path="followups" element={<Followups />} />
          <Route path="discovery" element={<Discovery />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
