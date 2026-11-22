import { apiRequest } from './api';
const post=(path,body)=>apiRequest(path,{method:'POST',body:JSON.stringify(body)});
export const storeApi={
 catalog:()=>apiRequest('/store/catalog',{skipAuth:true}),
 cart:()=>apiRequest('/store/me/cart'),
 mergeCart:(items)=>post('/store/me/cart',{items}),
 removeCart:(courseId)=>apiRequest(`/store/me/cart/${encodeURIComponent(courseId)}`,{method:'DELETE'}),
 enrollments:()=>apiRequest('/store/me/enrollments'),
 orders:()=>apiRequest('/store/me/orders'),
 checkout:(body)=>post('/store/me/orders',body),
 cancel:(id)=>post(`/store/me/orders/${encodeURIComponent(id)}/cancel`),
 profile:(body)=>apiRequest('/store/me/profile',{method:'PUT',body:JSON.stringify(body)}),
 consultation:(body)=>apiRequest('/store/consultations',{method:'POST',skipAuth:true,body:JSON.stringify(body)}),
 adminCatalog:()=>apiRequest('/store/admin/catalog'),
 createCourse:(body)=>post('/store/admin/courses',body),
 editCourse:(id,body)=>apiRequest(`/store/admin/courses/${encodeURIComponent(id)}`,{method:'PUT',body:JSON.stringify(body)}),
 editClass:(id,body)=>apiRequest(`/store/admin/classes/${encodeURIComponent(id)}`,{method:'PUT',body:JSON.stringify(body)}),
 adminOrders:()=>apiRequest('/store/admin/orders'),
 reject:(id)=>post(`/store/admin/orders/${encodeURIComponent(id)}/reject`),
 confirm:(id)=>post(`/store/admin/orders/${encodeURIComponent(id)}/confirm`),
 consultations:()=>apiRequest('/store/admin/consultations'),
};
