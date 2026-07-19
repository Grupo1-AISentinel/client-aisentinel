import AppProviders from './providers/AppProviders.jsx';
import ErrorBoundary from '../shared/components/feedback/ErrorBoundary.jsx';
import AppRouter from './router/AppRouter.jsx';

const App = () => {
  return (
    <ErrorBoundary>
      <AppProviders>
        <AppRouter />
      </AppProviders>
    </ErrorBoundary>
  );
};

export default App;
