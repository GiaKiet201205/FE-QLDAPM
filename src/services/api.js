// Cấu hình gọi API tập trung tại đây
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

export async function apiRequest(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}
