const firstNames = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Vũ', 'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Ngô', 'Lý'];
const middleNames = ['Văn', 'Thị', 'Minh', 'Thanh', 'Ngọc', 'Đức', 'Xuân', 'Thu', 'Gia', 'Hải', 'Tuấn', 'Kiều'];
const lastNames = ['Anh', 'Bình', 'Cường', 'Dung', 'Huy', 'Khoa', 'Linh', 'Mai', 'Nam', 'Oanh', 'Phương', 'Quang', 'Sơn', 'Trang', 'Tuấn', 'Hùng', 'Hà'];
const roles = ['Teacher', 'Teaching Coordinator', 'CS Specialist', 'Sale', 'Center Manager', 'Admin'];
const depts = ['Hanoi Main Campus', 'HCM Branch', 'Da Nang Branch', 'Headquarters'];
const statuses = ['Active', 'Locked'];
const mfa = ['Enforced', 'Pending', 'Disabled'];
const policies = ['SSO Managed', 'Standard'];

const removeAccents = (str) => {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
};

// Tự động sinh mảng 50 tài khoản
export const mockAccounts = Array.from({ length: 50 }, (_, index) => {
  const id = index + 1;
  
  if (id === 1) {
    return {
      id: 1,
      user: 'System Admin',
      code: 'ACC-1001',
      initials: 'SA',
      role: 'Admin',
      status: 'Active',
      lastLogin: 'Today, 09:20',
      username: 'admin',
      email: 'admin@iiglearning.edu.vn',
      department: 'Headquarters',
      createdDate: 'Jan 15, 2023',
      mfaStatus: 'Enforced',
      passwordPolicy: 'SSO Managed',
      ipAddress: '118.70.182.4'
    };
  }

  // Khởi tạo thông tin ngẫu nhiên dựa trên ID cho 49 người còn lại
  const fName = firstNames[id % firstNames.length];
  const mName = middleNames[id % middleNames.length];
  const lName = lastNames[id % lastNames.length];
  
  const fullName = `${fName} ${mName} ${lName}`;
  const initials = `${removeAccents(fName)[0]}${removeAccents(lName)[0]}`;
  const username = `${removeAccents(lName).toLowerCase()}.${removeAccents(fName).toLowerCase()}${id}`;
  const email = `${username}@iiglearning.edu.vn`;

  return {
    id,
    user: fullName,
    code: `ACC-${1000 + id}`,
    initials,
    role: roles[id % roles.length],
    status: id % 7 === 0 ? 'Locked' : 'Active', 
    lastLogin: id % 3 === 0 ? 'Yesterday, 14:15' : 'Today, 08:30',
    username,
    email,
    department: depts[id % depts.length],
    createdDate: `2023-${String((id % 12) + 1).padStart(2, '0')}-${String((id % 28) + 1).padStart(2, '0')}`,
    mfaStatus: mfa[id % mfa.length],
    passwordPolicy: policies[id % policies.length],
    ipAddress: `192.168.1.${id + 10}`
  };
});