export const studentStatuses = ["Active", "On Leave", "Graduated"];

export const studentStatusTransitions = {
  Active: ["On Leave", "Graduated"],
  "On Leave": ["Active", "Graduated"],
  Graduated: ["Active"],
};

export const initialStudents = [
  {
    id: "student-0001",
    studentCode: "STU-2024-0891",
    fullName: "Minh Anh Nguyen",
    email: "minhanh.nguyen@email.com",
    phone: "+84 912 345 678",
    status: "Active",
    tone: "navy",
  },
  {
    id: "student-0002",
    studentCode: "STU-2024-0892",
    fullName: "Duc Thang Tran",
    email: "thang.tran@email.com",
    phone: "+84 913 276 428",
    status: "Active",
    tone: "slate",
  },
  {
    id: "student-0003",
    studentCode: "STU-2024-0895",
    fullName: "Phuong Linh Vo",
    email: "linh.vo@email.com",
    phone: "+84 983 112 456",
    status: "Active",
    tone: "slate",
  },
  {
    id: "student-0004",
    studentCode: "STU-2024-0870",
    fullName: "Hoang Nam Le",
    email: "nam.le@email.com",
    phone: "+84 912 466 113",
    status: "On Leave",
    tone: "amber",
  },
  {
    id: "student-0005",
    studentCode: "STU-2024-0864",
    fullName: "Mai Huong Dang",
    email: "huong.dang@email.com",
    phone: "+84 934 778 202",
    status: "Active",
    tone: "slate",
  },
  {
    id: "student-0006",
    studentCode: "STU-2024-0752",
    fullName: "Quoc Bao Pham",
    email: "bao.pham@email.com",
    phone: "+84 906 325 445",
    status: "Graduated",
    tone: "pale",
  },
  {
    id: "student-0007",
    studentCode: "STU-2024-0899",
    fullName: "Thu Ha Nguyen",
    email: "ha.nguyen@email.com",
    phone: "+84 928 349 118",
    status: "Active",
    tone: "slate",
  },
];

const extraNames = [
  "An Nguyen",
  "Bich Tram Le",
  "Gia Bao Tran",
  "Khanh Linh Pham",
  "Tuan Kiet Vo",
  "Ngoc Anh Do",
  "Thanh Dat Ho",
];

export const seededStudents = [
  ...initialStudents,
  ...Array.from({ length: 135 }, (_, index) => {
    const fullName = extraNames[index % extraNames.length];

    return {
      id: `student-${String(index + 8).padStart(4, "0")}`,
      studentCode: `STU-2024-${String(900 + index).padStart(4, "0")}`,
      fullName,
      email: `${fullName.toLowerCase().replaceAll(" ", ".")}@email.com`,
      phone: index % 8 === 0 ? "" : "+84 912 000 000",
      status:
        index % 11 === 0
          ? "Graduated"
          : index % 9 === 0
            ? "On Leave"
            : "Active",
      tone: "slate",
    };
  }),
];

export const PAGE_SIZE = 7;

export const emptyForm = {
  studentCode: "",
  fullName: "",
  email: "",
  phone: "",
  targets: {},
  status: "Active",
};
