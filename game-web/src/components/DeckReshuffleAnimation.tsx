import { useEffect, useRef } from 'react';
import { useTranslation } from '../i18n/useTranslation';

interface DeckReshuffleAnimationProps {
  deckType: 'pearl' | 'character';
  /** Position (CSS, relativ zum Canvas-Container) */
  style?: React.CSSProperties;
  onDone: () => void;
}

const DURATION_MS = 1500;

const COLORS: Record<'pearl' | 'character', string> = {
  pearl: '#7dd3fc',
  character: '#c4b5fd',
};

export function DeckReshuffleAnimation({ deckType, style, onDone }: DeckReshuffleAnimationProps) {
  const { t } = useTranslation();
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    const timer = setTimeout(() => onDoneRef.current(), DURATION_MS);
    return () => clearTimeout(timer);
  }, [deckType]);

  const color = COLORS[deckType];
  const label = deckType === 'pearl' ? t('deck.reshufflingPearl') : t('deck.reshufflingCharacter');

  return (
    <div
      style={{
        position: 'absolute',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        padding: '10px 14px',
        borderRadius: 10,
        background: 'rgba(15,23,42,0.88)',
        border: `2px solid ${color}`,
        boxShadow: `0 0 16px ${color}88`,
        pointerEvents: 'none',
        zIndex: 30,
        animation: 'reshuffle-pulse 0.6s ease-in-out infinite alternate',
        ...style,
      }}
    >
      <style>{`
        @keyframes reshuffle-pulse {
          from { opacity: 0.75; transform: scale(0.97); }
          to   { opacity: 1;    transform: scale(1.03); }
        }
        @keyframes reshuffle-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>

      {/* Shuffle icon: three stacked card outlines rotating */}
      <div style={{ position: 'relative', width: 32, height: 32 }}>
        {[0, 1, 2].map(i => (
          <div
            key={i}
            style={{
              position: 'absolute',
              inset: 0,
              border: `2px solid ${color}`,
              borderRadius: 4,
              animation: `reshuffle-spin ${0.8 + i * 0.15}s linear infinite`,
              opacity: 0.6 + i * 0.2,
              transform: `rotate(${i * 15}deg)`,
            }}
          />
        ))}
      </div>

      <div
        style={{
          color,
          fontSize: 11,
          fontWeight: 700,
          textAlign: 'center',
          whiteSpace: 'pre-line',
          lineHeight: 1.3,
          letterSpacing: 0.3,
        }}
      >
        {label}
      </div>
    </div>
  );
}
