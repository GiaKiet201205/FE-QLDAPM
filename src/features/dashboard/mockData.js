// Du lieu mau de demo giao dien - sau nay thay bang goi API that qua services/api.js

export function getDashboardData(roleKey) {
  const base = {
    TEACHER: {
      stats: [
        { label: 'LỚP PHỤ TRÁCH', value: '4', trend: '+1 kỳ này', trendUp: true },
        { label: 'HỌC VIÊN', value: '86', trend: '92% điểm danh', trendUp: true },
        { label: 'BÀI CHỜ CHẤM', value: '12', trend: '3 quá hạn', trendUp: false },
        { label: 'BUỔI DẠY TUẦN NÀY', value: '9', trend: '2 buổi tối nay', trendUp: true },
      ],
      tableTitle: 'Lịch dạy hôm nay',
      tableColumns: ['Giờ', 'Lớp', 'Phòng', 'Sĩ số', 'Trạng thái', ''],
      tableRows: [
        ['08:30 - 10:30', 'TOEIC 850 Intensive', 'Room 302', '22/24', 'Confirmed', 'Manage'],
        ['14:00 - 16:00', 'IELTS Foundation 6.5', 'Room 302', '19/20', 'In Progress', 'Live Roster'],
        ['18:30 - 20:30', 'IELTS Mastery 7.5', 'Room 302', '18/20', 'Confirmed', 'Manage'],
      ],
      activities: [
        { text: 'Bạn đã chấm điểm bài kiểm tra IELTS Mastery 7.5', time: '12 phút trước' },
        { text: 'Học viên Lê Hoàng Nam nộp bài tập TOEIC 850', time: '35 phút trước' },
        { text: 'Lịch dạy thứ 5 tuần 43 đã được TC xác nhận', time: '1 giờ trước' },
      ],
      panelTitle: 'Việc cần làm',
      panelItems: [
        { label: 'Chấm 5 bài KT TOEIC 850', due: 'Hạn 17:00', urgent: true },
        { label: 'Nhận xét học viên lớp IELTS Mastery', due: 'Hạn cuối tuần', urgent: false },
      ],
    },
    TC: {
      stats: [
        { label: 'GIÁO VIÊN HOẠT ĐỘNG', value: '28', trend: '100% roster', trendUp: true },
        { label: 'LỊCH CHƯA PHÂN CÔNG', value: '6', trend: '2 gấp', trendUp: false },
        { label: 'XUNG ĐỘT LỊCH', value: '1', trend: 'Cần xử lý', trendUp: false },
        { label: 'GIỜ DẠY TUẦN NÀY', value: '312h', trend: '+4.2% vs tuần trước', trendUp: true },
      ],
      tableTitle: 'Lịch dạy cần phân công',
      tableColumns: ['Lớp', 'Khung giờ', 'Giáo viên đề xuất', 'Phòng', 'Trạng thái', ''],
      tableRows: [
        ['SAT Math Advanced', '08:30 - 11:00', 'Sarah Jenkins', 'Room 204', 'Chờ duyệt', 'Phân công'],
        ['Business English Corp', '14:30 - 16:30', 'Helena Costa', 'Room 101', 'Chờ duyệt', 'Phân công'],
        ['TOEFL iBT Complete', '18:30 - 20:30', 'Robert Taylor', 'Room 205', 'Xung đột', 'Xem lỗi'],
      ],
      activities: [
        { text: 'David Miller cập nhật lịch rảnh tuần 43', time: '20 phút trước' },
        { text: 'Bạn phân công Sarah Jenkins vào SAT Math Advanced', time: '1 giờ trước' },
        { text: 'Phát hiện trùng lịch: Robert Taylor 18:30 hai lớp', time: '2 giờ trước' },
      ],
      panelTitle: 'Cảnh báo lịch',
      panelItems: [
        { label: 'Robert Taylor trùng lịch 18:30', due: 'Cần xử lý ngay', urgent: true },
        { label: '6 lịch dạy chưa có giáo viên', due: 'Trong tuần', urgent: true },
      ],
    },
    CM: {
      stats: [
        { label: 'SALE / CS HOẠT ĐỘNG', value: '15', trend: '100% roster', trendUp: true },
        { label: 'CA CHƯA PHÂN CÔNG', value: '4', trend: 'Tuần này', trendUp: false },
        { label: 'XUNG ĐỘT CA', value: '0', trend: 'Ổn định', trendUp: true },
        { label: 'GIỜ LÀM TUẦN NÀY', value: '186h', trend: '+2.1% vs tuần trước', trendUp: true },
      ],
      tableTitle: 'Ca làm việc hôm nay',
      tableColumns: ['Ca', 'Khung giờ', 'Nhân sự', 'Vị trí', 'Trạng thái', ''],
      tableRows: [
        ['Ca sáng', '07:30 - 15:30', 'Tran Minh Anh', 'Front Desk 1', 'Đang làm', 'Xem'],
        ['Ca sáng', '07:30 - 15:30', 'Le Quoc Huy', 'Desk 2', 'Đang làm', 'Xem'],
        ['Ca chiều', '15:30 - 21:00', 'Chưa phân công', '—', 'Trống', 'Phân công'],
      ],
      activities: [
        { text: 'Bạn phân công Le Quoc Huy vào ca sáng Desk 2', time: '35 phút trước' },
        { text: 'Tran Minh Anh đăng ký lịch rảnh tuần 43', time: '2 giờ trước' },
        { text: 'Ca chiều thứ 6 vẫn còn trống nhân sự', time: '3 giờ trước' },
      ],
      panelTitle: 'Cần xử lý',
      panelItems: [
        { label: 'Ca chiều thứ 6 chưa có người', due: 'Cần trước 15:00', urgent: true },
        { label: 'Duyệt lịch rảnh tuần 43', due: 'Hạn cuối ngày', urgent: false },
      ],
    },
    SALE: {
      stats: [
        { label: 'CA TUẦN NÀY', value: '5', trend: 'Đủ chỉ tiêu', trendUp: true },
        { label: 'GIỜ ĐÃ ĐĂNG KÝ', value: '32h', trend: 'Tuần 43', trendUp: true },
        { label: 'CA ĐÃ ĐƯỢC DUYỆT', value: '5/5', trend: '100%', trendUp: true },
        { label: 'CA HÔM NAY', value: '1', trend: '07:30 - 15:30', trendUp: true },
      ],
      tableTitle: 'Lịch làm việc được phân công',
      tableColumns: ['Ngày', 'Ca', 'Vị trí', 'Trạng thái', '', ''],
      tableRows: [
        ['14/10', 'Sáng (07:30-15:30)', 'Front Desk 1', 'Đã xác nhận', '—', 'Xem'],
        ['15/10', 'Chiều (15:30-21:00)', 'Front Desk 2', 'Đã xác nhận', '—', 'Xem'],
        ['16/10', 'Sáng (07:30-15:30)', 'Front Desk 1', 'Chờ duyệt', '—', 'Xem'],
      ],
      activities: [
        { text: 'Bạn đăng ký lịch rảnh cho tuần 44', time: '1 giờ trước' },
        { text: 'CM đã duyệt ca sáng 14/10', time: '3 giờ trước' },
      ],
      panelTitle: 'Nhắc việc',
      panelItems: [
        { label: 'Đăng ký lịch rảnh tuần 44', due: 'Hạn thứ 6', urgent: false },
      ],
    },
    CS: {
      stats: [
        { label: 'LỚP ĐANG HỖ TRỢ', value: '6', trend: '2 hôm nay', trendUp: true },
        { label: 'CA TUẦN NÀY', value: '5', trend: 'Đủ chỉ tiêu', trendUp: true },
        { label: 'LỚP CẦN CẬP NHẬT', value: '2', trend: 'Thiếu dữ liệu', trendUp: false },
        { label: 'CA HÔM NAY', value: '1', trend: '08:30 - 16:30', trendUp: true },
      ],
      tableTitle: 'Lớp đang vận hành',
      tableColumns: ['Mã lớp', 'Tên lớp', 'Phòng', 'Sĩ số', 'Trạng thái', ''],
      tableRows: [
        ['TOEIC-850', 'TOEIC 850 Intensive', 'Room 302', '22/24', 'Đang học', 'Cập nhật'],
        ['SAT-ADV-03', 'SAT Math Advanced', 'Room 204', '14/15', 'Đang học', 'Cập nhật'],
        ['IELTS-F05', 'IELTS Foundation 6.5', 'Room 302', '19/20', 'Thiếu dữ liệu GV', 'Bổ sung'],
      ],
      activities: [
        { text: 'Bạn cập nhật sĩ số lớp TOEIC 850 Intensive', time: '20 phút trước' },
        { text: 'Lớp SAT Math Advanced đổi sang Room 204', time: '1 giờ trước' },
      ],
      panelTitle: 'Cần bổ sung',
      panelItems: [
        { label: 'IELTS Foundation 6.5 thiếu dữ liệu GV', due: 'Trước buổi tối', urgent: true },
      ],
    },
    ADMIN: {
      stats: [
        { label: 'ACTIVE STUDENTS', value: '1,248', trend: '+4.2% vs last term', trendUp: true },
        { label: 'ACTIVE CLASSES', value: '32', trend: '88% room utilization', trendUp: true },
        { label: 'ACTIVE TEACHERS', value: '28', trend: '100% roster coverage', trendUp: true },
        { label: "TODAY'S SESSIONS", value: '16', trend: '4 Morning · 6 Afternoon · 6 Evening', trendUp: true },
      ],
      tableTitle: 'Lịch hoạt động hôm nay',
      tableColumns: ['Giờ', 'Lớp', 'Giáo viên', 'Phòng', 'Trạng thái', ''],
      tableRows: [
        ['08:30 - 10:30', 'TOEIC 850 Intensive', 'David Miller', 'Room 302', 'Confirmed', 'Manage'],
        ['14:00 - 16:00', 'IELTS Foundation 6.5', 'David Miller', 'Room 302', 'In Progress', 'Live Roster'],
        ['18:30 - 20:30', 'IELTS Mastery 7.5', 'David Miller', 'Room 302', 'Confirmed', 'Manage'],
      ],
      activities: [
        { text: 'Le Hoang Nam enrolled in IELTS Mastery 7.5', time: '12 phút trước' },
        { text: 'SAT Advanced moved to Room 204', time: '35 phút trước' },
        { text: 'David Miller approved for Week 42 shifts', time: '1 giờ trước' },
        { text: 'Nguyen Van An promoted to Senior Teacher', time: '3 giờ trước' },
      ],
      panelTitle: 'Urgent action items',
      panelItems: [
        { label: 'Room 201 AV inspection', due: 'Due 12:00', urgent: true },
        { label: 'Faculty availability submissions', due: 'Due 17:00', urgent: false },
      ],
    },
  }

  return base[roleKey] || base.ADMIN
}
