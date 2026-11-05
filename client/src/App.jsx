import { useEffect } from 'react'
import { usePostHog } from '@posthog/react'
import HomePage from "./pages/HomePage.jsx"

export default function App() {
  const posthog = usePostHog()

  useEffect(() => {
    if (posthog) {
      posthog.capture('$pageview')
    }
  }, [posthog])

  return <HomePage />
}