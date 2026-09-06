'use client';

import { DocxView } from './DocxView';
import { infoSheetItems } from './data/infoSheet';

interface InformedConsentProps {
  onAccepted: () => void;
}

export default function InformedConsent({ onAccepted }: InformedConsentProps) {
  return (
    <div
      className="w-full min-h-screen flex items-start justify-center p-4 md:p-8 relative"
      style={{ background: 'radial-gradient(ellipse at 30% 50%, #545454 0%, #3d3d3d 60%, #3d3d3d 100%)' }}
    >
      <div
        className="ambient-glow"
        style={{
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(198,168,248,0.1) 0%, transparent 70%)',
          top: '10%',
          right: '5%',
        }}
      />

      <div className="max-w-3xl w-full relative z-10 py-10">
        <div className="glass-card p-6 md:p-8 mb-6">
          <DocxView items={infoSheetItems} />
        </div>

        <div className="flex justify-center pb-10">
          <button
            onClick={onAccepted}
            className="btn-gold text-base font-semibold inline-flex items-center gap-3"
          >
            <span>Continue</span>
            <span className="text-xs opacity-70 font-normal">繼續</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}