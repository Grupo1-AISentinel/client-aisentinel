import { Sparkles } from 'lucide-react';

const Loading3D = ({ message = 'Cargando modelo 3D...' }) => {
  return (
    <div className="absolute inset-0 z-10 grid place-items-center bg-surface-container-lowest/95 backdrop-blur-sm rounded-xl">
      <div className="flex flex-col items-center gap-3">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-2 border-secondary/20 border-t-secondary animate-spin" />
          <Sparkles className="w-5 h-5 text-secondary absolute inset-0 m-auto animate-pulse" />
        </div>
        <p className="font-label text-[10px] uppercase tracking-wider text-on-surface-variant">
          {message}
        </p>
      </div>
    </div>
  );
};

export default Loading3D;
