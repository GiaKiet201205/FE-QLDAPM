const moneyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
})

const compactMoneyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  notation: 'compact',
  maximumFractionDigits: 1,
})

export function formatCurrency(value) {
  if (value == null || !Number.isFinite(Number(value))) return 'Chưa có dữ liệu'
  return moneyFormatter.format(Number(value))
}

export function formatCompactCurrency(value) {
  if (value == null || !Number.isFinite(Number(value))) return '—'
  return compactMoneyFormatter.format(Number(value))
}
