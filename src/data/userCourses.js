export const coursePrice = (amount) => amount == null ? 'Liên hệ học phí' : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(amount);
