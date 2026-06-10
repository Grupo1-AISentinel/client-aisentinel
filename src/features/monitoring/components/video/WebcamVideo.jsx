import { useEffect, useImperativeHandle, useRef } from 'react';
import { useMediaStream } from '../../hooks/useMediaStream.js';
import VideoErrorPlaceholder, { VideoConnecting } from './VideoErrorPlaceholder.jsx';

const WebcamVideo = ({ deviceId, facingMode, isActive = true, muted = true, mediaRef }) => {
  const videoRef = useRef(null);

  useImperativeHandle(mediaRef, () => videoRef.current);

  const { stream, status, error, retry } = useMediaStream({
    deviceId,
    facingMode,
    enabled: isActive,
  });

  useEffect(() => {
    if (!videoRef.current) return;
    if (videoRef.current.srcObject !== stream) {
      videoRef.current.srcObject = stream || null;
    }
  }, [stream]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;
    if (isActive) video.play().catch(() => {});
    else video.pause();
    return () => {};
  }, [isActive]);

  return (
    <>
      <video
        ref={videoRef}
        autoPlay
        muted={muted}
        playsInline
        className="absolute inset-0 w-full h-full object-cover bg-black"
      />
      {status === 'connecting' && <VideoConnecting message="Solicitando cámara…" />}
      {status === 'error' && <VideoErrorPlaceholder error={error} onRetry={retry} />}
    </>
  );
};

export default WebcamVideo;
