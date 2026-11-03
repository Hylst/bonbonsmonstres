import React from 'react';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/75 p-3 sm:p-4 backdrop-blur-sm select-none">
      <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-pink-500/40 bg-slate-900 shadow-2xl shadow-pink-500/10">
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 p-4 sm:p-5 text-white">
          <div className="flex items-center gap-2.5">
            <span className="text-xl sm:text-2xl">ℹ️</span>
            <h2 className="text-lg sm:text-xl font-bold tracking-wide">Comment Bonbons Monstres a été fait</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-800 p-2 text-slate-400 hover:bg-slate-700 hover:text-white transition cursor-pointer"
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>

        <div className="overflow-y-auto p-4 sm:p-6 space-y-3.5 text-slate-300 text-xs sm:text-sm leading-relaxed">
          <p>
            <strong className="text-pink-400">Stack :</strong> React 19, TypeScript 5.9, Tailwind CSS 4, Vite 7, single-file HTML autonome.
          </p>
          <p>
            <strong className="text-pink-400">Graphismes :</strong> Interface rétro pixel art en haute résolution stylisée, sprites dessinés en matrices de pixels (yeux gélatineux, vers acides, squelettes, zombies).
          </p>
          <p>
            <strong className="text-pink-400">Musique &amp; sons :</strong> Synthèse Web Audio chiptune d ambiance de magasin (carillon de porte d entrée, pièces d or qui tintent, bruits de mastication).
          </p>
          <p>
            <strong className="text-pink-400">Interactions :</strong> Clics souris rapides ou taps mobiles sur les bocaux, validation des commandes, achats d améliorations de comptoir.
          </p>
          <p>
            <strong className="text-pink-400">Architecture :</strong> Game loop avec gestion de files d attente de clients monstres, gestion des stocks et chaudrons, arbre d upgrades économiques.
          </p>
          <p>
            <strong className="text-pink-400">Algorithmes notables :</strong> File d attente à patience dégressive avec seuils de pourboire, équilibrage de rentabilité des confiseries, tirage aléatoire des goûts des monstres.
          </p>
        </div>

        <div className="bg-slate-950 p-3 sm:p-4 text-center border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl font-bold text-white bg-pink-600 hover:bg-pink-500 transition cursor-pointer text-sm shadow-md"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
