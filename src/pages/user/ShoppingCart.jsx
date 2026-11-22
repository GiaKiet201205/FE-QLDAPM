import { useStore } from '../../features/storefront/useStore';
import StoreStatus from '../../components/user/StoreStatus';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { coursePrice } from '../../data/userCourses';
import { courseImage, displayDate } from '../../data/storefront';

export default function ShoppingCart() {
  const {cart,guestCart,mergeGuest,clearGuestCart,findUserCourse,classes:publicClasses,removeFromCart,loading,error,privateLoading,privateError,refresh}=useStore();
  const total = cart.reduce((sum, row) => sum + (findUserCourse(row.courseId)?.price||0), 0);
  async function remove(courseId) {
    try { await removeFromCart(courseId); }
    catch(e) { toast.error(e.message); }
  }
  if(loading||error||privateLoading||privateError)return <StoreStatus loading={loading||privateLoading} error={error||privateError} retry={refresh}/>;
  if (!cart.length&& !guestCart.length) return <section className="gk-page-hero gk-warm gk-empty-cart"><div className="gk-container"><p className="gk-breadcrumb"><Link to="/">Trang chủ</Link> / Giỏ hàng</p><h1>Giỏ hàng đang trống</h1><p className="gk-muted">Chọn một khóa học và lịch học phù hợp để bắt đầu hành trình cùng GK.</p><Link className="gk-button gk-primary" to="/courses">Khám phá khóa học</Link></div></section>;
  return <>
    <section className="gk-page-hero gk-warm"><div className="gk-container"><p className="gk-breadcrumb"><Link to="/">Trang chủ</Link> / Giỏ hàng</p><h1>Giỏ hàng của bạn</h1><ol className="gk-checkout-steps" aria-label="Các bước đăng ký"><li aria-current="step">01 Giỏ hàng</li><li>02 Thanh toán</li><li>03 Xác nhận</li></ol></div></section>
    <section className="gk-section"><div className="gk-container gk-cart-grid"><div>{guestCart.length>0&&<div className="gk-info-box gk-mint"><p>Giỏ khách trên trình duyệt: {guestCart.length} khóa học. Khi đã đăng nhập, bạn có thể nhập các lớp còn mở vào giỏ tài khoản.</p><button className="gk-button" onClick={()=>mergeGuest().then(()=>toast.success('Đã lưu vào giỏ tài khoản')).catch(e=>toast.error(e.message))}>Nhập giỏ khách vào tài khoản</button><button className="gk-button" onClick={clearGuestCart}>Xóa giỏ khách</button></div>}
      {cart.map((row) => {
        const course = findUserCourse(row.courseId);
        const selectedClass = publicClasses.find((c) => c.id === row.classId);
        if(!course||!selectedClass)return <article className="gk-cart-item" key={row.courseId}><div><h2>Khóa hoặc lớp không còn mở đăng ký</h2><button className="gk-button" onClick={()=>remove(row.courseId)}>Xóa khỏi giỏ</button></div></article>;
        return <article className="gk-cart-item" key={row.courseId}><img src={courseImage(course)} alt={`Khóa học ${course.title}`} /><div className="gk-cart-item-content"><span className="gk-badge">{course.category} · {course.level}</span><h2>{course.title}</h2><p>Lớp: {selectedClass.id}<br />Khai giảng {displayDate(selectedClass.date)}<br />{selectedClass.time}<br />{selectedClass.location}</p><strong className="gk-price">{coursePrice(course.price)}</strong><div className="gk-actions"><Link className="gk-button" to={`/courses/${course.id}?class=${selectedClass.id}#classes`}>Đổi lớp</Link><button className="gk-button" onClick={() => remove(course.id)} aria-label={`Xóa ${course.title} khỏi giỏ hàng`}>Xóa</button></div></div></article>;
      })}
      <p className="gk-muted gk-note">Giỏ hàng chưa giữ chỗ học. Học phí chưa bao gồm lệ phí thi chứng chỉ.</p><Link className="gk-button" to="/courses">Tiếp tục khám phá</Link>
    </div><aside className="gk-registration gk-warm"><h2>Thông tin đơn hàng</h2><dl className="gk-order-totals"><div><dt>Tạm tính ({cart.length} khóa học)</dt><dd>{coursePrice(total)}</dd></div><div><dt>Phí đăng ký</dt><dd>0 ₫</dd></div></dl><hr /><p>Tổng thanh toán</p><strong className="gk-price">{coursePrice(total)}</strong>{cart.length>0&&<Link className="gk-button gk-primary gk-button-wide" to="/checkout/cart">Tiếp tục đăng ký</Link>}<p className="gk-demo">Kiểm tra kỹ lịch học và địa điểm trước khi tiếp tục.</p></aside></div></section>
  </>;
}
