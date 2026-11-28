import { Link } from 'react-router-dom';

const values = [
  ['01', 'Hiểu đúng mục tiêu', 'Tư vấn theo nền tảng hiện tại và nhu cầu thực tế trong học tập, công việc.'],
  ['02', 'Thực hành có hướng dẫn', 'Học theo lộ trình, luyện tập từng kỹ năng và nhận phản hồi để tiến bộ.'],
  ['03', 'Minh bạch từ đầu', 'Thông tin lịch học, học phí và nội dung được trình bày rõ trước khi đăng ký.'],
];

const programs = [
  { name: 'TOEIC', image: 'toeic.jpg', description: 'Củng cố tiếng Anh cho học tập và môi trường làm việc.' },
  { name: 'IELTS', image: 'ielts.jpg', description: 'Phát triển toàn diện các kỹ năng tiếng Anh theo mục tiêu.' },
  { name: 'MOS', image: 'mos.jpg', description: 'Thực hành các công cụ văn phòng và kỹ năng tin học.' },
  { name: 'IC3', image: 'ic3.jpg', description: 'Xây dựng nền tảng kỹ năng số thiết yếu.' },
];

const team = [
  { title: 'Giám đốc điều hành', image: 'GiaKiet.jpg', alt: 'Ảnh minh họa vai trò giám đốc điều hành' },
  { title: 'Trưởng bộ phận kỹ thuật', image: 'Luan.png', alt: 'Ảnh minh họa vai trò trưởng bộ phận kỹ thuật' },  
  { title: 'Giáo viên trưởng', image: 'Quyen.jpg', alt: 'Ảnh minh họa vai trò giáo viên trưởng' },
  { title: 'Quản lý chất lượng và đào tạo', image: 'Nhat.jpg', alt: 'Ảnh minh họa vai trò trưởng bộ phận kỹ thuật' },

];

export default function AboutPage() {
  return <div className="gk-about-page">
    <section className="gk-section gk-warm">
      <div className="gk-container">
        <p className="gk-breadcrumb"><Link to="/">Trang chủ</Link> / Về chúng tôi</p>
        <div className="gk-about-hero">
          <div>
            <p className="gk-eyebrow">Học đúng hướng. Tiến xa hơn.</p>
            <h1>Kiến thức vững vàng.<br />Tương lai rộng mở.</h1>
            <p className="gk-muted">GK Academy hướng đến việc kết nối nhu cầu học ngoại ngữ và kỹ năng tin học với những lộ trình rõ ràng.</p>
            <p className="gk-muted">Chúng tôi tin rằng một khởi đầu phù hợp — từ mục tiêu, nền tảng đến lịch trình — giúp bạn học hiệu quả và bền vững hơn.</p>
            <Link className="gk-button gk-primary" to="/courses">Tìm khóa học của bạn</Link>
          </div>
          <img src="/images/learning.jpg" alt="Nhóm học viên trao đổi trong không gian học tập" />
        </div>
      </div>
    </section>

    <section className="gk-section">
      <div className="gk-container gk-about-intro">
        <div>
          <p className="gk-eyebrow">Về GK Academy</p>
          <h2>Trung tâm đồng hành cùng mục tiêu học tập của bạn.</h2>
        </div>
        <div className="gk-about-intro-copy">
          <p>GK Academy là trung tâm đào tạo ngoại ngữ và tin học, dành cho người học muốn chủ động nâng cao kiến thức và kỹ năng ứng dụng.</p>
          <p>Từ TOEIC, IELTS đến MOS, IC3, mỗi chương trình đều hướng đến việc giúp học viên xác định mục tiêu, chọn lộ trình phù hợp và có cơ hội thực hành trong quá trình học.</p>
        </div>
      </div>
      <div className="gk-container">
        <h2>Bắt đầu từ bạn, không chỉ từ chứng chỉ.</h2>
        <div className="gk-values-cards">
          {values.map(([number, title, description]) => <article className="gk-warm" key={number}>
            <span>{number}</span><h3>{title}</h3><p>{description}</p>
          </article>)}
        </div>
      </div>
    </section>

    <section className="gk-section gk-warm">
      <div className="gk-container">
        <p className="gk-eyebrow">Chương trình đào tạo</p>
        <h2>Mỗi mục tiêu, một hướng đi.</h2>
        <p className="gk-muted">Khám phá các chương trình tại GK Academy và tìm hướng học phù hợp với bạn.</p>
        <div className="gk-about-programs">
          {programs.map((program) => <Link className="gk-about-program" to={`/courses?category=${program.name}`} key={program.name}>
            <img src={`/images/${program.image}`} alt={`Chương trình ${program.name}`} loading="lazy" />
            <div><h3>{program.name}</h3><p>{program.description}</p><span>Khám phá chương trình <span aria-hidden="true">→</span></span></div>
          </Link>)}
        </div>
      </div>
    </section>

    <section className="gk-section">
      <div className="gk-container">
        <p className="gk-eyebrow">Những người đồng hành</p>
        <h2>Đội ngũ phía sau hành trình của bạn.</h2>
        <p className="gk-muted">Từ định hướng học tập đến thực hành trên lớp, đội ngũ GK luôn sẵn sàng đồng hành.</p>
        <div className="gk-about-team">
          {team.map((member) => <article className="gk-about-team-card" key={member.title}>
            <img src={`/images/${member.image}`} alt={member.alt} loading="lazy" />
            <h3>{member.title}</h3>
          </article>)}
        </div>
      </div>
    </section>

    <section className="gk-about-cta">
      <div className="gk-container">
        <h2>Mục tiêu của bạn,<br />bước tiếp theo cùng GK.</h2>
        <p>Khám phá khóa học hoặc để lại thông tin để chuẩn bị cho hành trình mới.</p>
        <div className="gk-actions">
          <Link className="gk-button gk-primary" to="/courses">Khám phá khóa học</Link>
          <Link className="gk-button" to="/contact">Nhận tư vấn</Link>
        </div>
      </div>
    </section>
  </div>;
}
