import { useState } from 'react'

// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import './App.css'


function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <h1 onClick={() => setCount((prev) => ++prev)}>Vite + React {count}</h1>
    </>
  )
}

export default App
