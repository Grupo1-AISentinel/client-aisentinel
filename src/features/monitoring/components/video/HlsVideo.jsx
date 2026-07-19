import { useImperativeHandle, useRef } from 'react';
import { useHlsPlayer } from '../../hooks/useHlsPlayer.js';
import VideoErrorPlaceholder, { VideoConnecting } from './VideoErrorPlaceholder.jsx';

const HlsVideo = ({ src, isActive = true, muted = true, mediaRef }) => {
  const videoRef = useRef(null);
  useImperativeHandle(mediaRef, () => videoRef.current);
  const { status, error, retry } = useHlsPlayer(videoRef, src);

  return (
    <>
      <video
        ref={videoRef}
        autoPlay={isActive}
        muted={muted}
        playsInline
        controls={false}
        className="absolute inset-0 w-full h-full object-cover bg-black"
      />
      {status === 'connecting' && <VideoConnecting message="Cargando stream…" />}
      {status === 'error' && <VideoErrorPlaceholder error={error} onRetry={retry} />}
    </>
  );
};

export default HlsVideo;
