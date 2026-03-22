import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles.css'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, color: 'red', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
          <h1>App Crashed</h1>
          <p>{String(this.state.error)}</p>
          <p>{this.state.error?.stack}</p>
        </div>
      )
    }
    return this.props.children
  }
}

try {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <ErrorBoundary>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ErrorBoundary>
    </React.StrictMode>
  )
} catch (e) {
  document.getElementById('root').innerHTML =
    '<div style="padding:40px;color:red;font-family:monospace"><h1>Init Error</h1><pre>' +
    e.message + '\n' + e.stack + '</pre></div>'
}
