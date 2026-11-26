import { toast } from 'react-toastify';
import { paymentApi, openPayment } from '../../services/paymentApi';
import PaymentMethods from '../../components/user/PaymentMethods';
import './payment.css';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { coursePrice } from '../../data/userCourses';
import { courseImage, displayDate } from '../../data/storefront';
import { useAccountData } from '../../features/accounts/hooks/useAccountData';
import { useStore } from '../../features/storefront/useStore';
import { storeApi } from '../../services/storeApi';
import StoreStatus from '../../components/user/StoreStatus';

export default function UserCheckout(){
 const {courseId}=useParams();const [params]=useSearchParams();const navigate=useNavigate();
 const {authUser,loggingOut,updateProfile}=useAccountData();
 const {cart,classes,findUserCourse,loading,error,privateLoading,privateError,refresh}=useStore();
 const [providers,setProviders]=useState(null);const [selectedProvider,setSelectedProvider]=useState(null);
 const provider=selectedProvider||(['VNPAY','ZALOPAY'].find(p=>providers?.[p]?.enabled))||'VNPAY';
 const providerName=provider==='ZALOPAY'?'ZaloPay':'VNPAY';
 const [pending,setPending]=useState(false);const [failure,setFailure]=useState('');const busy=useRef(false);
 useEffect(()=>{let live=true;paymentApi.providers().then(data=>{if(live)setProviders(data);}).catch(e=>{if(live)setFailure(e.message);});return()=>{live=false;};},[]);
 const [profile,setProfile]=useState({fullName:authUser.user===authUser.username?'':authUser.user,email:authUser.contactEmail||authUser.email||'',phone:authUser.phone||''});
 const [createdOrder,setCreatedOrder]=useState(null);
 const rows=createdOrder?createdOrder.items.map(item=>({courseId:item.courseId,classId:item.classId}))
  :courseId==='cart'?cart:[{courseId,classId:params.get('class')||''}];
 const signature=rows.map(r=>r.courseId+':'+r.classId).sort().join('|');
 const requestKey=useMemo(()=>signature?crypto.randomUUID():'',[signature]);
 const total=createdOrder?.amount??rows.reduce((sum,row)=>sum+(findUserCourse(row.courseId)?.price||0),0);
 const valid=rows.length>0&&rows.every(row=>findUserCourse(row.courseId)?.price!=null&&classes.some(c=>c.id===row.classId&&c.courseId===row.courseId&&c.seats>0));
 async function complete(event){event.preventDefault();if(busy.current||loggingOut||(!valid&&!createdOrder)||!providers?.[provider]?.enabled)return;busy.current=true;setPending(true);setFailure('');try{
  const contact=Object.fromEntries(Object.entries(profile).map(([key,value])=>[key,value.trim()]));
  if(!contact.fullName||contact.fullName.length>100)throw new Error('Vui lòng nhập họ tên, tối đa 100 ký tự.');
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)||contact.email.length>100)throw new Error('Vui lòng nhập email hợp lệ, tối đa 100 ký tự.');
  if(!/^\+?[0-9]{9,15}$/.test(contact.phone))throw new Error('Số điện thoại gồm 9–15 chữ số.');
  // Cập nhật cả dữ liệu và trạng thái profile trước khi tạo đơn hoặc mở cổng thanh toán.
  if(contact.fullName!==authUser.user||contact.phone!==authUser.phone||contact.email!==(authUser.contactEmail||authUser.email)){
   const result=await updateProfile(contact);
   if(!result.ok)throw new Error(Object.values(result.errors||{}).join(' ')||'Không thể cập nhật thông tin cá nhân.');
  }
  setProfile(contact);
  // Giữ lại đơn đã tạo để có thể mở lại cổng thanh toán mà không tạo thêm đơn.
  const order=createdOrder||await storeApi.checkout({requestKey,items:rows,profile:contact});
  setCreatedOrder(order);
  const status=await openPayment(order.id,provider);
  refresh();
  if(status.paymentStatus==='PAID'){
   toast.success('Thanh toán thành công!');
   navigate('/user/profile',{replace:true});
  }
 }catch(e){setFailure(e.message);refresh();}finally{busy.current=false;setPending(false);}}
 if(loading||error||privateLoading||privateError)return <StoreStatus loading={loading||privateLoading} error={error||privateError} retry={refresh}/>;
 return <><section className="gk-page-hero gk-warm"><div className="gk-container"><p className="gk-breadcrumb"><Link to="/cart">Giỏ hàng</Link> / Đăng ký</p><h1>Xác nhận hành trình học tập</h1><p className="gk-muted">Kiểm tra lớp học và thông tin liên hệ trước khi gửi đăng ký.</p></div></section><section className="gk-section"><form className="gk-container gk-cart-grid" onSubmit={complete}><div>
