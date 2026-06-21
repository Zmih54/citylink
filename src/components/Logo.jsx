import { Link } from 'react-router-dom'

export default function Logo({ className = '', compact = false }) {
  return (
    <Link to="/" className={`group inline-flex items-center gap-2.5 ${className}`} aria-label="CityLink — на головну">
      <span className="relative grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 shadow-glow">
        <svg viewBox="0 0 24 24" className="h-6 w-6 text-white" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 12a15 15 0 0 1 20 0" opacity="0.5" />
          <path d="M5 15a10 10 0 0 1 14 0" opacity="0.8" />
          <path d="M8.5 18a5 5 0 0 1 7 0" />
          <circle cx="12" cy="20.5" r="1.2" fill="currentColor" stroke="none" />
        </svg>
      </span>
      {!compact && (
        <span className="text-lg font-extrabold tracking-tight text-white">
          City<span className="gradient-text">Link</span>
        </span>
      )}
    </Link>
  )
}
