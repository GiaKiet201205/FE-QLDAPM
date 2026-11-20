export const courseImage = (course) => course.image || '/images/learning.jpg';
export const courseEntry = (course) => course.entry || 'Liên hệ trung tâm để được tư vấn đầu vào';
export const displayDate = (date) => new Date(`${date}T00:00:00+07:00`).toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
