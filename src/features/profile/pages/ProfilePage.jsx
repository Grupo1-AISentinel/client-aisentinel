import { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldOff,
  KeyRound,
  Mail,
  User as UserIcon,
  Hash,
  Phone,
} from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../../../shared/components/layout/PageHeader.jsx';
import {
  Card,
  CardHeader,
  Button,
  Input,
  Badge,
  Skeleton,
  Modal,
} from '../../../shared/components/ui/index.js';
import OtpInput from '../../auth/components/OtpInput.jsx';
import { useAuthStore } from '../../auth/stores/authStore.js';
import { ROLE_LABELS } from '../../../shared/utils/constants.js';
import { authService } from '../../auth/services/authService.js';
import { twoFactorService } from '../services/twoFactorService.js';

const ProfilePage = () => {
  const user = useAuthStore((s) => s.user);
  const role = useAuthStore((s) => s.role);
  const [status, setStatus] = useState({ enabled: false, loading: true });
  const [qrUrl, setQrUrl] = useState(null);
  const [secretKey, setSecretKey] = useState(null);
  const [setupOpen, setSetupOpen] = useState(false);
  const [disableOpen, setDisableOpen] = useState(false);
  const [recoveryCodes, setRecoveryCodes] = useState(null);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const refreshStatus = async () => {
    setStatus((s) => ({ ...s, loading: true }));
    try {
      const result = await twoFactorService.getStatus();
      setStatus({ enabled: Boolean(result.isEnabled), loading: false });
    } catch {
      setStatus({ enabled: false, loading: false });
    }
  };

  useEffect(() => {
    refreshStatus();
    authService.fetchProfile().catch(() => {});
  }, []);

  const handleStartSetup = async () => {
    try {
      setActionLoading(true);
      const [setup, blobUrl] = await Promise.all([
        twoFactorService.setup(),
        twoFactorService.getQRCode(),
      ]);
      setSecretKey(setup.secretKey);
      setQrUrl(blobUrl);
      setSetupOpen(true);
      setCode('');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmSetup = async () => {
    if (code.length !== 6) {
      toast.error('Ingresa el código de 6 dígitos');
      return;
    }
    try {
      setLoading(true);
      await twoFactorService.verifyAndEnable(code);
      toast.success('2FA activado correctamente');
      setSetupOpen(false);
      setCode('');
      setQrUrl(null);
      setSecretKey(null);
      refreshStatus();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async () => {
    if (code.length !== 6) {
      toast.error('Ingresa el código de 6 dígitos');
      return;
    }
    try {
      setLoading(true);
      await twoFactorService.disable(code);
      toast.success('2FA desactivado');
      setDisableOpen(false);
      setCode('');
      refreshStatus();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    try {
      setActionLoading(true);
      const result = await twoFactorService.regenerateRecoveryCodes();
      setRecoveryCodes(result.recoveryCodes || result.codes || []);
      toast.success('Códigos regenerados. Guárdalos en un lugar seguro.');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div>
      <PageHeader
        title="Mi perfil"
        description="Tu información personal y la seguridad de tu cuenta."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-1">
          <div className="flex flex-col items-center text-center gap-3">
            <div className="w-20 h-20 rounded-full bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-300 font-display font-bold text-3xl font-mono">
              {user.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <p className="text-lg font-display font-semibold text-on-surface">
                {user.name} {user.surname}
              </p>
              <p className="text-sm text-on-surface-variant">@{user.username}</p>
            </div>
            <Badge variant="secondary">{ROLE_LABELS[role] || '—'}</Badge>
          </div>

          <dl className="mt-6 space-y-2 text-sm">
            <div className="flex items-center gap-2 text-on-surface-variant">
              <Mail className="w-4 h-4" />
              <span className="text-on-surface break-all">{user.email}</span>
            </div>
            <div className="flex items-center gap-2 text-on-surface-variant">
              <UserIcon className="w-4 h-4" />
              <span className="text-on-surface">
                {user.name} {user.surname}
              </span>
            </div>
            {user.phone && (
              <div className="flex items-center gap-2 text-on-surface-variant">
                <Phone className="w-4 h-4" />
                <span className="text-on-surface">{user.phone}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-on-surface-variant">
              <Hash className="w-4 h-4" />
              <span className="text-xs text-on-surface-dim break-all font-mono">{user.id}</span>
            </div>
          </dl>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader
            title="Verificación en dos pasos (2FA)"
            description="Añade una capa extra de seguridad a tu cuenta."
            action={
              status.loading ? (
                <Skeleton className="h-6 w-24" />
              ) : status.enabled ? (
                <Badge variant="success">Activado</Badge>
              ) : (
                <Badge variant="default">Desactivado</Badge>
              )
            }
          />

          {status.loading ? (
            <Skeleton className="h-32 w-full" />
          ) : status.enabled ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-surface-bright-2 rounded-md border border-white/5">
                <ShieldCheck className="w-5 h-5 text-success-bright" />
                <div>
                  <p className="text-sm font-semibold text-on-surface">2FA está activo</p>
                  <p className="text-xs text-on-surface-variant">
                    Tu cuenta pide un código extra en cada inicio de sesión.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="danger"
                  leftIcon={<ShieldOff className="w-4 h-4" />}
                  onClick={() => {
                    setDisableOpen(true);
                    setCode('');
                  }}
                >
                  Desactivar 2FA
                </Button>
                <Button
                  variant="secondary"
                  leftIcon={<KeyRound className="w-4 h-4" />}
                  onClick={handleRegenerate}
                  loading={actionLoading}
                >
                  Regenerar códigos de recuperación
                </Button>
              </div>
              {recoveryCodes && (
                <div className="mt-4 p-4 bg-surface-bright-2 rounded-md border border-white/5">
                  <p className="text-sm font-semibold text-on-surface mb-2">
                    Nuevos códigos de recuperación
                  </p>
                  <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                    {recoveryCodes.map((c) => (
                      <code
                        key={c}
                        className="px-2 py-1 bg-surface-3 rounded text-amber-300 border border-amber-400/20"
                      >
                        {c}
                      </code>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-on-surface-variant">
                Usa una aplicación autenticadora (Google Authenticator, Authy, 1Password) para
                generar códigos de un solo uso.
              </p>
              <Button
                variant="primary"
                leftIcon={<ShieldCheck className="w-4 h-4" />}
                onClick={handleStartSetup}
                loading={actionLoading}
              >
                Activar 2FA
              </Button>
            </div>
          )}
        </Card>
      </div>

      <Modal
        isOpen={setupOpen}
        onClose={() => {
          setSetupOpen(false);
          setCode('');
          setQrUrl(null);
        }}
        title="Activar 2FA"
        description="Escanea el QR con tu app y luego ingresa el código de 6 dígitos."
      >
        <div className="flex flex-col items-center gap-4">
          {qrUrl && (
            <div className="p-3 bg-white rounded-lg">
              <img src={qrUrl} alt="QR 2FA" className="w-48 h-48" />
            </div>
          )}
          {secretKey && (
            <div className="text-center w-full">
              <p className="text-xs text-on-surface-dim mb-1">O ingresa la clave manualmente:</p>
              <code className="block px-3 py-2 bg-surface-bright-2 rounded text-sm text-amber-300 border border-amber-400/20 break-all font-mono">
                {secretKey}
              </code>
            </div>
          )}
          <OtpInput value={code} onChange={setCode} disabled={loading} />
          <div className="flex justify-end gap-2 w-full">
            <Button variant="ghost" onClick={() => setSetupOpen(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirmSetup}
              loading={loading}
              disabled={code.length !== 6}
            >
              Confirmar y activar
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={disableOpen}
        onClose={() => {
          setDisableOpen(false);
          setCode('');
        }}
        title="Desactivar 2FA"
        description="Ingresa el código de tu aplicación para confirmar."
        size="sm"
      >
        <OtpInput value={code} onChange={setCode} disabled={loading} />
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="ghost" onClick={() => setDisableOpen(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={handleDisable}
            loading={loading}
            disabled={code.length !== 6}
          >
            Desactivar
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default ProfilePage;
