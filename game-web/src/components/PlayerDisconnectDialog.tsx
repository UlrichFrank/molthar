import React from 'react';
import { useTranslation } from '../i18n/useTranslation';

interface PlayerDisconnectDialogProps {
  playerName: string;
}

export function PlayerDisconnectDialog({ playerName }: PlayerDisconnectDialogProps) {
  const { t } = useTranslation();
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 300,
      background: 'rgba(0,0,0,0.75)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: '#0f1e2e', border: '1px solid #334155',
        borderRadius: 16, padding: '2rem 2.5rem',
        minWidth: 280, maxWidth: 380,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '2.5rem', animation: 'spin 2s linear infinite' }}>
          ⏳
        </div>
        <div style={{ color: '#f1f5f9', fontSize: '1.1rem', fontWeight: 600 }}>
          {t('disconnect.waiting', { name: playerName })}
        </div>
        <div style={{ color: '#64748b', fontSize: '0.85rem' }}>
          {t('disconnect.connectionLost')}
        </div>
      </div>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
