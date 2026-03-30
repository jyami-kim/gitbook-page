import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import TableToChart from './components/public/TableToChart'
import TextFlow from './components/public/TextFlow'

function App() {
  return (
    <BrowserRouter basename="/gitbook-page">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/table-to-chart" element={<TableToChart />} />
        <Route path="/text-flow" element={<TextFlow />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
