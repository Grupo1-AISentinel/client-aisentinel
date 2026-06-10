import { useImperativeHandle, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { useMjpegStream } from '../../hooks/useMjpegStream.js';

const MjpegVideo = ({ src, mediaRef }) => {
  const imgRef = useRef(null);
  useImperativeHandle(mediaRef, () => imgRef.current);
  const { status, error, imgSrc } = useMjpegStream(src);

  if (!src) return null;

  return (
    <>
      {imgSrc && (
        <img
          ref={imgRef}
          src={imgSrc}
          alt="MJPEG stream"
          crossOrigin="anonymous"
          className="absolute inset-0 w-full h-full object-cover bg-black"
        />
      )}
      {status === 'reconnecting' && (
        <div className="absolute inset-0 grid place-items-center bg-surface-overlay/60 text-on-surface text-xs">
          <div className="flex items-center gap-2 bg-surface-overlay/90 px-2 py-1 rounded-md">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            {error?.message || 'Reconectando…'}
          </div>
        </div>
      )}
    </>
  );
};

export default MjpegVideo;
