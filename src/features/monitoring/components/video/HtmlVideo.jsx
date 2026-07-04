import { useEffect, useImperativeHandle, useRef } from 'react';

// Los videos demo (subidos como stand-in de una camara) se ven ~1.2x mas
// rapidos que el ritmo de referencia del motor local (test_video.py, que
// pacea al ritmo de la inferencia ~22fps de un video de 30fps). 1/1.2 ≈ 0.83
// normaliza la reproduccion web a ese ritmo esperado. HtmlVideo SOLO se usa
// para la fuente 'video' (demo); las camaras reales usan Webcam/Hls/Mjpeg, que
// son tiempo-real y no deben ralentizarse.
const DEMO_PLAYBACK_RATE = 1 / 1.2;

const HtmlVideo = ({
  src,
  muted = true,
  autoplay = true,
  loop = true,
  isActive = true,
  mediaRef,
  playbackRate = DEMO_PLAYBACK_RATE,
}) => {
  const videoRef = useRef(null);

  useImperativeHandle(mediaRef, () => videoRef.current);

  useEffect(() => {
    if (!videoRef.current) return undefined;
    if (isActive && autoplay) {
      videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
    }
  }, [isActive, autoplay]);

  // playbackRate se resetea al cambiar src / recargar metadata, asi que lo
  // re-aplicamos en ambos casos.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return undefined;
    v.playbackRate = playbackRate;
    const onMeta = () => {
      v.playbackRate = playbackRate;
    };
    v.addEventListener('loadedmetadata', onMeta);
    return () => v.removeEventListener('loadedmetadata', onMeta);
  }, [src, playbackRate]);

  return (
    <video
      ref={videoRef}
      src={src}
      crossOrigin="anonymous"
      autoPlay={autoplay}
      loop={loop}
      muted={muted}
      playsInline
      className="absolute inset-0 w-full h-full object-cover bg-black"
    />
  );
};

export default HtmlVideo;
