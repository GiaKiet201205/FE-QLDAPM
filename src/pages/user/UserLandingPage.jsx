import { storeApi } from '../../services/storeApi';
import { useStore } from '../../features/storefront/useStore';
import StoreStatus from '../../components/user/StoreStatus';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Target, CalendarDays, GraduationCap } from 'lucide-react';
import CourseCard from '../../components/user/CourseCard';
import LearningEmblem from '../../components/user/learning-emblem/LearningEmblem';
import { courseImage } from '../../data/storefront';
import { coursePrice } from '../../data/userCourses';

const learningBenefits = [
  { icon: Target, title: 'Mục tiêu rõ ràng', description: 'Chọn lộ trình TOEIC, IELTS, MOS hoặc IC3 phù hợp với bạn.' },
  { icon: CalendarDays, title: 'Lịch học vừa vặn', description: 'Linh hoạt buổi tối, cuối tuần hoặc học trực tuyến.' },
  { icon: GraduationCap, title: 'Từng bước tiến xa', description: 'Học có định hướng, thực hành để tự tin hơn mỗi ngày.' },
];

const questions = [
  ['Tôi đăng ký khóa học như thế nào?', 'Chọn khóa học, xem lịch lớp phù hợp rồi đăng nhập để tiếp tục đăng ký. Bạn có thể thêm khóa học vào giỏ trước khi quyết định.'],
  ['Nếu lịch học của tôi thay đổi thì sao?', 'Bạn có thể tham khảo các khung giờ khác trong lịch khai giảng. Hãy trao đổi với trung tâm trước khi xác nhận đăng ký.'],
  ['Học phí đã bao gồm lệ phí thi không?', 'Học phí hiển thị được cập nhật từ trung tâm. Lệ phí thi chứng chỉ không nằm trong học phí này.'],
];
export default function UserLandingPage() {
  const { featuredCourses,classes:publicClasses,findUserCourse,loading,error,refresh }=useStore();
  const [notice, setNotice] = useState('');
  const [sending,setSending]=useState(false);
  async function consult(e){e.preventDefault();if(sending)return;const form=e.currentTarget;setSending(true);setNotice('');try{await storeApi.consultation({email:new FormData(form).get('email'),consent:true});setNotice('Đã lưu yêu cầu. GK sẽ liên hệ tư vấn qua email của bạn.');form.reset();}catch(err){setNotice(err.message);}finally{setSending(false);}}
  if(loading||error)return <StoreStatus loading={loading} error={error} retry={refresh}/>;
  return <div className="gk-home">
    <section className="gk-hero gk-home-hero" aria-labelledby="gk-home-heading">
      <figure className="gk-home-banner"><img src="/images/learning.jpg" alt="Học viên cùng trao đổi trong không gian học tập GK" fetchPriority="high" /></figure>
      <div className="gk-container gk-home-hero-content"><div className="gk-home-hero-copy">
        <p className="gk-eyebrow">Học đúng hướng · Tiến xa hơn</p><h1 id="gk-home-heading">Chọn khóa học phù hợp với mục tiêu của bạn</h1>
        <p className="gk-lead">Từ chứng chỉ ngoại ngữ đến kỹ năng tin học. Tìm lộ trình vừa sức, chọn lịch học vừa vặn và bắt đầu cùng GK.</p>
        <div className="gk-actions"><Link className="gk-button gk-primary" to="/courses">Khám phá khóa học</Link><Link className="gk-button" to="/schedule">Xem lịch khai giảng</Link></div>
      </div></div>
    </section>
    <section className="gk-home-values" aria-label="Hành trình học tập cùng GK"><div className="gk-container gk-values">
      {learningBenefits.map(({ icon: Icon, title, description }) => <article className="gk-value-item" key={title}><span className="gk-value-icon"><Icon size={25} strokeWidth={1.7} aria-hidden="true" /></span><div><h2>{title}</h2><p>{description}</p></div></article>)}
    </div></section>
    <LearningEmblem />
    <section id="about" className="gk-section"><div className="gk-container"><p className="gk-eyebrow">Chương trình đào tạo</p><h2>Mỗi mục tiêu, một hướng đi</h2><p className="gk-muted">Chọn chương trình đầu tiên. Từng bước tiến gần hơn đến mục tiêu.</p>
      <div className="gk-program-grid">{featuredCourses.map((course) => <Link to={`/courses?category=${course.category}`} key={course.id}><img loading="lazy" src={courseImage(course)} alt={`Học tập và thực hành ${course.category}`} /><h3>{course.category}</h3><p>{({ TOEIC: 'Giao tiếp công việc, mở lối sự nghiệp', IELTS: 'Vững nền tảng, tự tin hội nhập', MOS: 'Thành thạo công cụ, làm việc hiệu quả', IC3: 'Kỹ năng số thiết yếu cho cuộc sống' })[course.category]}</p></Link>)}</div>
    </div></section>
    <section className="gk-section gk-warm"><div className="gk-container"><div className="gk-section-title"><div><p className="gk-eyebrow">Bước tiếp theo của bạn</p><h2>Bắt đầu từ một khóa học phù hợp</h2></div><Link className="gk-button" to="/courses">Tất cả khóa học</Link></div><div className="gk-card-grid">{featuredCourses.map((c) => <CourseCard course={c} key={c.id} />)}</div></div></section>
    <section className="gk-section gk-mint"><div className="gk-container"><div className="gk-section-title"><div><p className="gk-eyebrow">Những lớp sắp khai giảng</p><h2>Một lịch học vừa vặn với bạn</h2></div><Link className="gk-button" to="/schedule">Xem toàn bộ lịch</Link></div>
      <div className="gk-opening-list">{publicClasses.filter((c) => c.seats > 0).slice(0, 3).map((c) => { const course = findUserCourse(c.courseId); return <article key={c.id} className="gk-opening"><div className="gk-opening-date"><strong>{c.date.slice(8)}/{c.date.slice(5, 7)}</strong><small>{c.date.slice(0,4)}</small></div><div className="gk-opening-info"><h3>{course.title}</h3><p>{c.time}</p><p>{c.location}</p></div><div><strong>{coursePrice(course.price)}</strong><p className="gk-teal">Còn chỗ đăng ký</p></div><Link className="gk-button" to={`/courses/${course.id}?class=${c.id}#classes`}>Chọn lớp</Link></article>; })}</div>
    </div></section>
    <section id="consultation" className="gk-section"><div className="gk-container gk-faq-grid"><div><p className="gk-eyebrow">Đồng hành cùng bạn</p><h2>Bạn hỏi, GK giải đáp</h2><p className="gk-muted">Một vài điều cần biết trước khi bắt đầu hành trình mới.</p><form className="gk-consultation" onSubmit={consult}><label htmlFor="consult-email">Email nhận tư vấn</label><input id="consult-email" name="email" type="email" maxLength={100} required placeholder="Email của bạn" /><label className="gk-consent"><input type="checkbox" required/>Tôi đồng ý để GK liên hệ tư vấn qua email.</label><button className="gk-button gk-primary" disabled={sending}>{sending?'Đang gửi...':'Nhận tư vấn'}</button>{notice && <p role="status">{notice}</p>}</form></div><div>{questions.map(([q, a]) => <details key={q} open><summary>{q}</summary><p>{a}</p></details>)}</div></div></section>
  </div>;
}
