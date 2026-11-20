import { useStore } from '../../features/storefront/useStore';
import StoreStatus from '../../components/user/StoreStatus';
import { useRef, useState } from 'react';

import { Link, useSearchParams } from 'react-router-dom';
import CourseCard from '../../components/user/CourseCard';

const PAGE_SIZE = 9;

export default function CourseCatalog() {
  const [params] = useSearchParams();
  const [category, setCategory] = useState(params.get('category') || 'Tất cả');
  const [level, setLevel] = useState('Tất cả');
  const [price, setPrice] = useState('Tất cả');
  const [format, setFormat] = useState('Tất cả');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('recommended');
  const [page, setPage] = useState(1);
  const results = useRef(null);
  const {courses:allCourses,classes,orders,enrollments,loading,error,refresh}=useStore();
  const purchases=[...enrollments.filter(e=>e.status==='ACTIVE'),...orders.filter(o=>o.status!=='CANCELLED').flatMap(o=>o.items)];
  const courses = allCourses.filter((c) => (category === 'Tất cả' || category === c.category) && (level === 'Tất cả' || level === c.level || (level === 'Nền tảng' && c.category === 'IELTS')) && (format === 'Tất cả' || classes.some(cl=>cl.courseId===c.id&&cl.mode===format)) && (price === 'Tất cả' || (c.price!==null&&(price === 'low' ? c.price < 2000000 : price === 'mid' ? c.price >= 2000000 && c.price <= 3000000 : c.price > 3000000))) && `${c.title} ${c.description}`.toLocaleLowerCase('vi').includes(search.toLocaleLowerCase('vi'))).sort((a,b) => sort === 'price-asc' ? a.price-b.price : sort === 'price-desc' ? b.price-a.price : 0);
  const pageCount = Math.max(1, Math.ceil(courses.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const start = (currentPage - 1) * PAGE_SIZE;
  const visibleCourses = courses.slice(start, start + PAGE_SIZE);
  function changePage(next) {
    if (next < 1 || next > pageCount || next === currentPage) return;
    setPage(next);
    requestAnimationFrame(() => results.current?.scrollIntoView({ block: 'start', behavior: 'instant' }));
  }
  function reset() { setCategory('Tất cả'); setLevel('Tất cả'); setPrice('Tất cả'); setFormat('Tất cả'); setSearch(''); setPage(1); }
  function filter(title, values, value, change) { return <fieldset><legend>{title}</legend>{values.map(([id, name]) => <label key={id}><input type="radio" name={title} checked={value === id} onChange={() => { change(id); setPage(1); }} />{name}</label>)}</fieldset>; }
  if(loading||error)return <StoreStatus loading={loading} error={error} retry={refresh}/>;
  return <>
    <section className="gk-page-hero gk-warm"><div className="gk-container"><p className="gk-breadcrumb"><Link to="/">Trang chủ</Link> / Khóa học</p><h1>Học điều bạn cần.<br />Tiến gần điều bạn muốn.</h1><p className="gk-muted">Khám phá các khóa luyện thi ngoại ngữ và tin học có giảng viên hướng dẫn.</p></div></section>
    <section className="gk-section"><div className="gk-container"><div className="gk-search-row"><label>Tìm khóa học<input type="search" aria-label="Tìm khóa học" placeholder="Tìm theo tên khóa học, chứng chỉ..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} /></label><label>Sắp xếp theo<select value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }}><option value="recommended">Phù hợp nhất</option><option value="price-asc">Học phí tăng dần</option><option value="price-desc">Học phí giảm dần</option></select></label></div>
    <div className="gk-catalog-grid"><aside className="gk-filter gk-warm"><h2>Bộ lọc khóa học</h2>{filter('Chứng chỉ', ['Tất cả',...new Set(allCourses.map(c=>c.category))].map((v)=>[v,v === 'Tất cả' ? 'Tất cả chứng chỉ' : v]),category,setCategory)}{filter('Trình độ', ['Tất cả',...new Set(allCourses.map(c=>c.level))].map((v)=>[v,v === 'Tất cả' ? 'Tất cả trình độ' : v]),level,setLevel)}{filter('Hình thức', [['Tất cả','Tất cả hình thức'],['Tại trung tâm','Tại trung tâm'],['Trực tuyến','Trực tuyến có giảng viên']],format,setFormat)}{filter('Khoảng học phí', [['Tất cả','Tất cả học phí'],['low','Dưới 2.000.000 ₫'],['mid','2.000.000–3.000.000 ₫'],['high','Trên 3.000.000 ₫']],price,setPrice)}<button className="gk-button" onClick={reset}>Xóa bộ lọc</button></aside>
    <div><div className="gk-results-title gk-catalog-results" ref={results}><strong>{courses.length} khóa học phù hợp</strong><span className="gk-badge">{classes.length} lớp đang mở đăng ký</span></div><div className="gk-card-grid">{visibleCourses.map((c) => <CourseCard key={c.id} course={c} owned={purchases.some((p) => p.courseId === c.id)} />)}</div>{courses.length > 0 && <div className="gk-catalog-pagination">
      <p role="status" aria-live="polite">Hiển thị {start + 1}–{Math.min(start + PAGE_SIZE, courses.length)} trong {courses.length} khóa học</p>
      {pageCount > 1 && <nav aria-label="Phân trang khóa học">
        <button type="button" className="gk-button" disabled={currentPage === 1} onClick={() => changePage(currentPage - 1)}>Trước</button>
        {Array.from({ length: pageCount }, (_, index) => index + 1).map(number => <button type="button" key={number} className={`gk-button gk-page-number ${number === currentPage ? 'gk-primary' : ''}`} aria-label={`Trang ${number}`} aria-current={number === currentPage ? 'page' : undefined} onClick={() => changePage(number)}>{number}</button>)}
        <button type="button" className="gk-button" disabled={currentPage === pageCount} onClick={() => changePage(currentPage + 1)}>Sau</button>
      </nav>}
    </div>}{!courses.length && <div className="gk-empty"><h2>Chưa tìm thấy khóa học phù hợp</h2><p>Thử từ khóa khác hoặc xóa bộ lọc để xem tất cả khóa học.</p><button className="gk-button" onClick={reset}>Xóa bộ lọc</button></div>}<div className="gk-callout gk-mint"><div><h3>Chưa chắc nên bắt đầu từ đâu?</h3><p>Để lại mục tiêu, GK sẽ cùng bạn tìm lộ trình phù hợp.</p></div><Link className="gk-button" to="/#consultation">Nhận tư vấn</Link></div></div></div></div></section>
  </>;
}
