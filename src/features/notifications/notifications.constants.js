import {
  Bell,
  Camera,
  CameraOff,
  Cog,
  AlertOctagon,
  Play,
  Pause,
  Server,
  ServerOff,
} from 'lucide-react';

export const NOTIFICATION_ICON = {
  CAMERA_ONLINE: Camera,
  CAMERA_OFFLINE: CameraOff,
  CONFIG_CHANGED: Cog,
  INFRACTION_CYCLE_COMPLETED: AlertOctagon,
  INSPECTION_STARTED: Play,
  INSPECTION_STOPPED: Pause,
  PYIMAGE_ONLINE: Server,
  PYIMAGE_OFFLINE: ServerOff,
  DEFAULT: Bell,
};

export const NOTIFICATION_TONE = {
  CAMERA_ONLINE: 'success',
  CAMERA_OFFLINE: 'warning',
  CONFIG_CHANGED: 'info',
  INFRACTION_CYCLE_COMPLETED: 'error',
  INSPECTION_STARTED: 'success',
  INSPECTION_STOPPED: 'default',
  PYIMAGE_ONLINE: 'success',
  PYIMAGE_OFFLINE: 'error',
  DEFAULT: 'default',
};
