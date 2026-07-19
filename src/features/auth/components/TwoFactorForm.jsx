import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useTwoFactor } from '../hooks/useTwoFactor.js';
import { useAuthStore } from '../stores/authStore.js';
import OtpInput from './OtpInput.jsx';
import { Button } from '../../../shared/components/ui/index.js';
import { ArrowRight, AlertCircle, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const TwoFactorForm = () => {
  const navigate = useNavigate();
  const { loading, error, handleVerify } = useTwoFactor();
  const cancel = useAuthStore((s) => s.cancelTwoFactor);
  const [code, setCode] = useState('');

  const onSubmit = async (event) => {
    event.preventDefault();
    if (code.length !== 6) return;
    try {
      await handleVerify(code);
      navigate('/dashboard', { replace: true });
      toast.success('Verificación completada');
    } catch {
      setCode('');
    }
  };

  const handleCancel = () => {
    cancel();
    navigate('/login', { replace: true });
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6 w-full" noValidate>
      <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        <OtpInput value={code} onChange={setCode} error={Boolean(error)} disabled={loading} />
      </div>

      {error && (
        <div
          role="alert"
          className="text-sm text-error-bright bg-error/10 border border-error/30 rounded-md px-3.5 py-2.5 flex items-start gap-2.5 animate-fade-in"
        >
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden />
          <span>{error}</span>
        </div>
      )}

      <div className="flex flex-col gap-2 animate-fade-in-up" style={{ animationDelay: '320ms' }}>
        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={loading}
          disabled={code.length !== 6}
          fullWidth
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          {loading ? 'Verificando…' : 'Verificar código'}
        </Button>
        <button
          type="button"
          onClick={handleCancel}
          className="font-mono text-[11px] tracking-[0.16em] text-on-surface-variant hover:text-amber-300 transition-colors duration-200 py-2 inline-flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" aria-hidden />
          CANCELAR Y VOLVER
        </button>
      </div>
    </form>
  );
};

export default TwoFactorForm;
