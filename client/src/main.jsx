import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { PostHogProvider } from '@posthog/react'

// הגדרות נקיות רק עם ה-Host הנכון
const options = {
  api_host: import.meta.env.VITE_POSTHOG_HOST,
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PostHogProvider apiKey={import.meta.env.VITE_POSTHOG_PROJECT_TOKEN} options={options}>
      <App />
    </PostHogProvider>
  </StrictMode>
)