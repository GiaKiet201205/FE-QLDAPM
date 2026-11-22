import { useState } from 'react';
import { useAccountData } from '../accounts/hooks/useAccountData';

export default function useUserProfileForm(account){
 const {updateProfile}=useAccountData();
 const [savedProfile,setSavedProfile]=useState({fullName:account.user!==account.username?account.user:'',phone:account.phone||'',email:account.contactEmail||account.email||''});
 const [form,setForm]=useState(savedProfile);const [errors,setErrors]=useState({});const [saved,setSaved]=useState(false);const [pending,setPending]=useState(false);
 const dirty=Object.keys(form).some(key=>form[key]!==savedProfile[key]);
 function updateField(e){const {name,value}=e.target;setForm(p=>({...p,[name]:value}));setErrors({});setSaved(false);}
 function resetForm(){setForm(savedProfile);setErrors({});setSaved(false);}
 async function saveProfile(e){e.preventDefault();if(pending)return;const profile=Object.fromEntries(Object.entries(form).map(([k,v])=>[k,v.trim()]));const validation={};if(!profile.fullName||profile.fullName.length>100)validation.fullName='Nhập họ tên, tối đa 100 ký tự.';if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)||profile.email.length>100)validation.email='Vui lòng nhập email hợp lệ.';if(profile.phone&&!/^\+?[0-9]{9,15}$/.test(profile.phone))validation.phone='Số điện thoại gồm 9–15 chữ số.';setErrors(validation);if(Object.keys(validation).length)return;setPending(true);setSaved(false);try{const result=await updateProfile(profile);if(!result.ok){setErrors(result.errors);return;}setSavedProfile(profile);setForm(profile);setSaved(true);}finally{setPending(false);}}
 return {form,savedProfile,errors,saved,dirty,pending,updateField,resetForm,saveProfile};
}
