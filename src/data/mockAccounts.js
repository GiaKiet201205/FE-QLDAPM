const firstNames = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Vũ', 'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Ngô', 'Lý'];
const middleNames = ['Văn', 'Thị', 'Minh', 'Thanh', 'Ngọc', 'Đức', 'Xuân', 'Thu', 'Gia', 'Hải', 'Tuấn', 'Kiều'];
const lastNames = ['Anh', 'Bình', 'Cường', 'Dung', 'Huy', 'Khoa', 'Linh', 'Mai', 'Nam', 'Oanh', 'Phương', 'Quang', 'Sơn', 'Trang', 'Tuấn', 'Hùng', 'Hà'];
const roles = ['Teacher', 'Teaching Coordinator', 'CS Specialist', 'Sale', 'Center Manager', 'Admin'];
const depts = ['Hanoi Main Campus', 'HCM Branch', 'Da Nang Branch', 'Headquarters'];
const mfa = ['Enforced', 'Pending', 'Disabled'];
const policies = ['SSO Managed', 'Standard'];

const removeAccents = (str) => {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
};
const fixedAccounts = [
  {
    id: 1,
    user: 'Admin User',
    code: 'ACC-1001',
    initials: 'AD',
    role: 'Admin',
    status: 'Active',
    lastLogin: 'Today, 09:20',
    username: 'admin',
    email: 'admin@iiglearning.edu.vn',
    department: 'Headquarters',
    createdDate: '2023-01-15',
    mfaStatus: 'Enforced',
    passwordPolicy: 'SSO Managed',
    ipAddress: '118.70.182.4'
  },
  {
    id: 2,
    user: 'Teacher User',
    code: 'ACC-1002',
    initials: 'GV',
    role: 'Teacher',
    status: 'Active',
    lastLogin: 'Today, 09:10',
    username: 'teacher',
    email: 'teacher@iiglearning.edu.vn',
    department: 'HCM Branch',
    createdDate: '2023-01-16',
    mfaStatus: 'Enforced',
    passwordPolicy: 'Standard',
    ipAddress: '192.168.1.12'
  },
  {
    id: 3,
    user: 'Teaching Coordinator User',
    code: 'ACC-1003',
    initials: 'TC',
    role: 'Teaching Coordinator',
    status: 'Active',
    lastLogin: 'Today, 09:00',
    username: 'tc',
    email: 'tc@iiglearning.edu.vn',
    department: 'HCM Branch',
    createdDate: '2023-01-17',
    mfaStatus: 'Enforced',
    passwordPolicy: 'Standard',
    ipAddress: '192.168.1.13'
  },
  {
    id: 4,
    user: 'Center Manager User',
    code: 'ACC-1004',
    initials: 'CM',
    role: 'Center Manager',
    status: 'Active',
    lastLogin: 'Today, 08:50',
    username: 'cm',
    email: 'cm@iiglearning.edu.vn',
    department: 'HCM Branch',
    createdDate: '2023-01-18',
    mfaStatus: 'Enforced',
    passwordPolicy: 'Standard',
    ipAddress: '192.168.1.14'
  },
  {
    id: 5,
    user: 'Sale User',
    code: 'ACC-1005',
    initials: 'SL',
    role: 'Sale',
    status: 'Active',
    lastLogin: 'Today, 08:40',
    username: 'sale',
    email: 'sale@iiglearning.edu.vn',
    department: 'HCM Branch',
    createdDate: '2023-01-19',
    mfaStatus: 'Enforced',
    passwordPolicy: 'Standard',
    ipAddress: '192.168.1.15'
  },
  {
    id: 6,
    user: 'CS User',
    code: 'ACC-1006',
    initials: 'CS',
    role: 'CS Specialist',
    status: 'Active',
    lastLogin: 'Today, 08:30',
    username: 'cs',
    email: 'cs@iiglearning.edu.vn',
    department: 'HCM Branch',
    createdDate: '2023-01-20',
    mfaStatus: 'Enforced',
    passwordPolicy: 'Standard',
    ipAddress: '192.168.1.16'
  }
];
// Tự động sinh mảng 50 tài khoản
const generatedAccounts = Array.from({ length: 44 }, (_, index) => {
  const id = index + 7;

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

export const mockAccounts = [...fixedAccounts, ...generatedAccounts];
