import { ThemeProvider } from './context/ThemeContext';
import AppRoutes from './AppRoutes';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <ErrorBoundary>
        <AppRoutes />
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;
