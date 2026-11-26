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
 const returnedStoredOrder=orders.find(order=>order.id===returnedOrder);
 const storedPaid=returnedStoredOrder?.paymentStatus==='PAID';
 const storedOrderStatus=returnedStoredOrder?.status;
 const returnRequest=useRef(null);
 const [error,setError]=useState('');
 useEffect(()=>{
  if(!returnedOrder||!/^gk-[a-zA-Z0-9-]+$/.test(returnedOrder))return;
  let live=true;let timer;
  // Tham số trên URL chỉ xác định đơn cần đọc; kết quả thanh toán luôn lấy từ BE.
  // Dùng lại yêu cầu khi StrictMode chạy lại effect để chỉ hiện một toast.
  if(storedPaid){
   // Dữ liệu đơn đã xác nhận từ BE được ưu tiên hơn phản hồi chờ đã lưu trước đó.
   returnRequest.current={id:returnedOrder,promise:Promise.resolve({paymentStatus:'PAID',orderStatus:storedOrderStatus}),polls:0};
  }else if(returnRequest.current?.id!==returnedOrder){
   returnRequest.current={id:returnedOrder,promise:paymentApi.status(returnedOrder),polls:0};
  }
  function finish(){
   setParams(current=>{const next=new URLSearchParams(current);next.delete('payment');return next;},{replace:true});
  }
  function readResult(){returnRequest.current.promise.then(status=>{
   if(!live)return;
   refresh();
   // Đọc nhanh trạng thái trong thời gian ngắn nếu callback đang cập nhật dữ liệu.
   const waiting=status.attempt?.provider==='ZALOPAY'&&status.paymentStatus!=='PAID'
    &&['CREATING','PENDING'].includes(status.attempt.status)&&status.orderStatus!=='CANCELLED';
   if(waiting&&returnRequest.current.polls<5){
    timer=setTimeout(()=>{
     if(!live)return;
     returnRequest.current.polls+=1;
     returnRequest.current.promise=paymentApi.status(returnedOrder);
     readResult();
    },2000);
    return;
   }
   if(status.paymentStatus==='PAID'&&status.orderStatus==='CANCELLED')toast.warning('Đơn đã hủy nhưng thanh toán đã được ghi nhận. Vui lòng liên hệ trung tâm.');
   else if(status.paymentStatus==='PAID')toast.success('Thanh toán thành công!');
   else if(status.orderStatus==='CANCELLED')toast.info('Đơn đăng ký đã hủy.');
   else if(status.attempt?.status==='FAILED')toast.error('Thanh toán chưa thành công.');
   else if(status.attempt?.status==='EXPIRED')toast.info('Phiên thanh toán đã hết hạn.');
   else toast.info('Đang chờ xác nhận thanh toán.');
   finish();
  }).catch(e=>{if(live){setError(e.message);refresh();finish();}});}
  readResult();
  return()=>{live=false;clearTimeout(timer);};
 },[returnedOrder,refresh,setParams,storedPaid,storedOrderStatus]);
 return <div className="gk-profile mx-auto max-w-5xl space-y-5 px-5 py-8 lg:py-10"><h1 className="text-2xl font-semibold">Tài khoản của tôi</h1>
 <UserProfileOverview key={`profile-${authUser.username}`} account={authUser} courseCount={orders.filter(o=>o.status!=='CANCELLED').reduce((n,o)=>n+o.items.length,0)}/><SocialConnections key={`social-${authUser.username}`}/>
 <section className="gk-social-connections"><h2>Lớp học của tôi</h2>{privateLoading||privateError?<StoreStatus loading={privateLoading} error={privateError} retry={refresh}/>:!enrollments.length?<p>Chưa có lớp được xác nhận ghi danh.</p>:enrollments.map(e=><article key={e.id} className="gk-info-box gk-mint"><h3>{e.title}</h3><p>Mã lớp: {e.classCode}</p><p>Trạng thái học viên: {e.status==='ACTIVE'?'Đang ghi danh':'Ngừng ghi danh'} · Lớp: {{DRAFT:'Đang chuẩn bị',READY:'Sắp khai giảng',RUNNING:'Đang học',COMPLETED:'Đã hoàn thành',CLOSED:'Đã đóng'}[e.classStatus]||e.classStatus}</p><p>Ngày ghi danh: {new Date(e.joinedAt).toLocaleDateString('vi-VN')}</p></article>)}</section>
 <section className="gk-social-connections"><h2>Đăng ký và khóa học của tôi</h2>{error&&<p role="alert" className="gk-danger">{error}</p>}{privateLoading||privateError?<StoreStatus loading={privateLoading} error={privateError} retry={refresh}/>:!orders.length?<p>Bạn chưa có đơn đăng ký. <Link to="/courses">Khám phá khóa học</Link></p>:orders.map(order=><article key={order.id} className="gk-info-box gk-warm"><div className="gk-results-title"><time dateTime={order.createdAt}>{new Date(order.createdAt).toLocaleString('vi-VN')}</time><span className="gk-badge">{{PENDING:'Chờ xác nhận',CONFIRMED:'Đã xác nhận ghi danh',CANCELLED:'Đã hủy'}[order.status]}</span></div>{order.items.map(item=><div className="gk-results-title" key={item.id}><div><h3>{item.title}</h3><p>Mã lớp: {item.classCode}</p></div><strong>{coursePrice(item.amount)}</strong></div>)}<p>Tổng học phí đăng ký: <strong>{coursePrice(order.amount)}</strong></p><p className={order.status==='CANCELLED'&&order.paymentStatus!=='PAID'?'gk-payment-status is-cancelled':'gk-payment-status'}>Thanh toán: {order.paymentStatus==='PAID'?'Đã thanh toán':order.status==='CANCELLED'?'Đã hủy':({PENDING:'Chờ thanh toán',UNPAID:'Chưa thanh toán'}[order.paymentStatus]||'Chưa thanh toán')}</p>{order.fulfillmentError&&<p className="gk-auth-notice">{order.fulfillmentError}</p>}</article>)}</section></div>;
}
