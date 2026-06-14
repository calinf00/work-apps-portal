import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          background: '#0f172a',
          borderRadius: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Briefcase handle */}
        <svg width="110" height="100" viewBox="0 0 110 100" fill="none">
          {/* Handle */}
          <path
            d="M38 42 L38 24 C38 14 45 8 54 8 L56 8 C65 8 72 14 72 24 L72 42"
            stroke="white"
            strokeWidth="9"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          {/* Body */}
          <rect x="8" y="42" width="94" height="54" rx="12" fill="white"/>
          {/* Center strap -->*/}
          <rect x="8" y="64" width="94" height="8" fill="#e2e8f0"/>
          {/* Clasp */}
          <rect x="42" y="60" width="26" height="16" rx="5" fill="#0f172a"/>
          <rect x="49" y="65" width="12" height="6" rx="3" fill="white" opacity="0.35"/>
        </svg>
      </div>
    ),
    size,
  )
}
