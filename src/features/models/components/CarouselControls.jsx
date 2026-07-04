import React from 'react';

export const CarouselControls = ({ total, actual, onNext, onPrev }) => {
    return (
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-10 flex items-center gap-6 bg-slate-900/70 px-6 py-3 rounded-full border border-yellow-500/20 backdrop-blur-sm shadow-xl">
            <button
                onClick={onPrev}
                className="text-gray-400 hover:text-yellow-400 transition-colors text-xl font-bold p-1 select-none"
            >
                &larr;
            </button>

            <span className="text-sm font-semibold tracking-widest text-yellow-500 select-none">
                {actual + 1} / {total}
            </span>

            <button
                onClick={onNext}
                className="text-gray-400 hover:text-yellow-400 transition-colors text-xl font-bold p-1 select-none"
            >
                &rarr;
            </button>
        </div>
    );
};