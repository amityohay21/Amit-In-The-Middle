import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import posthog from 'posthog-js'
import { PostHogProvider } from '@posthog/react'

posthog.init('phc_nsj2h47LXXBoVMEHSZPWNUwaBjPvEG6dn55sqGVm6NtX', {
  api_host: 'https://eu.i.posthog.com',
  ui_host: 'https://eu.posthog.com',
  autocapture: true,
  capture_pageview: true,
  capture_pageleave: true,
  advanced_disable_feature_flags_on_first_load: true,
})

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