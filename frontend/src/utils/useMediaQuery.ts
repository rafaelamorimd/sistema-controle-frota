import { useState, useEffect } from 'react'

export function useMediaQuery(strQuery: string): boolean {
  const [bolMatches, setBolMatches] = useState(false)

  useEffect(() => {
    const objMedia = window.matchMedia(strQuery)
    setBolMatches(objMedia.matches)

    const handleChange = (e: MediaQueryListEvent) => setBolMatches(e.matches)
    objMedia.addEventListener('change', handleChange)
    return () => objMedia.removeEventListener('change', handleChange)
  }, [strQuery])

  return bolMatches
}
