
export const ROLES = {
  TEACHER: {
    key: 'TEACHER',
    label: 'Giáo viên',
    shortLabel: 'GV',
    color: '#3B82F6',
    sections: [
      {
        title: 'Chính',
        items: [{ label: 'Dashboard', path: '/', icon: 'LayoutDashboard' }],
      },
      {
        title: 'Lịch của tôi',
        items: [
          { label: 'Đăng ký lịch rảnh', path: '/availability/register', icon: 'CalendarPlus' },
          // { label: 'Cập nhật lịch rảnh', path: '/availability/update', icon: 'CalendarClock' },
          { label: 'Lịch dạy', path: '/teaching-schedule', icon: 'CalendarDays' },
        ],
      },
      {
        title: 'Lớp phụ trách',
        items: [
          { label: 'Lớp được phân công', path: '/my-classes', icon: 'School' },
          { label: 'Danh sách học viên', path: '/students', icon: 'Users' },
        ],
      },
      {
        title: 'Giảng dạy',
        items: [
          // { label: 'Giao bài tập', path: '/assignments', icon: 'FileEdit' },
          // { label: 'Giao bài kiểm tra', path: '/tests', icon: 'ClipboardList' },
          // { label: 'Chấm điểm', path: '/grading', icon: 'CheckSquare' },
          // { label: 'Đánh giá học viên', path: '/student-reviews', icon: 'Star' },
          // { label: 'Theo dõi kết quả lớp', path: '/class-results', icon: 'BarChart3' },
{ label: 'Xem công lương', path: '/monitor/payroll', icon: 'Wallet', meta: { page: 'payroll', permission: 'view', scope: 'teacher' } },        ],
      },
    ],
  },

  TC: {
    key: 'TC',
    label: 'Teaching Coordinator',
    shortLabel: 'TC',
    color: '#8B5CF6',
    sections: [
      {
        title: 'Chính',
        items: [{ label: 'Dashboard', path: '/', icon: 'LayoutDashboard' }],
      },
      {
        title: 'Quản lý Giáo viên',
        items: [
          { label: 'Danh sách Giáo viên', path: '/teachers', icon: 'Users' },
          // { label: 'Hồ sơ Giáo viên', path: '/teachers/profiles', icon: 'IdCard' },
          { label: 'Lịch rảnh Giáo viên', path: '/teachers/availability', icon: 'CalendarSearch' },
        ],
      },
      {
        title: 'Phân công',
        items: [
          { label: 'Phân công Giáo viên', path: '/assign-teacher', icon: 'UserCheck' },
          // { label: 'Tạo / phân công lịch dạy', path: '/schedule/create', icon: 'CalendarPlus' },
          { label: 'Điều chỉnh lịch dạy', path: '/schedule/adjust', icon: 'CalendarClock' },
          // { label: 'Kiểm tra trùng lịch', path: '/schedule/conflicts', icon: 'AlertTriangle' },
          { label: 'Theo dõi lịch giảng dạy', path: '/schedule/overview', icon: 'CalendarDays' },
        ],
      },
      {
        title: 'Công lương',
        items: [
          // { label: 'Khối lượng giảng dạy', path: '/workload', icon: 'Gauge' },
{ label: 'Quản lý công lương GV', path: '/payroll', icon: 'Gauge', meta: { page: 'payroll', permission: 'manage', scope: 'teacher' } },
{ label: 'Xem công lương', path: '/payroll/history', icon: 'Wallet', meta: { page: 'payroll', permission: 'view', scope: 'teacher' } },
        ],
      },
    ],
  },

  CM: {
    key: 'CM',
    label: 'Center Management',
    shortLabel: 'CM',
    color: '#F59E0B',
    sections: [
      {
        title: 'Chính',
        items: [{ label: 'Dashboard', path: '/', icon: 'LayoutDashboard' }],
      },
      {
        title: 'Nhân sự vận hành',
        items: [
          { label: 'Danh sách Sale / CS', path: '/staff', icon: 'Users' },
          { label: 'Lịch rảnh Sale', path: '/staff/sale-availability', icon: 'CalendarSearch' },
          { label: 'Lịch rảnh CS', path: '/staff/cs-availability', icon: 'CalendarSearch' },
        ],
      },
      {
        title: 'Phân công ca làm',
        items: [
          { label: 'Phân công Sale', path: '/assign-sale', icon: 'UserCheck' },
          { label: 'Phân công CS', path: '/assign-cs', icon: 'UserCheck' },
          { label: 'Điều chỉnh lịch làm việc', path: '/shift/adjust', icon: 'CalendarClock' },
          // { label: 'Kiểm tra trùng lịch', path: '/shift/conflicts', icon: 'AlertTriangle' },
          { label: 'Theo dõi lịch làm việc', path: '/shift/overview', icon: 'CalendarDays' },
        ],
      },
      {
        title: 'Công lương',
        items: [
          // { label: 'Khối lượng làm việc', path: '/workload', icon: 'Gauge' },
{ label: 'Công lương Sale', path: '/payroll/sale', icon: 'Gauge', meta: { page: 'payroll', permission: 'manage', scope: 'sale' } },
{ label: 'Công lương CS', path: '/payroll/cs', icon: 'Gauge', meta: { page: 'payroll', permission: 'manage', scope: 'cs' } },
{ label: 'Xem công lương', path: '/payroll/history', icon: 'Wallet', meta: { page: 'payroll', permission: 'view', scope: 'all' } },
        ],
      },
    ],
  },

  SALE: {
    key: 'SALE',
    label: 'Sale',
    shortLabel: 'SL',
    color: '#10B981',
    sections: [
      {
        title: 'Chính',
        items: [{ label: 'Dashboard', path: '/', icon: 'LayoutDashboard' }],
      },
      {
        title: 'Lịch của tôi',
        items: [
          { label: 'Đăng ký lịch rảnh', path: '/availability/register', icon: 'CalendarPlus' },
          // { label: 'Cập nhật lịch rảnh', path: '/availability/update', icon: 'CalendarClock' },
          { label: 'Xem lịch làm việc', path: '/availability/mine', icon: 'CalendarCheck' },
{ label: 'Xem công lương', path: '/payroll/history', icon: 'Wallet', meta: { page: 'payroll', permission: 'view', scope: 'sale' } },
        ],
      },
    ],
  },

  CS: {
    key: 'CS',
    label: 'CS',
    shortLabel: 'CS',
    color: '#EC4899',
    sections: [
      {
        title: 'Chính',
        items: [{ label: 'Dashboard', path: '/', icon: 'LayoutDashboard' }],
      },
      {
        title: 'Lịch của tôi',
        items: [
          { label: 'Đăng ký lịch rảnh', path: '/availability/register', icon: 'CalendarPlus' },
          // { label: 'Cập nhật lịch rảnh', path: '/availability/update', icon: 'CalendarClock' },
          { label: 'Lịch làm việc', path: '/my-shifts', icon: 'CalendarDays' },
        ],
      },
      {
        title: 'Vận hành lớp',
        items: [
          { label: 'Quản lý lớp học', path: '/classes/update', icon: 'FileEdit' },
          // { label: 'Danh sách lớp', path: '/classes', icon: 'School' },
          // { label: 'Quản lý trạng thái lớp', path: '/classes/status', icon: 'ToggleLeft' },
          // { label: 'Hỗ trợ dữ liệu lớp', path: '/classes/support-data', icon: 'Database' },
        ],
      },
      {
        title: 'Công lương',
        items: [
          // { label: 'Khối lượng làm việc', path: '/workload', icon: 'Gauge' },
          // { label: 'Công lương CS', path: '/payroll/cs', icon: 'Gauge' },
{ label: 'Xem công lương', path: '/payroll/history', icon: 'Wallet', meta: { page: 'payroll', permission: 'view', scope: 'cs' } },        ],
      }
    ],
  },

  ADMIN: {
    key: 'ADMIN',
    label: 'Admin',
    shortLabel: 'AD',
    color: '#EF4444',
    sections: [
      {
        title: 'Chính',
        items: [{ label: 'Dashboard', path: '/', icon: 'LayoutDashboard' }],
      },
      {
        title: 'Quản lý nhân sự',
        items: [
          { label: 'Tài khoản nhân viên', path: '/accounts', icon: 'Users' },
          { label: 'Vai trò & quyền hạn', path: '/permissions', icon: 'ShieldCheck' },
          { label: 'Trạng thái nhân viên', path: '/accounts/status', icon: 'ToggleLeft' },
        ],
      },
      {
        title: 'Đào tạo',
        items: [
          // { label: 'Quản lý bài giảng', path: '/lessons', icon: 'BookOpen' },
          { label: 'Quản lý lớp học', path: '/classes', icon: 'School' },
          { label: 'Dữ liệu học viên', path: '/students', icon: 'GraduationCap' },
        ],
      },
      {
        title: 'Giám sát',
        items: [
          { label: 'Giám sát lịch phân công', path: '/monitor/schedules', icon: 'CalendarDays' },
{ label: 'Giám sát công lương', path: '/monitor/payroll', icon: 'Wallet', meta: { page: 'payroll', permission: 'approve', scope: 'all' } },          // { label: 'Dữ liệu hệ thống', path: '/system-data', icon: 'Database' },
{ label: 'Thống kê tổng quan', path: '/statistics', icon: 'BarChart3', meta: { page: 'statistics' } },        ],
      },
    ],
  },
}

export const ROLE_LIST = Object.values(ROLES)