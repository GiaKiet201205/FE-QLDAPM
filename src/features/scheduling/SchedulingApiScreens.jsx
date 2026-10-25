import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiRequest, schedulingApi } from '../../services/api';
import { classApi } from '../../services/classApi';
import { addDays, campuses, days, iso, mondayOf, normalizeSlot, slotForWeek, workplaces, workTypes } from './schedulingUtils';

const input = 'w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700';
const btn = 'rounded-md border border-slate-300 px-3 py-2 text-sm hover:bg-slate-100 disabled:opacity-40';
const primary = 'rounded-md bg-[#173557] px-4 py-2 text-sm font-medium text-white hover:bg-blue-900 disabled:opacity-40';
const dayLabels = ['Thứ hai','Thứ ba','Thứ tư','Thứ năm','Thứ sáu','Thứ bảy','Chủ nhật'];
function weekDays(week) { return days.map((key,i)=>({key,label:dayLabels[i],date:iso(addDays(week,i))})); }
function Notice({error, success}) { return (error || success) ? <p role="alert" className={'rounded-md border p-3 text-sm ' + (error ? 'border-red-200 bg-red-50 text-red-700' : 'border-green-200 bg-green-50 text-green-700')}>{error || success}</p> : null; }
function WeekPicker({week,setWeek}) {
  return <div className="flex items-center gap-2"><button className={btn} onClick={()=>setWeek(addDays(week,-7))}>←</button>
    <span className="text-sm font-medium">{iso(week)} – {iso(addDays(week,6))}</span>
    <button className={btn} onClick={()=>setWeek(addDays(week,7))}>→</button></div>;
}
function useSchedulingData(role, week, mode) {
  const [data,setData] = useState({people:[],slots:[],shifts:[]});
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState('');
  const refresh = useCallback(async () => {
    setLoading(true);setError('');
    try {
      let result;
      if (mode==='register') result={people:[],slots:await schedulingApi.mineAvailability(iso(week)),shifts:[]};
      else if (mode==='mine') result={people:[],slots:[],shifts:await schedulingApi.ownSchedule(iso(week))};
      else {
        const [people,slots,shifts] = await Promise.all([
          schedulingApi.employees(role), schedulingApi.availability(role,iso(week)),
          role==='TEACHER' ? schedulingApi.teaching(iso(week)) : schedulingApi.staff(role,iso(week))
        ]);
        result={people,slots,shifts};
      }
      setData(result);
    } catch(e) { setError(e.message);setData({people:[],slots:[],shifts:[]}); }
    finally {setLoading(false);}
  },[mode,role,week]);
  useEffect(()=>{ refresh(); },[refresh]);
  return {...data,loading,error,refresh};
}
const empty = {dayOfWeek:'mon',shift:'morning',startTime:'08:30',endTime:'11:30',availabilityType:'RECURRING',campus:'Cơ sở chính',note:''};
export function AvailabilityScreen() {
  const [week,setWeek]=useState(()=>mondayOf());
  const {slots,loading,error,refresh}=useSchedulingData(null,week,'register');
  const [editing,setEditing]=useState(null);
  const [form,setForm]=useState(empty);
  const [success,setSuccess]=useState('');
  const [actionError,setActionError]=useState('');
  const [saving,setSaving]=useState(false);
  const rows=useMemo(()=>slots.map(normalizeSlot).filter(x=>slotForWeek(x,week)),[slots,week]);
  function begin(slot) {
    setEditing(slot ? slot.id : 'new');
    setForm(slot ? {dayOfWeek:slot.day,shift:slot.shift||'morning',startTime:slot.start,endTime:slot.end,
      availabilityType:slot.type||'RECURRING',availableDate:slot.availableDate||'',campus:slot.campus||'Cơ sở chính',note:slot.note||''} : {...empty});
  }
  async function save(e) {
    e.preventDefault();setActionError('');setSuccess('');
    if(form.startTime>=form.endTime){setActionError('Giờ kết thúc phải lớn hơn giờ bắt đầu');return;}
    setSaving(true);
    try {
      const body={...form,availableDate:form.availabilityType==='WEEKLY' ? iso(addDays(week,days.indexOf(form.dayOfWeek))) : null};
      if(editing==='new') await schedulingApi.createAvailability(body);
      else await schedulingApi.updateAvailability(editing,body);
      setEditing(null);setSuccess('Đã lưu đăng ký vào hệ thống.');await refresh();
    } catch(ex){setActionError(ex.message);} finally{setSaving(false);}
  }
  async function remove(id) {
    if(!window.confirm('Xóa lịch rảnh này khỏi hệ thống?')) return;
    setActionError('');setSuccess('');
    try{await schedulingApi.removeAvailability(id);setSuccess('Đã xóa lịch rảnh.');await refresh();}
    catch(ex){setActionError(ex.message);}
  }
  return <div className="space-y-4">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-semibold">Đăng ký lịch rảnh</h2><p className="text-sm text-slate-500">Dữ liệu được đồng bộ trực tiếp với backend.</p></div><button className={primary} onClick={()=>begin(null)}>+ Thêm lịch rảnh</button></div>
    <WeekPicker week={week} setWeek={setWeek}/><Notice error={error||actionError} success={success}/>
    {loading ? <p>Đang tải lịch rảnh...</p> : <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
      {weekDays(week).map(day=><section key={day.key} className="rounded-lg border bg-white p-3"><h3 className="mb-2 text-sm font-semibold">{day.label} · {day.date}</h3>
        {rows.filter(s=>(s.availableDate ? String(s.availableDate).slice(0,10)===day.date:s.day===day.key)).map(slot=>
          <div key={slot.id} className="mb-2 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm">
            <div className="font-semibold">{slot.start} – {slot.end}</div><div className="text-slate-500">{slot.campus} · {slot.status}</div>
            <div className="mt-2 flex gap-2"><button className={btn} onClick={()=>begin(slot)}>Sửa</button><button className={btn} onClick={()=>remove(slot.id)}>Xóa</button></div>
          </div>)}
      </section>)}</div>}
    {editing && <form className="space-y-3 rounded-lg border bg-white p-4" onSubmit={save}><h3 className="font-semibold">{editing==='new'?'Thêm':'Chỉnh sửa'} lịch rảnh</h3>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label>Thứ<select className={input} value={form.dayOfWeek} onChange={e=>setForm({...form,dayOfWeek:e.target.value})}>{days.map((d,i)=><option key={d} value={d}>{dayLabels[i]}</option>)}</select></label>
        <label>Ca<select className={input} value={form.shift} onChange={e=>setForm({...form,shift:e.target.value})}><option value="morning">Sáng</option><option value="afternoon">Chiều</option><option value="evening">Tối</option></select></label>
        <label>Bắt đầu<input type="time" required className={input} value={form.startTime} onChange={e=>setForm({...form,startTime:e.target.value})}/></label>
        <label>Kết thúc<input type="time" required className={input} value={form.endTime} onChange={e=>setForm({...form,endTime:e.target.value})}/></label>
        <label>Loại<select className={input} value={form.availabilityType} onChange={e=>setForm({...form,availabilityType:e.target.value})}><option value="RECURRING">Định kỳ</option><option value="WEEKLY">Theo tuần đang chọn</option></select></label>
        <label>Cơ sở<select className={input} value={form.campus} onChange={e=>setForm({...form,campus:e.target.value})}>{campuses.map(c=><option key={c}>{c}</option>)}</select></label>
        <label className="sm:col-span-2">Ghi chú<input className={input} maxLength={255} value={form.note} onChange={e=>setForm({...form,note:e.target.value})}/></label>
      </div>
      <div className="flex gap-2"><button disabled={saving} className={primary}>Lưu đăng ký</button><button type="button" className={btn} onClick={()=>setEditing(null)}>Hủy</button></div>
    </form>}
  </div>;
}
export function AssignmentScreen({role}) {
  const [week,setWeek]=useState(()=>mondayOf());
  const {people,slots,shifts,loading,error,refresh}=useSchedulingData(role,week,'assignment');
  const [selected,setSelected]=useState('');
  const [form,setForm]=useState({classId:'',date:iso(mondayOf()),startTime:'08:30',endTime:'11:30',campus:'Cơ sở chính',workplaceId:'center-01',workType:role==='CS'?'CLASS_SUPPORT':'SALES_SHIFT'});
  const [classes,setClasses]=useState([]);
  const [planned,setPlanned]=useState([]);
  const [planError,setPlanError]=useState('');
  const [message,setMessage]=useState('');const [actionError,setActionError]=useState('');
  const [saving,setSaving]=useState(false);
  useEffect(()=>{
    let active=true;
    classApi.planningClasses()
      .then(rows=>{if(active)setClasses(Array.isArray(rows)?rows:[]);})
      .catch(err=>{if(active)setPlanError(err.message || 'Không tải được danh sách lớp.');});
    return()=>{active=false;};
  },[]);
  useEffect(()=>{
    let active=true;
    if(!form.classId){setPlanned([]);return()=>{active=false;};}
    classApi.plannedSessions(form.classId)
      .then(rows=>{if(active){setPlanned((rows||[]).filter(s=>s.status==='PLANNED'));setPlanError('');}})
      .catch(err=>{if(active){setPlanned([]);setPlanError(err.message||'Không tải được lịch lớp.');}});
    return()=>{active=false;};
  },[form.classId]);
  useEffect(()=>{setSelected(people[0]?.id||'');},[people]);
  useEffect(()=>{setForm(current=>({...current,date:iso(week)}));},[week]);
  const available=slots.map(normalizeSlot);
  const person=people.find(p=>p.id===selected);
  const needsClassSlot = role==='TEACHER' || (role==='CS' && form.workType==='CLASS_SUPPORT');
  const plannedForWeek=planned.filter(s=>{
    const date=String(s.date).slice(0,10);
    return date>=iso(week) && date<=iso(addDays(week,6));
  });
  const plannedKey=s=>[String(s.date).slice(0,10),String(s.startTime).slice(0,5),String(s.endTime).slice(0,5)].join('|');
  const activeKey=[form.date,form.startTime,form.endTime].join('|');
  const matchingSession=plannedForWeek.some(s=>plannedKey(s)===activeKey);
  const occupied=new Set(
    shifts.filter(s=>s.status==='ASSIGNED' && s.classId===form.classId &&
      (role==='TEACHER' || s.workType==='CLASS_SUPPORT'))
      .map(plannedKey)
  );
  const unassigned=plannedForWeek.filter(s=>!occupied.has(plannedKey(s)));
  function chooseSlot(key){
    const s=plannedForWeek.find(row=>plannedKey(row)===key);
    if(s)setForm(old=>({...old,date:String(s.date).slice(0,10),startTime:String(s.startTime).slice(0,5),endTime:String(s.endTime).slice(0,5)}));
  }
  async function review(slot,status) {
    setMessage('');setActionError('');
    try{await schedulingApi.reviewAvailability(slot.id,status);setMessage('Đã cập nhật trạng thái đăng ký.');await refresh();}
    catch(ex){setActionError(ex.message);}
  }
  async function assign(e) {
    e.preventDefault();setActionError('');setMessage('');
    if(!selected){setActionError('Vui lòng chọn nhân sự');return;}
    if(needsClassSlot && (!form.classId || !matchingSession)){
      setActionError('Hãy chọn đúng buổi học do Admin/CS đã lập trước khi phân công.');
      return;
    }
    setSaving(true);
    try{
      if(role==='TEACHER') await schedulingApi.assignTeacher({teacherId:selected,classId:form.classId,date:form.date,startTime:form.startTime,endTime:form.endTime,campus:form.campus});
      else await schedulingApi.assignStaff({employeeId:selected,staffRole:role,workplaceId:form.workplaceId,classId:role==='CS'&&form.workType==='CLASS_SUPPORT'?form.classId:null,date:form.date,startTime:form.startTime,endTime:form.endTime,workType:form.workType});
      setMessage('Phân công đã lưu vào cơ sở dữ liệu.');await refresh();
    } catch(ex){setActionError(ex.message);} finally{setSaving(false);}
  }
  async function assignRemainingWeek() {
    setMessage('');setActionError('');
    if (!form.classId || !selected || !unassigned.length) return;
    setSaving(true);
    try {
      const sessionIds=unassigned.map(s=>s.id);
      if (role==='TEACHER') {
        await schedulingApi.assignTeacherBatch({
          teacherId:selected, classId:form.classId, campus:form.campus, sessionIds,
        });
      } else if (role==='CS' && form.workType==='CLASS_SUPPORT') {
        await schedulingApi.assignSupportBatch({
          employeeId:selected, classId:form.classId, workplaceId:form.workplaceId, sessionIds,
        });
      } else {
        throw new Error('Phân công hàng loạt chỉ áp dụng cho Teacher/CS hỗ trợ lớp.');
      }
      setMessage(`Đã phân công ${sessionIds.length} buổi. Tất cả buổi được kiểm tra và lưu cùng một giao dịch.`);
      await refresh();
    } catch(e) {
      setActionError(e.message||'Có buổi không hợp lệ. Chưa phân công buổi nào.');
    } finally {setSaving(false);}
  }
  async function replaceAssigned(row) {
    setActionError('');setMessage('');
    if (!selected || selected===(role==='TEACHER'?row.teacherId:row.employeeId)) return;
    const approved=window.confirm('Đổi nhân sự được phân công cho ca này sang người đang chọn?');
    if(!approved) return;
    setSaving(true);
    try {
      if (role === 'TEACHER' ||
          (role === 'CS' && row.workType === 'CLASS_SUPPORT' && row.classId)) {
        const lessons = await classApi.plannedSessions(row.classId);
        const lesson = (lessons || []).find((item) =>
          item.status === 'PLANNED' &&
          String(item.date).slice(0,10) === String(row.date).slice(0,10) &&
          String(item.startTime).slice(0,5) === String(row.startTime).slice(0,5) &&
          String(item.endTime).slice(0,5) === String(row.endTime).slice(0,5)
        );
        if (!lesson) throw new Error('Không tìm thấy buổi học trong kế hoạch.');
        await classApi.assignStaffingRange(row.classId, {
          role, employeeId: selected, campus: form.campus,
          workplaceId: row.workplaceId || form.workplaceId,
          mode: 'REPLACE', sessionIds: [lesson.id],
        });
      } else {
        await schedulingApi.updateStaff(row.id, {
          employeeId:selected,staffRole:role,
          workplaceId:row.workplaceId||form.workplaceId,
          classId:row.classId||null,date:String(row.date).slice(0,10),
          startTime:String(row.startTime).slice(0,5),endTime:String(row.endTime).slice(0,5),
          workType:row.workType,
        });
      }
      setMessage('Đã thay nhân sự. Ngày và giờ học của lớp được giữ nguyên.');
      await refresh();
    }catch(e){setActionError(e.message||'Không đổi được nhân sự.');}
    finally{setSaving(false);}
  }
  async function cancel(row) {
    if(!window.confirm('Hủy lịch phân công này?'))return;
    setActionError('');setMessage('');
    try {if(role==='TEACHER') await schedulingApi.cancelTeacher(row.id);else await schedulingApi.cancelStaff(row.id);setMessage('Đã hủy phân công.');await refresh();}
    catch(ex){setActionError(ex.message);}
  }
  const relevant=shifts.filter(x=>x.status==='ASSIGNED' && (
    (form.classId && needsClassSlot && x.classId===form.classId) ||
    (role==='TEACHER'?x.teacherId:x.employeeId)===selected
  ));
  return <div className="space-y-4">
    <h2 className="text-xl font-semibold">Lịch rảnh & Phân công {role==='TEACHER'?'Giáo viên':role}</h2>
    <WeekPicker week={week} setWeek={setWeek}/><Notice error={error||actionError||planError} success={message}/>
    {loading && <p className="text-sm">Đang đồng bộ lịch...</p>}
    <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
      <section className="rounded-lg border bg-white p-3"><h3 className="mb-2 font-semibold">Nhân sự</h3>
        {people.map(p=><button key={p.id} className={'mb-1 block w-full rounded p-2 text-left text-sm '+(selected===p.id?'bg-blue-100':'hover:bg-slate-100')} onClick={()=>setSelected(p.id)}>{p.fullName}<span className="block text-xs text-slate-500">{p.employeeCode}</span></button>)}
        {!people.length&&!loading&&<p className="text-sm text-slate-500">Chưa có nhân sự.</p>}
      </section>
      <div className="space-y-4">
        <section className="rounded-lg border bg-white p-3"><h3 className="mb-3 font-semibold">Lịch rảnh · {person?.fullName||'Chưa chọn'}</h3>
          <div className="grid gap-2 md:grid-cols-2">
            {available.filter(s=>s.employeeId===selected).map(slot=><div key={slot.id} className="rounded border bg-slate-50 p-3 text-sm"><strong>{dayLabels[days.indexOf(slot.day)]} · {slot.start}–{slot.end}</strong>
              <p>{slot.campus} · <span className="font-semibold">{slot.status}</span></p>
              {slot.status==='PENDING'&&<div className="mt-2 flex gap-2"><button className={btn} onClick={()=>review(slot,'APPROVED')}>Duyệt</button><button className={btn} onClick={()=>review(slot,'REJECTED')}>Từ chối</button></div>}
              {slot.status==='APPROVED'&&<button className={'mt-2 '+btn} onClick={()=>setForm(f=>({...f,...(needsClassSlot?{}:{date:slot.availableDate||iso(addDays(week,days.indexOf(slot.day))),startTime:slot.start,endTime:slot.end}),campus:slot.campus||'Cơ sở chính',workplaceId:workplaces.find(w=>w.label===slot.campus)?.id||'center-01'}))}>Chọn ca</button>}
            </div>)}
          </div>
          {!available.some(s=>s.employeeId===selected)&&<p className="text-sm text-slate-500">Không có đăng ký trong tuần này.</p>}
        </section>
        <form onSubmit={assign} className="space-y-3 rounded-lg border bg-white p-4"><h3 className="font-semibold">Tạo phân công mới</h3>
          <div className="grid gap-3 md:grid-cols-2">
          {needsClassSlot ? <>
            <label>Lớp
              <select required className={input} value={form.classId}
                onChange={e=>setForm(old=>({...old,classId:e.target.value,date:'',startTime:'',endTime:''}))}>
                <option value="">Chọn lớp đã có lịch dự kiến</option>
                {classes.map(c=><option key={c.classId||c.id} value={c.classId||c.id}>{c.classCode} · {c.name}</option>)}
              </select>
            </label>
            <label>Buổi học cần phân công
              <select required className={input} value={matchingSession?activeKey:''}
                onChange={e=>chooseSlot(e.target.value)} disabled={!form.classId}>
                <option value="">Chọn đúng buổi do Admin/CS lập</option>
                {plannedForWeek.map(s=><option key={plannedKey(s)} value={plannedKey(s)}>
                  {String(s.date).slice(0,10)} · {String(s.startTime).slice(0,5)}–{String(s.endTime).slice(0,5)}
                </option>)}
              </select>
              {form.classId && !plannedForWeek.length ?
                <span className="block text-xs text-amber-700">Tuần này không có buổi học dự kiến. Chọn tuần khác hoặc nhờ Admin/CS lập lịch.</span> : null}
            </label>
          </> : <>
            <label>Ngày<select className={input} value={form.date} onChange={e=>setForm({...form,date:e.target.value})}>
              {weekDays(week).map(day=><option key={day.date} value={day.date}>{day.label} · {day.date}</option>)}
            </select></label>
            <label>Bắt đầu<input required type="time" className={input} value={form.startTime} onChange={e=>setForm({...form,startTime:e.target.value})}/></label>
            <label>Kết thúc<input required type="time" className={input} value={form.endTime} onChange={e=>setForm({...form,endTime:e.target.value})}/></label>
          </>}
          {role==='TEACHER'?<label>Cơ sở<select className={input} value={form.campus} onChange={e=>setForm({...form,campus:e.target.value})}>{campuses.map(c=><option key={c}>{c}</option>)}</select></label>:
            <><label>Cơ sở<select className={input} value={form.workplaceId} onChange={e=>setForm({...form,workplaceId:e.target.value})}>{workplaces.map(w=><option value={w.id} key={w.id}>{w.label}</option>)}</select></label>
            <label>Loại công việc<select className={input} value={form.workType} onChange={e=>setForm({...form,workType:e.target.value})}>{workTypes[role].map(w=><option key={w.value} value={w.value}>{w.label}</option>)}</select></label></>}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button className={primary} disabled={saving||!selected||form.startTime>=form.endTime||(needsClassSlot&&!matchingSession)}>Xác nhận phân công</button>
            {needsClassSlot && form.classId ?
              <button type="button" className={btn}
                disabled={saving||!selected||!unassigned.length}
                onClick={assignRemainingWeek}>
                Phân công {unassigned.length} buổi chưa có nhân sự trong tuần
              </button> : null}
          </div>
          {needsClassSlot ? <p className="text-xs text-slate-500">
            Phân công hàng loạt là một giao dịch: nếu bất kỳ buổi nào thiếu lịch rảnh đã duyệt hoặc trùng ca, backend hủy toàn bộ.
          </p> : null}
        </form>
        <section className="rounded-lg border bg-white p-3"><h3 className="mb-2 font-semibold">Lịch đã phân công</h3>
          {relevant.map(row=><div className="flex items-center justify-between gap-3 border-b py-2 text-sm" key={row.id}>
          <span>{String(row.date).slice(0,10)} · {row.startTime}–{row.endTime} · {row.teacherName||row.employeeName||''} · {row.classCode||row.workType||row.classId}</span>
          <div className="flex gap-2">
            {selected !== (role==='TEACHER'?row.teacherId:row.employeeId) ?
              <button className={btn} disabled={saving} onClick={()=>replaceAssigned(row)}>
                Đổi sang nhân sự đang chọn
              </button> : null}
            <button className={btn} disabled={saving} onClick={()=>cancel(row)}>Hủy ca</button>
          </div></div>)}
          {!relevant.length&&<p className="text-sm text-slate-500">Chưa có lịch phân công.</p>}
        </section>
      </div></div>
  </div>;
}
export function MyScheduleScreen({role}) {
  const [week,setWeek]=useState(()=>mondayOf());
  const {shifts,loading,error}=useSchedulingData(role,week,'mine');
  return <div className="space-y-4"><h2 className="text-xl font-semibold">{role==='TEACHER'?'Lịch dạy':'Lịch làm việc'} của tôi</h2><WeekPicker week={week} setWeek={setWeek}/><Notice error={error}/>
    {loading?<p>Đang tải...</p>:<div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">{weekDays(week).map(day=><section className="rounded-lg border bg-white p-3" key={day.key}><h3 className="mb-2 font-semibold">{day.label} · {day.date}</h3>
    {shifts.filter(row=>String(row.date).slice(0,10)===day.date).map(row=><div className="mb-2 rounded border border-blue-200 bg-blue-50 p-3 text-sm" key={row.id}><strong>{row.startTime} – {row.endTime}</strong><p>{row.className||row.classCode||row.workType||'Ca làm việc'}</p><p className="text-slate-500">{row.status}</p></div>)}</section>)}</div>}
  </div>;
}
