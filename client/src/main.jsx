import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { PostHogProvider } from '@posthog/react'

const options = {
  api_host: 'https://eu.i.posthog.com',
  ui_host: 'https://eu.posthog.com',
  autocapture: true,
  capture_pageview: true,
  capture_pageleave: true,
  advanced_disable_feature_flags_on_first_load: true, // מעלים את שגיאת ה-401
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PostHogProvider apiKey="phc_kVgFHxKqfJZpmtJLg3zPUHzEpZyNHWDgprmkoYwoe9Ve" options={options}>
      <App />
    </PostHogProvider>
  </StrictMode>
)