import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import posthog from 'posthog-js'
import { PostHogProvider } from '@posthog/react'

// אתחול ישיר לפי הדוקומנטציה של React
posthog.init('phc_kVgFHxKqfJZpmtJLg3zPUHzEpZyNHWDgprmkoYwoe9Ve', {
  api_host: 'https://eu.i.posthog.com',
  ui_host: 'https://eu.posthog.com',
  autocapture: true,
  capture_pageview: true,
  capture_pageleave: true,
  advanced_disable_feature_flags_on_first_load: true,
})

// חושף את פוסטהוג לחלון כדי שנוכל לבדוק אותו ב-Console
if (typeof window !== 'undefined') {
  window.posthog = posthog
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PostHogProvider client={posthog}>
      <App />
    </PostHogProvider>
  </StrictMode>
)