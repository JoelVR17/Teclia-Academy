import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { ContentProvider } from './context/ContentContext.jsx';
import { Navbar } from './components/common/Navbar.jsx';
import { SessionToast, useSessionToast } from './components/common/SessionToast.jsx';
import { AppRoutes } from './routes/index.jsx';

const AppShell = () => {
  const { toast, showSessionExpiredToast, dismissToast } = useSessionToast();

  return (
    <AuthProvider onSessionExpiredToast={showSessionExpiredToast}>
      <ContentProvider>
        <Navbar />
        <SessionToast
          message={toast.message}
          visible={toast.visible}
          onDismiss={dismissToast}
        />
        <AppRoutes />
      </ContentProvider>
    </AuthProvider>
  );
};

function App() {
  return (
    <Router>
      <AppShell />
    </Router>
  );
}

export default App;