<section className="gk-contact-form"><h2>Thông tin người đăng ký</h2><p className="gk-muted">Bạn có thể chỉnh sửa trực tiếp. Thông tin sẽ được cập nhật vào profile khi bấm Tiếp tục thanh toán.</p>{[['fullName','Họ và tên','text'],['phone','Số điện thoại','tel'],['email','Email liên hệ','email']].map(([name,label,type])=><label key={name}>{label}<input required name={name} type={type} maxLength={name==='phone'?15:100} pattern={name==='phone'?'[+]?[0-9]{9,15}':undefined} value={profile[name]} onChange={e=>setProfile(p=>({...p,[name]:e.target.value}))} disabled={pending}/></label>)}</section>
{rows.map(row=>{const course=findUserCourse(row.courseId),cl=classes.find(c=>c.id===row.classId&&c.courseId===row.courseId);return <article className="gk-cart-item" key={row.courseId}>{course&&<img src={courseImage(course)} alt={course.title}/>}<div className="gk-cart-item-content"><h2>{course?.title||'Khóa học không còn hiển thị'}</h2><p>{cl?<>Lớp: {cl.code}<br/>{displayDate(cl.date)} · {cl.time}<br/>{cl.location}</>:'Lớp không còn mở đăng ký. Vui lòng chọn lại.'}</p><strong className="gk-price">{coursePrice(course?.price)}</strong><Link className="gk-button" to={`/courses/${row.courseId}#classes`}>Chọn lại lớp</Link></div></article>;})}
 <PaymentMethods providers={providers} value={provider} onChange={setSelectedProvider} disabled={pending}/>{providers&&!Object.values(providers).some(p=>p.enabled)&&<p className="gk-auth-notice">Trung tâm chưa kích hoạt thanh toán sandbox. Vui lòng liên hệ GK để được hỗ trợ.</p>}</div>
 <aside className="gk-registration gk-warm"><h2>Thông tin đăng ký</h2><p>Tài khoản: {authUser.username}</p><p>{rows.length} khóa học</p><strong className="gk-price">{coursePrice(total)}</strong><p className="gk-muted">Chọn VNPAY hoặc ZaloPay để tiếp tục. Kết quả thanh toán sẽ được cập nhật sau khi nhà cung cấp xác nhận.</p>{failure&&<p role="alert" className="gk-danger">{failure}{createdOrder&&<> <Link to="/user/profile">Xem đơn đăng ký trong profile</Link></>}</p>}{!valid&&!createdOrder&&<p role="alert" className="gk-danger">Vui lòng chọn lại lớp còn chỗ và có học phí.</p>}<label className="gk-consent"><input type="checkbox" required disabled={pending}/>Tôi đã kiểm tra thông tin và đồng ý gửi đăng ký tới GK.</label><button className="gk-button gk-primary gk-button-wide" disabled={pending||loggingOut||(!valid&&!createdOrder)||!providers?.[provider]?.enabled}>{pending?'Đang chuyển đến '+providerName+'...':'Tiếp tục thanh toán'}</button></aside></form></section></>;
}
