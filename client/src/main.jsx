import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { PostHogProvider } from '@posthog/react' // הייבוא החדש והנקי[cite: 10]

// הגדרות בדיוק לפי המסך שלך[cite: 10]
const options = {
  api_host: import.meta.env.VITE_POSTHOG_HOST,
  defaults: '2026-08-30', // ציון גרסת ברירת מחדל[cite: 10]
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* העברת המפתח וההגדרות ישירות לפרובידר[cite: 10] */}
    <PostHogProvider apiKey={import.meta.env.VITE_POSTHOG_PROJECT_TOKEN} options={options}>
      <App />
    </PostHogProvider>
  </StrictMode>
)