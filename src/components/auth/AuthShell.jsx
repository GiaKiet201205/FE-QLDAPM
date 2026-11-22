import { Link } from 'react-router-dom';
import Brand from '../user/Brand';

export default function AuthShell({ children, staff = false }) {
  return <div className="gk-auth-shell font-review">
    <header className="gk-auth-header"><Link to={staff ? '/login' : '/'} aria-label="GK Academy"><Brand /></Link><span>{staff ? 'Cổng quản lý trung tâm' : 'Cổng học viên · Đăng ký và học tập'}</span><Link to={staff ? '/login' : '/courses'}>{staff ? 'Đăng nhập nhân viên' : 'Khám phá khóa học'}</Link></header>
    <main className="gk-auth-main"><section className="gk-auth-story" aria-label="Đồng hành cùng GK"><img src="/images/learning.jpg" alt="Nhóm học viên cùng học tập tại thư viện" /><div><span>GK ACADEMY</span><h2>{staff ? <>Kết nối công việc.<br />Đồng hành cùng học viên.</> : <>Mỗi mục tiêu,<br />một hành trình mới.</>}</h2><p>{staff ? 'Một không gian quản lý thống nhất cho đội ngũ GK.' : 'Chọn lộ trình phù hợp và theo dõi các khóa học của bạn tại một nơi.'}</p></div></section><div className="gk-auth-panel">{children}</div></main>
    <footer className="gk-auth-footer"><span>© {new Date().getFullYear()} GK Academy</span><span>{staff ? 'Dành cho nhân viên và quản lý GK' : 'Ngoại ngữ vững vàng. Kỹ năng sẵn sàng.'}</span></footer>
  </div>;
}
