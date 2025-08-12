import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AuthProvider } from './contexts/AuthContext.tsx' // 私たちが作った「大司令塔」をインポート！

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* AuthProviderという大司令塔で、アプリ全体を、丸ごと包む！ */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
)