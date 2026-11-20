import { useStore } from '../../features/storefront/useStore';
import StoreStatus from '../../components/user/StoreStatus';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { displayDate } from '../../data/storefront';
import { coursePrice } from '../../data/userCourses';

export default function OpeningSchedule() {
  const {classes:publicClasses,courses,findUserCourse,loading,error,refresh}=useStore();
  const [search,setSearch] = useState('');
  const [category,setCategory] = useState('all');
  const [month,setMonth] = useState('');
  const [mode,setMode] = useState('all');
  const rows=publicClasses.filter((c) => { const course=findUserCourse(c.courseId); return course.title.toLocaleLowerCase('vi').includes(search.toLocaleLowerCase('vi')) && (category==='all'||course.category===category) && (month===''||c.date.startsWith(month)) && (mode==='all'||c.mode===mode); });
  if(loading||error)return <StoreStatus loading={loading} error={error} retry={refresh}/>;
  return <><section className="gk-page-hero gk-warm"><div className="gk-container"><p className="gk-breadcrumb"><Link to="/">Trang chủ</Link> / Lịch khai giảng</p><h1>Chọn lịch học.<br />Sẵn sàng cho bước tiếp theo.</h1><p className="gk-muted">Tìm lớp học phù hợp với lịch trình của bạn tại GK Academy.</p></div></section><section className="gk-section"><div className="gk-container"><div className="gk-schedule-filters"><label>Tìm khóa học<input type="search" value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Tên khóa học..." /></label><label>Chứng chỉ<select value={category} onChange={(e)=>setCategory(e.target.value)}><option value="all">Tất cả chứng chỉ</option>{[...new Set(courses.map(c=>c.category))].map((c)=><option key={c}>{c}</option>)}</select></label><label>Tháng khai giảng<input type="month" value={month} onChange={(e)=>setMonth(e.target.value)} /></label><label>Hình thức<select value={mode} onChange={(e)=>setMode(e.target.value)}><option value="all">Tất cả hình thức</option><option>Tại trung tâm</option><option>Trực tuyến</option></select></label></div><div className="gk-results-title"><strong>{rows.length} lớp phù hợp</strong><small>Lịch khai giảng · Giờ Việt Nam (GMT+7)</small></div><table className="gk-schedule-table"><thead><tr>{['Khóa học','Khai giảng','Lịch học','Địa điểm','Học phí','Còn chỗ','Thao tác'].map((s)=><th key={s}>{s}</th>)}</tr></thead><tbody>{rows.map((c)=>{ const course=findUserCourse(c.courseId); return <tr key={c.id}><td><strong>{course.title}</strong></td><td>{displayDate(c.date)}</td><td>{c.time}</td><td>{c.location}</td><td><strong>{coursePrice(course.price)}</strong></td><td><span className={!c.seats?'gk-danger':'gk-teal'}>{c.seats ? `${c.seats} chỗ`:'Hết chỗ'}</span></td><td>{c.seats ? <Link className="gk-button" to={`/courses/${course.id}?class=${c.id}#classes`}>Chọn lớp</Link> : <button className="gk-button" disabled>Hết chỗ</button>}</td></tr>;})}</tbody></table>{!rows.length&&<div className="gk-empty">Chưa có lớp phù hợp với bộ lọc đã chọn.</div>}<div className="gk-callout gk-mint"><div><h3>Lịch học phù hợp hôm nay, khởi đầu thuận lợi ngày mai.</h3><p>Lịch học có thể được điều chỉnh trước khai giảng. Xem thông tin lớp trước khi đăng ký.</p></div></div></div></section></>;
}
