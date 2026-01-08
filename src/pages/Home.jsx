import React from 'react'
import { Link } from 'react-router-dom'

export default function Home() {
  // Component registry - only public components listed here
  const publicComponents = [
    {
      id: 'table-to-chart',
      title: 'Table to Chart',
      description: 'Convert table data to interactive circle chart visualization',
      path: '/table-to-chart',
      tags: ['chart', 'visualization']
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      {/* Header */}
      <div className="container mx-auto px-6 py-12">
        <h1 className="text-5xl font-bold text-white text-center mb-4">
          jyami-page
        </h1>
        <p className="text-xl text-gray-300 text-center mb-12 max-w-2xl mx-auto">
          Claude로 만든 인터랙티브 컴포넌트 모음집
        </p>

        {/* Component Grid */}
        {publicComponents.length === 0 ? (
          // Empty state
          <div className="text-center py-20">
            <div className="text-gray-400 text-lg mb-2">
              아직 공개된 컴포넌트가 없습니다
            </div>
            <div className="text-gray-500 text-sm">
              곧 새로운 시각화 도구와 유틸리티가 추가될 예정입니다
            </div>
          </div>
        ) : (
          // Component cards
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {publicComponents.map(component => (
              <Link
                key={component.id}
                to={component.path}
                className="bg-gray-800 rounded-lg p-6 hover:bg-gray-750 transition-colors
                           border border-gray-700 hover:border-blue-500"
              >
                <h3 className="text-xl font-semibold text-white mb-2">
                  {component.title}
                </h3>
                <p className="text-gray-400 text-sm mb-4">
                  {component.description}
                </p>
                <div className="flex items-center text-blue-400 text-sm font-medium">
                  Open
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-20 text-center text-gray-400 text-sm">
          <p>Powered by React + Vite + Recharts</p>
        </div>
      </div>
    </div>
  )
}
