import { useStore } from '../../features/storefront/useStore';
import StoreStatus from '../../components/user/StoreStatus';
import { useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { coursePrice } from '../../data/userCourses';
import { courseImage, courseEntry, displayDate } from '../../data/storefront';

export default function CourseDetail() {
  const {findUserCourse,classes:publicClasses,addToCart,loading,error,refresh}=useStore();
  const { courseId } = useParams();
  const [params] = useSearchParams();
  const course = findUserCourse(courseId);
  const classes = publicClasses.filter((c) => c.courseId === courseId);
  const [selected, setSelected] = useState('');
  const [tab, setTab] = useState('overview');
  if(loading||error)return <StoreStatus loading={loading} error={error} retry={refresh}/>;
  if (!course) return <div className="gk-container gk-empty"><h1>Không tìm thấy khóa học</h1><Link className="gk-button" to="/courses">Xem các khóa học</Link></div>;
  const chosen = classes.find((c) => c.id === (selected || params.get('class')) && c.seats>0);
  const selectedId=chosen?.id || ''; 
  async function add() { try { await addToCart(course.id, selectedId); toast.success('Đã thêm khóa học vào giỏ hàng.'); } catch(e) { toast.error(e.message); } }
  return <>
    <section className="gk-page-hero gk-warm"><div className="gk-container"><p className="gk-breadcrumb"><Link to="/">Trang chủ</Link> / <Link to="/courses">Khóa học</Link> / {course.title}</p><div className="gk-detail-hero"><div><span className="gk-badge">{course.category} · {course.level}</span><h1>{course.title}</h1><h2>{course.category === 'TOEIC' ? <>Vững kỹ năng nghe – đọc.<br />Tự tin với mục tiêu tiếp theo.</> : 'Học có định hướng. Tự tin tiến xa.'}</h2><p className="gk-muted">{course.description}</p><div className="gk-detail-facts"><div><small>Thời lượng</small><strong>{course.lessons} buổi · {course.duration}</strong></div><div><small>Hình thức</small><strong>Trung tâm / Trực tuyến</strong></div><div><small>Đầu vào</small><strong>{courseEntry(course)}</strong></div></div></div><img src={courseImage(course)} alt={`Học viên thực hành khóa ${course.title}`} /></div></div></section>
    <section className="gk-section"><div className="gk-container gk-detail-grid"><div><div className="gk-tabs" role="tablist" aria-label="Thông tin khóa học">{[['overview','Tổng quan'],['content','Nội dung'],['schedule','Lịch học']].map(([id,label]) => <button role="tab" aria-selected={tab===id} id={`tab-${id}`} aria-controls="course-tab-panel" key={id} onClick={() => setTab(id)}>{label}</button>)}</div>
      <div id="course-tab-panel" role="tabpanel" aria-labelledby={`tab-${tab}`}>
      {tab === 'overview' && <><h2>Khóa học này dành cho bạn nếu...</h2><ul className="gk-bullet-list"><li>Bạn muốn xây dựng nền tảng và có lộ trình học rõ ràng.</li><li>Bạn đang chuẩn bị cho mục tiêu học tập hoặc công việc.</li><li>Bạn cần học có hướng dẫn và thực hành từng bước.</li></ul><div className="gk-info-box gk-warm"><h3>Đầu vào & mục tiêu khóa học</h3><p>{courseEntry(course)}</p><p>{course.outcomes.join('. ')}.</p><small>Mục tiêu phụ thuộc vào nền tảng, mức độ tham gia và quá trình luyện tập của mỗi học viên.</small></div></>}
      {tab !== 'schedule' && <><h2>Bạn sẽ tập trung vào những gì?</h2><ol className="gk-syllabus">{course.syllabus.map((s,i) => <li key={s}><span>{String(i+1).padStart(2,'0')}</span>{s}</li>)}</ol></>}
      </div><section id="classes" className="gk-class-section"><h2>Chọn lịch học phù hợp</h2><p className="gk-muted">Học phí cho cả khóa, chưa gồm lệ phí thi chứng chỉ.</p>{classes.length ? classes.map((c) => <article key={c.id} className={`gk-class-option ${selectedId===c.id ? 'is-selected' : ''}`}><div className="gk-results-title"><h3>Khai giảng {displayDate(c.date)}</h3><span className={`gk-badge ${!c.seats ? 'gk-badge-full' : ''}`}>{c.seats ? `Còn ${c.seats} chỗ` : 'Hết chỗ'}</span></div><strong>{c.time}</strong><p>{c.location}<br />Mã lớp: {c.id}</p><div className="gk-results-title"><strong>{coursePrice(course.price)}</strong><button aria-pressed={selectedId===c.id} disabled={!c.seats} className={`gk-button ${selectedId===c.id ? 'gk-primary' : ''}`} onClick={() => setSelected(c.id)}>{!c.seats ? 'Hết chỗ' : selectedId===c.id ? 'Đã chọn' : 'Chọn lớp'}</button></div></article>) : <p className="gk-info-box gk-warm">Chưa có lịch khai giảng. Vui lòng để lại thông tin để được tư vấn.</p>}<div className="gk-callout gk-mint"><div><h3>Cần chọn lịch khác?</h3><p>Để lại mục tiêu và thời gian phù hợp với bạn.</p></div><Link className="gk-button" to="/#consultation">Nhận tư vấn</Link></div></section>
    </div><aside className="gk-registration gk-warm"><h2>Đăng ký khóa học</h2><h3>{course.title}</h3>{chosen ? <p>Lớp: {chosen.id}<br />Khai giảng {displayDate(chosen.date)}<br />{chosen.time}<br />{chosen.location}</p> : <p>Chọn một lớp còn chỗ để xem lịch học và tiếp tục đăng ký.</p>}<small>Tổng học phí</small><strong className="gk-price">{coursePrice(course.price)}</strong><p className="gk-teal">Đăng ký được lưu và chờ trung tâm xác nhận</p>{chosen && course.price!==null ? <Link className="gk-button gk-primary gk-button-wide" to={`/checkout/${course.id}?class=${selectedId}`}>Đăng ký ngay</Link> : <button className="gk-button gk-button-wide" disabled>Đăng ký ngay</button>}<button className="gk-button gk-button-wide" onClick={add} disabled={!chosen||course.price===null}>Thêm vào giỏ</button><p className="gk-demo">Bạn có thể xem lại thông tin trước khi xác nhận. Chưa thu tiền trực tuyến tại bước đăng ký.</p></aside></div></section>
  </>;
}
