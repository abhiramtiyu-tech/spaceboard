'use client'
// global-error.tsx MUST be 'use client'
// AND it must include its own <html> and <body> tags
// because when the root layout crashes, there is no layout —
// this file IS the entire page

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    // Must have html and body — no layout wraps this
    <html lang="en">
      <body>
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'system-ui, sans-serif',
            padding: '24px',
            background: '#04080f',
            color: '#ffffff',
          }}
        >
          <div style={{ textAlign: 'center', maxWidth: '400px' }}>

            {/* We use inline styles here — Tailwind may not load */}
            {/* if the root layout crashed, CSS imports may have failed too */}
            <p style={{ fontSize: '48px', marginBottom: '16px' }}>🛰️</p>

            <h1 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '8px' }}>
              Critical error
            </h1>

            <p style={{ fontSize: '14px', color: '#9ca3af', lineHeight: 1.6, marginBottom: '24px' }}>
              Spaceboard encountered an unrecoverable error. This has
              replaced the entire application — including the navigation.
            </p>

            <button
              onClick={reset}
              style={{
                fontSize: '14px',
                padding: '8px 20px',
                background: '#378ADD',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
            >
              Reload app
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}