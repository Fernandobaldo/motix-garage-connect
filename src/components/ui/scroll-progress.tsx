
import { useState, useEffect } from "react"

const ScrollProgress = () => {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const updateProgress = () => {
      const scrolled = window.scrollY
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      const progressPercent = (scrolled / maxScroll) * 100
      setProgress(Math.min(100, Math.max(0, progressPercent)))
    }

    window.addEventListener('scroll', updateProgress, { passive: true })
    updateProgress() // Initial calculation

    return () => window.removeEventListener('scroll', updateProgress)
  }, [])

  return (
    <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
      <div 
        className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}

export { ScrollProgress }
