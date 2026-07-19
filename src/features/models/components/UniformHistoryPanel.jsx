import React from 'react';

export const UniformHistoryPanel = ({ uniforme }) => {
    return (
        <div className="absolute top-10 right-10 z-10 w-85 p-6 rounded-2xl bg-slate-900/40 backdrop-blur-md border border-yellow-500/20 shadow-2xl transition-all duration-500 ease-in-out">
            <span className="text-xs font-bold text-yellow-500 uppercase tracking-widest">Línea del Tiempo</span>
            <h2 className="text-4xl font-black mt-1 text-yellow-400">{uniforme.anio}</h2>
            <h3 className="text-lg font-bold mt-2 text-white">{uniforme.nombre}</h3>
            <p className="text-sm text-gray-300 mt-3 leading-relaxed">
                {uniforme.descripcion}
            </p>

            <div className="mt-5 pt-4 border-t border-gray-800/60 flex justify-between text-xs">
                <div>
                    <span className="text-gray-500 block mb-0.5">Tipo:</span>
                    <span className="text-gray-200 font-medium">{uniforme.tipo}</span>
                </div>
            </div>
        </div>
    );
};