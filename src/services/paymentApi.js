import { apiRequest } from './api';
export const paymentApi={
 providers:()=>apiRequest('/payments/providers',{skipAuth:true}),
 status:(id)=>apiRequest(`/payments/orders/${encodeURIComponent(id)}`),
 start:(id,provider)=>apiRequest(`/payments/orders/${encodeURIComponent(id)}`,{method:'POST',body:JSON.stringify({provider})}),
};
