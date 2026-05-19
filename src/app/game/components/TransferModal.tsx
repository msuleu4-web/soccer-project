'use client';

import type { TransferOffer } from '../types/game';
import { LEAGUES } from '../lib/leagueData';
import { getLeagueIcon } from '../lib/gameEngine';

interface Props {
  offers: TransferOffer[];
  currentSalary: number;
  onAccept: (offer: TransferOffer) => void;
  onDecline: () => void;
}

export default function TransferModal({ offers, currentSalary, onAccept, onDecline }: Props) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="gl-card max-w-md w-full max-h-[90vh] overflow-y-auto animate-slide-up">
        <h2 className="text-xl font-bold text-text-primary mb-1">シーズン終了</h2>
        <p className="text-text-secondary text-sm mb-4">移籍ウィンドウが開きました。オファーを確認してください。</p>

        {offers.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-text-secondary text-sm mb-2">現在オファーはありません</p>
            <p className="text-text-secondary text-xs">OVRを上げると移籍オファーが届きます。</p>
          </div>
        ) : (
          <div className="space-y-3 mb-4">
            {offers.map((offer, idx) => (
              <div
                key={idx}
                className="border border-gray-600 rounded-lg p-3 animate-slide-in"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-bold text-text-primary">{offer.team.name}</p>
                    <p className="text-xs text-text-secondary">
                      {getLeagueIcon(offer.team.league)} {LEAGUES[offer.team.league].name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-[var(--color-accent)]">
                      週給 {offer.salary}万円
                    </p>
                    {offer.salary > currentSalary && (
                      <p className="text-xs text-green-400">
                        +{offer.salary - currentSalary}万円 UP
                      </p>
                    )}
                  </div>
                </div>
                <p className="text-xs text-text-secondary italic mb-3">&ldquo;{offer.message}&rdquo;</p>
                <button
                  onClick={() => onAccept(offer)}
                  className="gl-btn gl-btn-accent w-full text-sm"
                  style={{ minHeight: '44px' }}
                >
                  承諾する →
                </button>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={onDecline}
          className="w-full py-3 border border-gray-600 rounded-lg text-sm text-text-secondary hover:border-gray-400 hover:text-text-primary transition-all"
          style={{ minHeight: '44px' }}
        >
          残留する（モラル+10）
        </button>
      </div>
    </div>
  );
}
