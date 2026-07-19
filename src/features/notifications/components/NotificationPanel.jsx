import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { Check, X, Inbox } from 'lucide-react';
import { Button } from '../../../shared/components/ui/index.js';
import { notificationsApi } from '../../../shared/api/adminApi.js';
import { useNotificationStore } from '../stores/notificationStore.js';
import { NOTIFICATION_ICON, NOTIFICATION_TONE } from '../notifications.constants.js';
import { formatRelativeTime } from '../../../shared/utils/formatters.js';
import { cn } from '../../../shared/utils/cn.js';

const TONE_CLASS = {
  success: 'bg-success/20 text-success-bright border-success/30',
  error: 'bg-error/20 text-error-bright border-error/30',
  warning: 'bg-warning/20 text-warning-bright border-warning/30',
  info: 'bg-amber-400/20 text-amber-300 border-amber-400/30',
  default: 'bg-surface-container text-on-surface-variant border-white/15',
};

const NotificationItem = ({ notification, isRead }) => {
  const Icon = NOTIFICATION_ICON[notification.type] || NOTIFICATION_ICON.DEFAULT;
  const tone = NOTIFICATION_TONE[notification.type] || NOTIFICATION_TONE.DEFAULT;
  return (
    <li className="border-b border-white/5 last:border-b-0">
      <div
        className={cn(
          'flex items-start gap-3 px-4 py-3 hover:bg-white/5 transition-colors',
          isRead && 'opacity-55'
        )}
      >
        <div
          className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border',
            TONE_CLASS[tone] || TONE_CLASS.default
          )}
        >
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-on-surface truncate">{notification.title}</p>
          <p className="text-xs text-on-surface-variant line-clamp-2">{notification.message}</p>
          <p className="font-label text-[10px] text-on-surface-dim mt-1">
            {formatRelativeTime(notification.createdAt)}
          </p>
        </div>
      </div>
    </li>
  );
};

const NotificationPanel = ({ open, onClose }) => {
  const navigate = useNavigate();
  const items = useNotificationStore((s) => s.items);
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const lastReadAt = useNotificationStore((s) => s.lastReadAt);
  const markAllRead = useNotificationStore((s) => s.markAllRead);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return undefined;
    const onClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        const trigger = document.querySelector('[data-notifications-trigger]');
        if (trigger && trigger.contains(e.target)) return;
        onClose?.();
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open, onClose]);

  if (!open) return null;

  const handleMarkAll = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await notificationsApi.markAllRead();
      markAllRead();
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-label="Notificaciones"
      className="absolute right-0 top-full mt-2 w-[380px] max-w-[calc(100vw-2rem)] z-50 glass-panel-solid rounded-xl shadow-elevated border border-white/15 animate-slide-down overflow-hidden"
    >
      <header className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <p className="font-display text-sm font-semibold text-on-surface">Notificaciones</p>
          {unreadCount > 0 && (
            <span className="bg-secondary text-amber-900 text-[10px] font-label px-1.5 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <Button
              variant="subtle"
              size="xs"
              leftIcon={<Check className="w-3 h-3" />}
              onClick={handleMarkAll}
              loading={loading}
            >
              Marcar leídas
            </Button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-on-surface-variant hover:text-on-surface hover:bg-white/5"
            aria-label="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="max-h-[420px] overflow-y-auto">
        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-2 p-8 text-center">
            <Inbox className="w-8 h-8 text-on-surface-dim" />
            <p className="text-sm text-on-surface">Sin notificaciones</p>
            <p className="text-xs text-on-surface-dim">Eventos del sistema aparecerán aquí.</p>
          </div>
        ) : (
          <ul>
            {items.map((n) => {
              const isRead = lastReadAt && new Date(n.createdAt) <= new Date(lastReadAt);
              return <NotificationItem key={n._id} notification={n} isRead={isRead} />;
            })}
          </ul>
        )}
      </div>

      <footer className="px-4 py-2 border-t border-white/10 text-center">
        <button
          type="button"
          onClick={() => {
            onClose?.();
            navigate('/notifications');
          }}
          className="font-label text-[10px] text-secondary hover:text-secondary-fixed"
        >
          Ver todas →
        </button>
      </footer>
    </div>
  );
};

export default NotificationPanel;
