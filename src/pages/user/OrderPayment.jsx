import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { CheckCircle2, Clock3, ShieldCheck } from 'lucide-react';
import { toast } from 'react-toastify';
import QRCode from 'qrcode';
import { paymentApi } from '../../services/paymentApi';
import { coursePrice } from '../../data/userCourses';
import { useStore } from '../../features/storefront/useStore';
import PaymentMethods from '../../components/user/PaymentMethods';
import StoreStatus from '../../components/user/StoreStatus';
import './payment.css';

export default function OrderPayment(){
 const {orderId}=useParams();const location=useLocation();const {refresh}=useStore();
 const [loaded,setLoaded]=useState(null);const [failure,setFailure]=useState('');const [pending,setPending]=useState(false);const [selection,setSelection]=useState(null);const [qr,setQr]=useState(null);const [now,setNow]=useState(Date.now);
 const busy=useRef(false);const notified=useRef('');
 const data=loaded?.orderId===orderId?loaded.status:null;const providers=loaded?.providers;
 const attempt=data?.attempt;const attemptId=attempt?.id;const paid=data?.paymentStatus==='PAID';
 const provider=selection||location.state?.provider||attempt?.provider||(['VNPAY','MOMO'].find(p=>providers?.[p]?.enabled))||'VNPAY';
 const remaining=attempt?Math.max(0,Math.ceil((new Date(attempt.expiresAt).getTime()-now)/1000)):0;
 const active=attempt&&['CREATING','PENDING'].includes(attempt.status)&&remaining>0&&!paid;
 const error=failure||(!attempt&&!paid?location.state?.paymentError:'');
 const load=useCallback(async()=>{try{const [status,available]=await Promise.all([paymentApi.status(orderId),paymentApi.providers()]);setLoaded({orderId,status,providers:available});setFailure('');}catch(e){setFailure(e.message);}},[orderId]);
 useEffect(()=>{let live=true;Promise.all([paymentApi.status(orderId),paymentApi.providers()]).then(([status,available])=>{if(live)setLoaded({orderId,status,providers:available});}).catch(e=>{if(live)setFailure(e.message);});return()=>{live=false;};},[orderId]);
 useEffect(()=>{if(!attemptId||paid)return;const timer=setInterval(()=>setNow(Date.now()),1000);return()=>clearInterval(timer);},[attemptId,paid]);
 const waiting=Boolean(data&&((!paid&&['CREATING','PENDING'].includes(attempt?.status))||(paid&&data.orderStatus==='PENDING'&&!data.fulfillmentError)));
 useEffect(()=>{
  if(!waiting)return;let live=true;let inFlight=false;
  const poll=async()=>{if(inFlight||document.hidden)return;inFlight=true;try{const status=await paymentApi.status(orderId);if(live){setLoaded(s=>s?.orderId===orderId?{...s,status}:s);setFailure('');}}catch(e){if(live)setFailure(e.message);}finally{inFlight=false;}};
  const timer=setInterval(poll,3000);return()=>{live=false;clearInterval(timer);};
 },[waiting,orderId]);
 useEffect(()=>{if(paid&&notified.current!==orderId){notified.current=orderId;toast.success('Thanh toán hoàn tất!');refresh();}},[paid,orderId,refresh]);
 useEffect(()=>{let live=true;if(attempt?.qrData)QRCode.toDataURL(attempt.qrData,{width:320,margin:3,errorCorrectionLevel:'M',color:{dark:'#102b43',light:'#ffffff'}}).then(url=>{if(live)setQr({data:attempt.qrData,url});}).catch(()=>{if(live)setQr(null);});return()=>{live=false;};},[attempt?.qrData]);
 async function start(){if(busy.current)return;busy.current=true;setPending(true);setFailure('');try{const status=await paymentApi.start(orderId,provider);setLoaded(s=>({...s,orderId,status}));}catch(e){setFailure(e.message);}finally{busy.current=false;setPending(false);}}
 if(!data)return <StoreStatus loading={!error} error={error} retry={load}/>;
 return <section className="gk-section gk-warm gk-payment-page"><div className="gk-container"><p className="gk-breadcrumb"><Link to="/user/profile">Tài khoản</Link> / Thanh toán</p><div className="gk-payment-heading"><div><p className="gk-eyebrow">Hoàn tất đăng ký cùng GK</p><h1>{paid?'Thanh toán hoàn tất':'Thanh toán khóa học'}</h1></div><span className="gk-badge">{data.sandbox?'Môi trường thử nghiệm':'Thanh toán trực tuyến'}</span></div>
 {data.sandbox&&<p className="gk-payment-sandbox">Đây là thanh toán sandbox. Sử dụng tài khoản hoặc ứng dụng thử nghiệm do nhà cung cấp hướng dẫn.</p>}
 {error&&<p className="gk-auth-notice" role="alert">{error}</p>}
 {paid?<div className="gk-payment-success" role="status"><CheckCircle2 size={56}/><h2>GK đã ghi nhận thanh toán của bạn</h2><strong className="gk-price">{coursePrice(data.amount)}</strong><p>Mã đơn: {orderId}</p>{attempt?.status==='PAID'&&<p>Mã giao dịch: {attempt.transactionId}</p>}<p>{data.paidAt&&new Date(data.paidAt).toLocaleString('vi-VN')}</p><p>{data.fulfillmentError||(data.orderStatus==='CONFIRMED'?'Bạn đã được ghi danh. Xem lớp học trong tài khoản của bạn.':'Hệ thống đang hoàn tất kiểm tra ghi danh. Vui lòng chờ hoặc xem lại trong tài khoản.')}</p><div className="gk-actions"><Link className="gk-button gk-primary" to="/user/profile">Xem khóa học của tôi</Link><Link className="gk-button" to="/courses">Khám phá thêm khóa học</Link></div></div>:data.orderStatus==='CANCELLED'?<div className="gk-payment-success"><h2>Đơn đăng ký đã hủy</h2><p>Đơn này không thể tiếp tục thanh toán.</p><Link className="gk-button" to="/courses">Chọn khóa học khác</Link></div>:<div className="gk-payment-grid"><div className="gk-payment-panel"><h2>{active?'Quét mã hoặc mở cổng thanh toán':'Chọn phương thức thanh toán'}</h2>{active?<><p className="gk-muted">{attempt.provider==='MOMO'?'Dùng ứng dụng MoMo thử nghiệm theo hướng dẫn của nhà cung cấp.':'Quét mã để mở cổng VNPAY; chọn ngân hàng hoặc phương thức được hỗ trợ tại cổng.'}</p>{qr?.data===attempt.qrData?<img className="gk-payment-qr" src={qr.url} width="320" height="320" alt={`Mã mở thanh toán ${attempt.provider} cho đơn ${orderId}`}/>:<div className="gk-payment-qr-placeholder" role="status">{attempt.status==='CREATING'?'Đang khởi tạo giao dịch. Hãy kiểm tra lại trạng thái trong giây lát.':'Đang tạo hình QR...'}</div>}<div className="gk-payment-timer"><Clock3 size={17}/><span>Thời hạn trên web: {Math.floor(remaining/60)}:{String(remaining%60).padStart(2,'0')}</span></div>{attempt.payUrl&&<a className="gk-button gk-primary" href={attempt.payUrl} rel="noreferrer">Mở {attempt.provider==='MOMO'?'MoMo':'VNPAY'} để thanh toán</a>}<p className="gk-muted">Trang sẽ tự cập nhật sau khi nhận kết quả. Quét mã hoặc đóng cổng thanh toán chưa phải là xác nhận đã trả tiền.</p></>:<><PaymentMethods providers={providers} value={provider} onChange={setSelection} disabled={pending}/>{attempt&&<p className="gk-auth-notice">{attempt.status==='FAILED'?'Giao dịch chưa thành công. Bạn có thể tạo mã khác.':'Mã trước đã hết thời hạn trên web. Nếu bạn vừa trả tiền, kiểm tra lại trạng thái trước khi tạo giao dịch khác.'}</p>}<button className="gk-button gk-primary" disabled={pending||!providers?.[provider]?.enabled} onClick={start}>{pending?'Đang tạo giao dịch...':'Tạo mã thanh toán'}</button></>}<button className="gk-button" disabled={pending} onClick={load}>Kiểm tra trạng thái</button></div>
 <aside className="gk-payment-panel gk-payment-summary"><h2>Thông tin đơn hàng</h2><p className="gk-payment-order-id">{orderId}</p><p>Tổng học phí</p><strong className="gk-price">{coursePrice(data.amount)}</strong><div className="gk-payment-trust"><ShieldCheck size={22}/><p>Kết quả được xác nhận trực tiếp từ nhà cung cấp thanh toán.</p></div><Link className="gk-button" to="/user/profile">Xem đơn đăng ký</Link></aside></div>}
 </div></section>;
}
