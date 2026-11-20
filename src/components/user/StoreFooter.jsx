import { Link } from 'react-router-dom';
import { ChevronUp, MessageCircle, BookOpen, CalendarDays } from 'lucide-react';
import Brand from './Brand';

export default function StoreFooter() {
  function backToTop() {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduced ? 'instant' : 'smooth' });
  }
  return <footer id="contact" className="gk-footer">
    <div className="gk-container gk-footer-invitation"><div><p className="gk-footer-eyebrow">BƯỚC TIẾP THEO CÙNG GK</p><h2>Sẵn sàng cho hành trình mới?</h2><p>Tìm một khóa học phù hợp. Bắt đầu một mục tiêu mới.</p></div><div className="gk-footer-actions"><Link className="gk-button gk-footer-primary" to="/courses"><BookOpen size={17} aria-hidden="true" />Khám phá khóa học</Link><Link className="gk-button gk-footer-secondary" to="/contact"><MessageCircle size={17} aria-hidden="true" />Nhận tư vấn</Link></div></div>
    <div className="gk-container gk-footer-grid">
      <div className="gk-footer-brand"><Link to="/" aria-label="GK Academy - Trang chủ"><Brand /></Link><p className="gk-footer-tagline">Ngoại ngữ vững vàng.<br />Kỹ năng sẵn sàng.</p><p>Cùng bạn xây nền tảng kiến thức và tự tin chinh phục mục tiêu học tập.</p><span className="gk-footer-signature">Trung tâm đào tạo GK</span></div>
      <nav aria-label="Khám phá GK"><h3>Khám phá GK</h3><Link to="/about">Về chúng tôi</Link><Link to="/courses">Các khóa học</Link><Link to="/schedule">Lịch khai giảng</Link><Link to="/contact">Liên hệ & tư vấn</Link></nav>
      <nav aria-label="Chương trình đào tạo"><h3>Chương trình</h3>{['TOEIC','IELTS','MOS','IC3'].map((category) => <Link key={category} to={`/courses?category=${category}`}>{category}</Link>)}</nav>
      <div className="gk-footer-support"><span className="gk-footer-support-icon"><MessageCircle size={22} aria-hidden="true" /></span><h3>Một khởi đầu phù hợp</h3><p>Bạn còn phân vân về khóa học hay thời gian học? Tìm hiểu lịch lớp hoặc chia sẻ mục tiêu của bạn với GK.</p><Link className="gk-footer-support-link" to="/contact">Trao đổi với GK</Link><Link className="gk-footer-schedule" to="/schedule"><CalendarDays size={15} aria-hidden="true" />Xem lịch học phù hợp</Link></div>
    </div>
    <div className="gk-container gk-footer-bottom"><div><p>© {new Date().getFullYear()} GK Academy. Đồng hành cùng hành trình học tập của bạn.</p><small>Bản trải nghiệm · Khóa học, học phí và lịch lớp minh họa.</small></div><button type="button" onClick={backToTop}>Về đầu trang<ChevronUp size={17} aria-hidden="true" /></button></div>
  </footer>;
}
