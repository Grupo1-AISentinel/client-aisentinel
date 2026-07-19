import { getVideoUrl } from '../../cameras/camera.constants.js';
import HtmlVideo from './video/HtmlVideo.jsx';
import WebcamVideo from './video/WebcamVideo.jsx';
import HlsVideo from './video/HlsVideo.jsx';
import MjpegVideo from './video/MjpegVideo.jsx';
import VideoErrorPlaceholder from './video/VideoErrorPlaceholder.jsx';

const UnsupportedSource = ({ source }) => (
  <VideoErrorPlaceholder error={{ message: `Fuente "${source}" no soportada en el navegador.` }} />
);

const LocalVideoPlayer = ({ camera, isActive = true, mediaRef }) => {
  if (!camera) return null;

  const { source, sourceConfig } = camera;

  if (source === 'video') {
    const path = sourceConfig?.video?.path;
    if (!path) {
      return <VideoErrorPlaceholder error={{ message: 'Sin video seleccionado.' }} />;
    }
    return <HtmlVideo src={getVideoUrl(path)} isActive={isActive} mediaRef={mediaRef} />;
  }

  if (source === 'webcam') {
    const cfg = sourceConfig?.webcam || {};
    return (
      <WebcamVideo
        deviceId={cfg.deviceId}
        facingMode={cfg.facingMode}
        isActive={isActive}
        mediaRef={mediaRef}
      />
    );
  }

  if (source === 'ip') {
    const protocol = sourceConfig?.ip?.protocol;
    const url = sourceConfig?.ip?.url;
    if (!url) {
      return <VideoErrorPlaceholder error={{ message: 'URL de cámara IP no configurada.' }} />;
    }
    if (protocol === 'hls') return <HlsVideo src={url} isActive={isActive} mediaRef={mediaRef} />;
    if (protocol === 'mjpeg') return <MjpegVideo src={url} mediaRef={mediaRef} />;
    return (
      <VideoErrorPlaceholder
        error={{ message: 'Protocolo de cámara IP no soportado en el navegador.' }}
      />
    );
  }

  return <UnsupportedSource source={source} />;
};

export default LocalVideoPlayer;
