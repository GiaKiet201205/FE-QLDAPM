import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-6 p-6">
      <h1 className="text-3xl font-bold text-gray-800">
        🚀 Đồ án của bạn đã sẵn sàng!
      </h1>
      <p className="text-gray-500">
        React + Vite + Tailwind CSS đã được cấu hình xong.
      </p>
      <button
        onClick={() => setCount((c) => c + 1)}
        className="px-5 py-2.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors"
      >
        Đếm: {count}
      </button>
    </div>
  )
}

export default App
