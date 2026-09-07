import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'

function App() {
  return (
    <main className="app-shell">
      <p className="eyebrow">Borrower Copilot</p>
      <h1>Make a borrowing decision you can live with.</h1>
      <p className="intro">
        A clear view of what a lender may offer, what your budget can safely carry,
        and how to negotiate the difference.
      </p>
    </main>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
