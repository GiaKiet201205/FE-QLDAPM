import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAccountData } from '../accounts/hooks/useAccountData';
import { storeApi } from '../../services/storeApi';
import { getSession } from '../../services/api';
import { useCart as useGuestCart, addToCart as addGuest, removeFromCart as removeGuest, clearGuestCart } from '../user/cartStore';

import { StoreContext as Context } from './useStore';
export default function StoreDataProvider({children}){
 const {authUser}=useAccountData();const username=authUser?.username;const token=getSession()?.token;
 const {pathname}=useLocation();const guest=useGuestCart();
 const [catalog,setCatalog]=useState({courses:[],classes:[]});const [loading,setLoading]=useState(true);const [error,setError]=useState('');
 const [privateState,setPrivate]=useState(null);const [privateFailure,setPrivateFailure]=useState(null);
 const privateError=privateFailure&&privateFailure.token===token?privateFailure.message:'';const [retry,setRetry]=useState(0);
 const privateVersion=useRef(0);

 const refresh=useCallback(()=>setRetry(n=>n+1),[]);
 useEffect(()=>{const fn=()=>{if(document.visibilityState==='visible')refresh();};window.addEventListener('focus',fn);return()=>window.removeEventListener('focus',fn);},[refresh]);
 useEffect(()=>{let active=true;storeApi.catalog().then(data=>{if(active){setCatalog(data);setError('');setLoading(false);}}).catch(e=>{if(active){setError(e.message);setLoading(false);}});return()=>{active=false;};},[retry,pathname]);
 useEffect(()=>{
  if(!token)return;let active=true;const version=++privateVersion.current;
  Promise.all([storeApi.cart(),storeApi.orders(),storeApi.enrollments()]).then(([cart,orders,enrollments])=>{if(active&&getSession()?.token===token&&privateVersion.current===version){setPrivate({token,cart,orders,enrollments});setPrivateFailure(null);}}).catch(e=>{if(active)setPrivateFailure({token,message:e.message});});
  return()=>{active=false;};
 },[token,retry]);
 const own=privateState?.token===token?privateState:null;
 const apply=async(request,field)=>{const expected=token;const data=await request();if(getSession()?.token!==expected)throw new Error('Phiên đăng nhập đã thay đổi.');privateVersion.current++;setPrivate(s=>({...((s?.token===expected&&s)||{token:expected,cart:[],orders:[],enrollments:[]}),[field]:data}));refresh();return data;};
 const addToCart=async(courseId,classId)=>{
  if(!catalog.courses.some(c=>c.id===courseId&&c.price!==null)||!catalog.classes.some(c=>c.id===classId&&c.courseId===courseId&&c.seats>0))throw new Error('Vui lòng chọn lớp còn chỗ và có học phí.');
  if(username)await apply(()=>storeApi.mergeCart([{courseId,classId}]),'cart');else addGuest(courseId,classId);
 };
 const removeFromCart=async(courseId)=>{if(username)await apply(()=>storeApi.removeCart(courseId),'cart');else removeGuest(courseId);};
 const mergeGuest=async()=>{
  if(!username)throw new Error('Vui lòng đăng nhập để lưu giỏ hàng vào tài khoản.');
  const rows=guest.filter(row=>catalog.courses.some(c=>c.id===row.courseId&&c.price!==null)&&catalog.classes.some(c=>c.id===row.classId&&c.courseId===row.courseId&&c.seats>0));
  if(!rows.length)throw new Error('Các lớp trong giỏ khách không còn mở đăng ký. Vui lòng chọn lại khóa học.');
  await apply(()=>storeApi.mergeCart(rows),'cart');for(const row of rows)removeGuest(row.courseId);
 };
 const findUserCourse=id=>catalog.courses.find(c=>c.id===id);
 return <Context.Provider value={{...catalog,loading,error,refresh,findUserCourse,featuredCourses:catalog.courses.filter(c=>c.featured),
 cart:username?(own?.cart||[]):guest,guestCart:username?guest:[],clearGuestCart,privateLoading:Boolean(token&&!own&&!privateError),privateError:token?privateError:'',orders:own?.orders||[],enrollments:own?.enrollments||[],
 addToCart,removeFromCart,mergeGuest}}>{children}</Context.Provider>;
}
