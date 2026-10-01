export const initialStudents = [
  {
    id: "STU-2024-0891",
    name: "Minh Anh Nguyen",
    email: "minhanh.nguyen@email.com",
    phone: "+84 912 345 678",
    className: "IELTS M75-04",
    course: "IELTS",
    status: "Active",
    result: "Band 7.2",
    resultNote: "7.5 Target",
    initials: "MA",
    tone: "navy",
    attendance: "95.8% (23/24 sessions)",
    progress: "Band 7.2 / Target 7.5",
    teacher: "David Miller",
  },
  {
    id: "STU-2024-0892",
    name: "Duc Thang Tran",
    email: "thang.tran@email.com",
    phone: "+84 913 276 428",
    className: "IELTS M75-04",
    course: "IELTS",
    status: "Active",
    result: "Band 7.0",
    resultNote: "7.5 Target",
    initials: "DT",
    tone: "slate",
    attendance: "91.7% (22/24 sessions)",
    progress: "Band 7.0 / Target 7.5",
    teacher: "David Miller",
  },
  {
    id: "STU-2024-0895",
    name: "Phuong Linh Vo",
    email: "linh.vo@email.com",
    phone: "+84 983 112 456",
    className: "TOEIC 850-01",
    course: "TOEIC",
    status: "Active",
    result: "820 / 850",
    resultNote: "",
    initials: "PL",
    tone: "slate",
    attendance: "96.0% (24/25 sessions)",
    progress: "820 / Target 850",
    teacher: "Sarah Lee",
  },
  {
    id: "STU-2024-0870",
    name: "Hoang Nam Le",
    email: "nam.le@email.com",
    phone: "+84 912 466 113",
    className: "IELTS E65-02",
    course: "IELTS",
    status: "On Leave",
    result: "Band 6.0",
    resultNote: "6.5 Target",
    initials: "HN",
    tone: "amber",
    attendance: "80.0% (16/20 sessions)",
    progress: "Band 6.0 / Target 6.5",
    teacher: "Emma Wilson",
  },
  {
    id: "STU-2024-0864",
    name: "Mai Huong Dang",
    email: "huong.dang@email.com",
    phone: "+84 934 778 202",
    className: "IELTS M75-01",
    course: "IELTS",
    status: "Active",
    result: "Band 7.5",
    resultNote: "7.5 Achieved",
    initials: "MH",
    tone: "slate",
    attendance: "100% (24/24 sessions)",
    progress: "Band 7.5 / Target 7.5",
    teacher: "David Miller",
  },
  {
    id: "STU-2024-0752",
    name: "Quoc Bao Pham",
    email: "bao.pham@email.com",
    phone: "+84 906 325 445",
    className: "SAT Math-02",
    course: "SAT",
    status: "Graduated",
    result: "780 / 800",
    resultNote: "",
    initials: "QB",
    tone: "pale",
    attendance: "98.0% (49/50 sessions)",
    progress: "780 / Target 800",
    teacher: "James Carter",
  },
  {
    id: "STU-2024-0899",
    name: "Thu Ha Nguyen",
    email: "ha.nguyen@email.com",
    phone: "+84 928 349 118",
    className: "IELTS M75-04",
    course: "IELTS",
    status: "Active",
    result: "Band 6.8",
    resultNote: "7.5 Target",
    initials: "TH",
    tone: "slate",
    attendance: "92.0% (23/25 sessions)",
    progress: "Band 6.8 / Target 7.5",
    teacher: "David Miller",
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
    const name = extraNames[index % extraNames.length];
    const course = ["IELTS", "TOEIC", "SAT"][index % 3];
    return {
      id: `STU-2024-${String(900 + index).padStart(4, "0")}`,
      name,
      email: `${name.toLowerCase().replaceAll(" ", ".")}@email.com`,
      phone: "+84 912 000 000",
      className: `${course} ${course === "IELTS" ? "M75-04" : course === "TOEIC" ? "850-01" : "Math-02"}`,
      course,
      status:
        index % 11 === 0
          ? "Graduated"
          : index % 9 === 0
            ? "On Leave"
            : "Active",
      result:
        course === "IELTS"
          ? "Band 7.0"
          : course === "TOEIC"
            ? "820 / 850"
            : "760 / 800",
      resultNote: course === "IELTS" ? "7.5 Target" : "",
      initials: name
        .split(" ")
        .map((part) => part[0])
        .slice(0, 2)
        .join(""),
      tone: "slate",
      attendance: "92.0% (23/25 sessions)",
      progress:
        course === "IELTS"
          ? "Band 7.0 / Target 7.5"
          : course === "TOEIC"
            ? "820 / Target 850"
            : "760 / Target 800",
      teacher: "David Miller",
    };
  }),
];

export const PAGE_SIZE = 7;
export const emptyForm = {
  name: "",
  email: "",
  phone: "",
  className: "IELTS M75-04",
  course: "IELTS",
  status: "Active",
};


