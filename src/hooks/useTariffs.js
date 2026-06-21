import { useEffect, useState } from 'react'
import { fetchTariffs } from '../lib/api.js'
import { rates as staticRates } from '../data/site.js'

// Public tariffs from Supabase, with the static `site.js` list as a fallback
// (offline, missing backend, or fetch error) so public pages always render.
export function useTariffs() {
  const [tariffs, setTariffs] = useState(staticRates)
  const [loading, setLoading] = useState(true)
  const [fromDb, setFromDb] = useState(false)

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const data = await fetchTariffs()
        if (alive && data && data.length) {
          setTariffs(data)
          setFromDb(true)
        }
      } catch {
        /* keep static fallback */
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => { alive = false }
  }, [])

  return { tariffs, loading, fromDb }
}
