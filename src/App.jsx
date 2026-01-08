import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import TableToChart from './components/public/TableToChart'

function App() {
  return (
    <BrowserRouter basename="/gitbook-page">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/table-to-chart" element={<TableToChart />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
