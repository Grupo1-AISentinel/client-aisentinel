import { Toaster } from 'react-hot-toast';
import IdleTimerProvider from './IdleTimerProvider.jsx';

const AppProviders = ({ children }) => {
  return (
    <IdleTimerProvider>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--color-surface-bright)',
            color: 'var(--color-on-surface)',
            border: '1px solid var(--color-outline-soft)',
            borderRadius: 'var(--radius-md)',
            fontSize: '14px',
          },
          success: {
            iconTheme: {
              primary: 'var(--color-success-bright)',
              secondary: 'var(--color-surface)',
            },
          },
          error: {
            iconTheme: { primary: 'var(--color-error-bright)', secondary: 'var(--color-surface)' },
          },
        }}
      />
    </IdleTimerProvider>
  );
};

export default AppProviders;
