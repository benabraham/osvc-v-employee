import { render } from 'preact'
import { App } from './app/app'
import { ServiceWorkerPrompt } from './app/pwa-register'
import './styles/main.css'

render(
  <>
    <App />
    <ServiceWorkerPrompt />
  </>,
  document.getElementById('app')!,
)
