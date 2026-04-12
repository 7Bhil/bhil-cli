export const REACT_PREMIUM_APP = (name) => `
import React, { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="premium-container">
      <nav className="navbar">
        <div className="logo">${name}</div>
        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#about">About</a>
        </div>
      </nav>

      <main className="hero">
        <div className="glass-card main-card">
          <div className="badge">Powered by bhil-cli</div>
          <h1>Welcome to <span className="gradient-text">${name}</span></h1>
          <p className="subtitle">
            Your high-performance project is ready. Created with style and precision.
          </p>
          
          <div className="counter-section">
            <button className="btn-primary" onClick={() => setCount((count) => count + 1)}>
              Count is {count}
            </button>
            <p className="hint">Edit <code>src/App.jsx</code> to start building</p>
          </div>
        </div>

        <div className="grid">
          <div className="glass-card feature">
            <h3>Fast Scaffolding</h3>
            <p>Built with Vite for ultra-fast development experience.</p>
          </div>
          <div className="glass-card feature">
            <h3>Premium Design</h3>
            <p>Glassmorphism UI components ready to use.</p>
          </div>
          <div className="glass-card feature">
             <h3>Ready to Scale</h3>
             <p>Organized structure for modern web applications.</p>
          </div>
        </div>
      </main>

      <footer className="creator-footer">
        <div className="glass-card footer-card">
          <div className="creator-info">
            <div className="creator-text">
              <span className="developed-by">Developed by</span>
              <span className="creator-name">Bhilal CHITOU</span>
            </div>
            <div className="social-links">
              <a href="https://github.com/7Bhil/" target="_blank" rel="noreferrer">GitHub</a>
              <a href="https://7bhil.github.io/Bhilal/" target="_blank" rel="noreferrer">Portfolio</a>
              <a href="https://www.linkedin.com/command/in/bhilal-chitou" target="_blank" rel="noreferrer">LinkedIn</a>
              <a href="mailto:7bhilal.chitou7@gmail.com">Email</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
`;

export const REACT_PREMIUM_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;800&display=swap');

:root {
  --primary: #8b5cf6;
  --primary-glow: rgba(139, 92, 246, 0.5);
  --bg: #030712;
  --glass: rgba(255, 255, 255, 0.03);
  --glass-border: rgba(255, 255, 255, 0.08);
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  background-color: var(--bg);
  color: #f3f4f6;
  overflow-x: hidden;
  min-height: 100vh;
}

.premium-container {
  min-height: 100vh;
  background: 
    radial-gradient(circle at 0% 0%, rgba(139, 92, 246, 0.15) 0%, transparent 40%),
    radial-gradient(circle at 100% 100%, rgba(59, 130, 246, 0.15) 0%, transparent 40%);
  display: flex;
  flex-direction: column;
}

.navbar {
  padding: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.logo {
  font-weight: 800;
  font-size: 1.5rem;
  letter-spacing: -0.05em;
  text-transform: uppercase;
}

.nav-links a {
  color: #9ca3af;
  text-decoration: none;
  margin-left: 2rem;
  font-size: 0.9rem;
  transition: color 0.3s;
}

.nav-links a:hover {
  color: white;
}

.hero {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.glass-card {
  background: var(--glass);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--glass-border);
  border-radius: 24px;
  padding: 3rem;
  transition: transform 0.3s, border-color 0.3s;
}

.main-card {
  text-align: center;
  max-width: 800px;
  margin-bottom: 4rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

.badge {
  display: inline-block;
  padding: 0.5rem 1rem;
  background: rgba(139, 92, 246, 0.1);
  border: 1px solid rgba(139, 92, 246, 0.2);
  border-radius: 100px;
  color: var(--primary);
  font-size: 0.75rem;
  font-weight: 600;
  margin-bottom: 2rem;
}

h1 {
  font-size: 4rem;
  font-weight: 800;
  letter-spacing: -0.04em;
  line-height: 1.1;
  margin-bottom: 1.5rem;
}

.gradient-text {
  background: linear-gradient(to right, #8b5cf6, #3b82f6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.subtitle {
  font-size: 1.25rem;
  color: #9ca3af;
  margin-bottom: 3rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.btn-primary {
  background: #8b5cf6;
  color: white;
  border: none;
  padding: 1rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 12px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 10px 20px -5px var(--primary-glow);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 30px -5px var(--primary-glow);
}

.hint {
  margin-top: 1.5rem;
  color: #4b5563;
  font-size: 0.85rem;
}

.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  width: 100%;
}

.feature {
  padding: 2rem;
}

.feature h3 {
  margin-bottom: 1rem;
  font-weight: 600;
}

.feature p {
  color: #9ca3af;
  font-size: 0.9rem;
  line-height: 1.6;
}

.creator-footer {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.footer-card {
  padding: 1.5rem 2rem;
}

.creator-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.creator-text {
  display: flex;
  flex-direction: column;
}

.developed-by {
  font-size: 0.7rem;
  color: #6b7280;
  text-transform: uppercase;
}

.creator-name {
  font-weight: 700;
  font-size: 1rem;
  color: white;
}

.social-links a {
  color: #9ca3af;
  text-decoration: none;
  font-size: 0.85rem;
  margin-left: 1.5rem;
  transition: color 0.3s;
}

.social-links a:hover {
  color: var(--primary);
}

@media (max-width: 768px) {
  h1 { font-size: 2.5rem; }
  .grid { grid-template-columns: 1fr; }
  .navbar { flex-direction: column; gap: 1rem; }
  .creator-info { flex-direction: column; gap: 1.5rem; text-align: center; }
  .social-links { margin-left: 0; }
  .social-links a { margin: 0 0.75rem; }
}
`;
