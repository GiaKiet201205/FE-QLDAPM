import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAccountData } from '../../features/accounts/hooks/useAccountData';
import { useStore } from '../../features/storefront/useStore';
import { coursePrice } from '../../data/userCourses';
import { paymentApi } from '../../services/paymentApi';
import SocialConnections from '../../components/user/SocialConnections';
import UserProfileOverview from '../../components/user/UserProfileOverview';
import StoreStatus from '../../components/user/StoreStatus';

export default function UserProfile(){
 const {authUser}=useAccountData();const {orders,enrollments,privateLoading,privateError,refresh}=useStore();
 const [params,setParams]=useSearchParams();const returnedOrder=params.get('payment');
 const returnRequest=useRef(null);
 const [error,setError]=useState('');
 useEffect(()=>{
  if(!returnedOrder||!/^gk-[a-zA-Z0-9-]+$/.test(returnedOrder))return;
  let live=true;
  // Tham số trên URL chỉ xác định đơn cần đọc; kết quả thanh toán luôn lấy từ BE.
  // Dùng lại yêu cầu khi StrictMode chạy lại effect để chỉ hiện một toast.
  if(returnRequest.current?.id!==returnedOrder){
   returnRequest.current={id:returnedOrder,promise:paymentApi.status(returnedOrder)};
  }
  returnRequest.current.promise.then(status=>{
   if(!live)return;
   refresh();
   if(status.paymentStatus==='PAID'&&status.orderStatus==='CANCELLED')toast.warning('Đơn đã hủy nhưng thanh toán đã được ghi nhận. Vui lòng liên hệ trung tâm.');
   else if(status.paymentStatus==='PAID')toast.success('Thanh toán thành công!');
   else if(status.orderStatus==='CANCELLED')toast.info('Đơn đăng ký đã hủy.');
   else if(status.attempt?.status==='FAILED')toast.error('Thanh toán chưa thành công.');
   else toast.info('Đang chờ xác nhận thanh toán.');
  }).catch(e=>{if(live){setError(e.message);refresh();}}).finally(()=>{
   if(live)setParams(current=>{const next=new URLSearchParams(current);next.delete('payment');return next;},{replace:true});
  });
  return()=>{live=false;};
 },[returnedOrder,refresh,setParams]);
 return <div className="gk-profile mx-auto max-w-5xl space-y-5 px-5 py-8 lg:py-10"><h1 className="text-2xl font-semibold">Tài khoản của tôi</h1>
 <UserProfileOverview key={`profile-${authUser.username}`} account={authUser} courseCount={orders.filter(o=>o.status!=='CANCELLED').reduce((n,o)=>n+o.items.length,0)}/><SocialConnections key={`social-${authUser.username}`}/>
 <section className="gk-social-connections"><h2>Lớp học của tôi</h2>{privateLoading||privateError?<StoreStatus loading={privateLoading} error={privateError} retry={refresh}/>:!enrollments.length?<p>Chưa có lớp được xác nhận ghi danh.</p>:enrollments.map(e=><article key={e.id} className="gk-info-box gk-mint"><h3>{e.title}</h3><p>Mã lớp: {e.classCode}</p><p>Trạng thái học viên: {e.status==='ACTIVE'?'Đang ghi danh':'Ngừng ghi danh'} · Lớp: {{DRAFT:'Đang chuẩn bị',READY:'Sắp khai giảng',RUNNING:'Đang học',COMPLETED:'Đã hoàn thành',CLOSED:'Đã đóng'}[e.classStatus]||e.classStatus}</p><p>Ngày ghi danh: {new Date(e.joinedAt).toLocaleDateString('vi-VN')}</p></article>)}</section>
 <section className="gk-social-connections"><h2>Đăng ký và khóa học của tôi</h2>{error&&<p role="alert" className="gk-danger">{error}</p>}{privateLoading||privateError?<StoreStatus loading={privateLoading} error={privateError} retry={refresh}/>:!orders.length?<p>Bạn chưa có đơn đăng ký. <Link to="/courses">Khám phá khóa học</Link></p>:orders.map(order=><article key={order.id} className="gk-info-box gk-warm"><div className="gk-results-title"><time dateTime={order.createdAt}>{new Date(order.createdAt).toLocaleString('vi-VN')}</time><span className="gk-badge">{{PENDING:'Chờ xác nhận',CONFIRMED:'Đã xác nhận ghi danh',CANCELLED:'Đã hủy'}[order.status]}</span></div>{order.items.map(item=><div className="gk-results-title" key={item.id}><div><h3>{item.title}</h3><p>Mã lớp: {item.classCode}</p></div><strong>{coursePrice(item.amount)}</strong></div>)}<p>Tổng học phí đăng ký: <strong>{coursePrice(order.amount)}</strong></p><p className={order.status==='CANCELLED'&&order.paymentStatus!=='PAID'?'gk-payment-status is-cancelled':'gk-payment-status'}>Thanh toán: {order.paymentStatus==='PAID'?'Đã thanh toán':order.status==='CANCELLED'?'Đã hủy':({PENDING:'Chờ thanh toán',UNPAID:'Chưa thanh toán'}[order.paymentStatus]||'Chưa thanh toán')}</p>{order.fulfillmentError&&<p className="gk-auth-notice">{order.fulfillmentError}</p>}</article>)}</section></div>;
}
