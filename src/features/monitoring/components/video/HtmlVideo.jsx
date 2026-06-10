import { useEffect, useImperativeHandle, useRef } from 'react';

const HtmlVideo = ({
  src,
  muted = true,
  autoplay = true,
  loop = true,
  isActive = true,
  mediaRef,
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
