import { apiRequest } from './api';
export const paymentApi={
 providers:()=>apiRequest('/payments/providers',{skipAuth:true}),
 status:(id)=>apiRequest(`/payments/orders/${encodeURIComponent(id)}`),
 start:(id,provider)=>apiRequest(`/payments/orders/${encodeURIComponent(id)}`,{method:'POST',body:JSON.stringify({provider})}),
};

// Mở cổng đã chọn sau khi xác nhận thông tin đăng ký.
export async function openPayment(orderId,provider) {
 const name={VNPAY:'VNPAY',ZALOPAY:'ZaloPay'}[provider];
 if(!name)throw new Error('Phương thức thanh toán không hợp lệ.');
 const status=await paymentApi.start(orderId,provider);
 if(status.paymentStatus==='PAID')return status;
 const attempt=status.attempt;
 let url;
 try{url=new URL(attempt?.payUrl);}catch{throw new Error(`Chưa tạo được đường dẫn ${name}. Vui lòng bấm Tiếp tục thanh toán để thử lại.`);}
 const hosts=provider==='VNPAY'?[status.sandbox?'sandbox.vnpayment.vn':'pay.vnpay.vn']
  :status.sandbox?['qcgateway.zalopay.vn','sbgateway.zalopay.vn','sbcheckout.zalopay.vn']:[];
 const expiresAt=new Date(attempt?.expiresAt).getTime();
 if(status.orderId!==orderId||status.orderStatus==='CANCELLED'||attempt.provider!==provider
  ||attempt.status!=='PENDING'||!Number.isFinite(expiresAt)||expiresAt<=Date.now()
  ||url.protocol!=='https:'||!hosts.includes(url.host)||url.username||url.password){
  throw new Error(`Đường dẫn thanh toán ${name} không hợp lệ. Vui lòng thử lại tại bước xác nhận đăng ký.`);
 }
 window.location.assign(url.href);
 return status;
}
