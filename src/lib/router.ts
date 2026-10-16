// Hash router (PRD 4): every tool gets its own URL, e.g. #/convert.
import { useEffect, useState } from 'react'

const currentPath = (): string => {
  const h = window.location.hash
  return h.startsWith('#/') ? h.slice(1) : '/'
}

export const useHashRoute = (): [string, (path: string) => void] => {
  const [path, setPath] = useState(currentPath)
  useEffect(() => {
    const onChange = () => setPath(currentPath())
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  const navigate = (next: string) => {
    window.location.hash = `#${next}`
  }
  return [path, navigate]
}
