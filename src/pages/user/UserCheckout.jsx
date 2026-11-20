import { paymentApi } from '../../services/paymentApi';
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
 const {authUser,loggingOut,reloadProfile}=useAccountData();
 const {cart,classes,findUserCourse,loading,error,privateLoading,privateError,refresh}=useStore();
 const [providers,setProviders]=useState(null);const [selectedProvider,setSelectedProvider]=useState(null);
 const provider=selectedProvider||(['VNPAY','MOMO'].find(p=>providers?.[p]?.enabled))||'VNPAY';
 const [pending,setPending]=useState(false);const [failure,setFailure]=useState('');const busy=useRef(false);
 useEffect(()=>{let live=true;paymentApi.providers().then(data=>{if(live)setProviders(data);}).catch(e=>{if(live)setFailure(e.message);});return()=>{live=false;};},[]);
 const [profile,setProfile]=useState({fullName:authUser.user===authUser.username?'':authUser.user,email:authUser.contactEmail||authUser.email,phone:authUser.phone||''});
 const rows=courseId==='cart'?cart:[{courseId,classId:params.get('class')||''}];
 const signature=rows.map(r=>r.courseId+':'+r.classId).sort().join('|');
 const request=useMemo(()=>({signature,key:crypto.randomUUID()}),[signature]);
 const requestKey=request.key;
 const total=rows.reduce((sum,row)=>sum+(findUserCourse(row.courseId)?.price||0),0);
 const valid=rows.length>0&&rows.every(row=>findUserCourse(row.courseId)?.price!=null&&classes.some(c=>c.id===row.classId&&c.courseId===row.courseId&&c.seats>0));
 async function complete(event){event.preventDefault();if(busy.current||loggingOut||!valid||!providers?.[provider]?.enabled)return;busy.current=true;setPending(true);setFailure('');try{
  const order=await storeApi.checkout({requestKey,items:rows,profile});let paymentError='';try{await paymentApi.start(order.id,provider);}catch(e){paymentError=e.message;}refresh();navigate(`/payment/${order.id}`,{replace:true,state:{provider,paymentError}});reloadProfile();
 }catch(e){setFailure(e.message);refresh();}finally{busy.current=false;setPending(false);}}
 if(loading||error||privateLoading||privateError)return <StoreStatus loading={loading||privateLoading} error={error||privateError} retry={refresh}/>;
 return <><section className="gk-page-hero gk-warm"><div className="gk-container"><p className="gk-breadcrumb"><Link to="/cart">Giỏ hàng</Link> / Đăng ký</p><h1>Xác nhận hành trình học tập</h1><p className="gk-muted">Kiểm tra lớp học và thông tin liên hệ trước khi gửi đăng ký.</p></div></section><section className="gk-section"><form className="gk-container gk-cart-grid" onSubmit={complete}><div>{rows.map(row=>{const course=findUserCourse(row.courseId),cl=classes.find(c=>c.id===row.classId&&c.courseId===row.courseId);return <article className="gk-cart-item" key={row.courseId}>{course&&<img src={courseImage(course)} alt={course.title}/>}<div className="gk-cart-item-content"><h2>{course?.title||'Khóa học không còn hiển thị'}</h2><p>{cl?<>Lớp: {cl.code}<br/>{displayDate(cl.date)} · {cl.time}<br/>{cl.location}</>:'Lớp không còn mở đăng ký. Vui lòng chọn lại.'}</p><strong className="gk-price">{coursePrice(course?.price)}</strong><Link className="gk-button" to={`/courses/${row.courseId}#classes`}>Chọn lại lớp</Link></div></article>;})}
 <section className="gk-contact-form"><h2>Thông tin người đăng ký</h2>{[['fullName','Họ và tên','text'],['phone','Số điện thoại','tel'],['email','Email liên hệ','email']].map(([name,label,type])=><label key={name}>{label}<input required name={name} type={type} maxLength={name==='phone'?15:100} pattern={name==='phone'?'[+]?[0-9]{9,15}':undefined} value={profile[name]} onChange={e=>setProfile(p=>({...p,[name]:e.target.value}))} disabled={pending}/></label>)}</section><PaymentMethods providers={providers} value={provider} onChange={setSelectedProvider} disabled={pending}/>{providers&&!Object.values(providers).some(p=>p.enabled)&&<p className="gk-auth-notice">Trung tâm chưa kích hoạt thanh toán sandbox. Vui lòng liên hệ GK để được hỗ trợ.</p>}</div>
 <aside className="gk-registration gk-warm"><h2>Thông tin đăng ký</h2><p>Tài khoản: {authUser.username}</p><p>{rows.length} khóa học</p><strong className="gk-price">{coursePrice(total)}</strong><p className="gk-muted">Chọn VNPAY hoặc MoMo để tiếp tục. Kết quả thanh toán sẽ được cập nhật sau khi nhà cung cấp xác nhận.</p>{failure&&<p role="alert" className="gk-danger">{failure}</p>}{!valid&&<p role="alert" className="gk-danger">Vui lòng chọn lại lớp còn chỗ và có học phí.</p>}<label className="gk-consent"><input type="checkbox" required disabled={pending}/>Tôi đã kiểm tra thông tin và đồng ý gửi đăng ký tới GK.</label><button className="gk-button gk-primary gk-button-wide" disabled={pending||loggingOut||!valid||!providers?.[provider]?.enabled}>{pending?'Đang tạo thanh toán...':'Tiếp tục thanh toán'}</button></aside></form></section></>;
}
