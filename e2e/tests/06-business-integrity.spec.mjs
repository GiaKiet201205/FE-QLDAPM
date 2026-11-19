import { test, expect } from '@playwright/test';

// All cases run against fresh migrated, seeded PostgreSQL via the paired FE/BE
// GitHub Actions workflows. This suite MUTATES DATA; never target production.
const api = process.env.E2E_API_URL || 'http://localhost:8080/api';
const password = process.env.E2E_SEED_PASSWORD || '123456';
test.describe.configure({ retries: 0, timeout: 180_000 });

const unique = () => Date.now().toString(36).slice(-6).toUpperCase() +
  Math.random().toString(36).slice(2, 6).toUpperCase();
function day(offset) {
  const now = new Date(Date.now() + 7 * 3600_000);
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(),
    now.getUTCDate() + offset)).toISOString().slice(0, 10);
}
const dow = (date) => ['sun','mon','tue','wed','thu','fri','sat'][
  new Date(date + 'T00:00:00Z').getUTCDay()];

async function session(request, roles) {
  const tokens = {};
  for (const role of roles) {
    const response = await request.post(api + '/auth/login', {
      data: { username: role, password },
    });
    expect(response.status(), 'login ' + role).toBe(200);
    tokens[role] = (await response.json()).token;
    expect(tokens[role]).toBeTruthy();
  }
  const headers = (role) => ({ Authorization: 'Bearer ' + tokens[role] });
  async function raw(role, method, path, data) {
    return request.fetch(api + path, {
      method, headers: headers(role),
      ...(data === undefined ? {} : { data }),
    });
  }
  async function call(role, method, path, data) {
    const response = await raw(role, method, path, data);
    const body = await response.text();
    expect(response.ok(), role + ' ' + method + ' ' + path + ' => ' +
      response.status() + ': ' + body.slice(0, 1600)).toBe(true);
    try { return JSON.parse(body); } catch { return body; }
  }
  async function denied(role, method, path, data, code) {
    const response = await raw(role, method, path, data);
    expect(response.status(), role + ' ' + method + ' ' + path + ': ' +
      (await response.text()).slice(0, 800)).toBe(code);
  }
  return { call, denied, raw, headers };
}

async function approve(ctx, employee, reviewer, date, start, end, campus = 'Cơ sở chính') {
  const slot = await ctx.call(employee, 'POST', '/availabilities', {
    availableDate: date, dayOfWeek: dow(date), shift: 'MORNING',
    startTime: start, endTime: end, availabilityType: 'WEEKLY',
    campus, note: 'isolated business-regression E2E',
  });
  expect(slot.status).toBe('PENDING');
  const result = await ctx.call(reviewer, 'PATCH',
    '/availabilities/' + slot.id + '/review', { status: 'APPROVED' });
  expect(result.status).toBe('APPROVED');
}
async function makeClass(ctx, date, endDate = date) {
  const code = 'BR-' + unique();
  const item = await ctx.call('admin', 'POST', '/classes', {
    courseId: 'course-ielts', classCode: code, name: 'Business regression ' + code,
    startDate: date, endDate,
    targetRequirements: [{ targetType: 'OVERALL_BAND', requiredTarget: 5 }],
    plannedSessions: [{ date, startTime: '09:00', endTime: '11:00' }],
  });
  const [lesson] = await ctx.call('admin', 'GET', '/classes/' + item.classId + '/planned-sessions');
  await ctx.call('admin', 'PATCH', '/classes/' + item.classId + '/status', { status: 'READY' });
  return { ...item, id: item.classId, code, lesson };
}
async function teacher(ctx, cls, employeeId = 'teacher-003', campus = 'Cơ sở chính') {
  return ctx.call('tc001', 'POST', '/teaching-schedules', {
    teacherId: employeeId, classId: cls.id, date: cls.lesson.date,
    startTime: '09:00', endTime: '11:00', campus,
  });
}
async function support(ctx, cls, employeeId = 'cs-003', workplaceId = 'center-01') {
  return ctx.call('cm001', 'POST', '/staff-schedules', {
    employeeId, staffRole: 'CS', workplaceId, classId: cls.id,
    date: cls.lesson.date, startTime: '09:00', endTime: '11:00',
    workType: 'CLASS_SUPPORT',
  });
}

test('Sale shift replacement is append-only; already-started shifts cannot be rewritten', async ({ request }) => {
  const ctx = await session(request, ['cm001', 'sale001', 'sale002']);
  const future = day(81), past = day(-71);
  for (const employee of ['sale001', 'sale002']) {
    await approve(ctx, employee, 'cm001', future, '13:00', '16:00');
  }
  const payload = (employeeId, date) => ({
    employeeId, staffRole: 'SALE', workplaceId: 'center-01', classId: null,
    date, startTime: '13:00', endTime: '15:00', workType: 'SALES_SHIFT',
  });
  const original = await ctx.call('cm001','POST','/staff-schedules',payload('sale-001',future));
  const replacement = await ctx.call('cm001','PUT',
    '/staff-schedules/' + original.id,payload('sale-002',future));
  expect(replacement.id).not.toBe(original.id);
  const staff = await ctx.call('cm001','GET','/staff-schedules?weekStart=' + future + '&role=SALE');
  expect(staff.find(s => s.id === original.id)).toMatchObject({
    employeeId: 'sale-001', status: 'CANCELLED',
  });
  expect(staff.find(s => s.id === replacement.id)).toMatchObject({
    employeeId: 'sale-002', status: 'ASSIGNED',
  });
  await approve(ctx, 'sale001','cm001',past,'13:00','16:00');
  const historic = await ctx.call('cm001','POST','/staff-schedules',payload('sale-001',past));
  await ctx.denied('cm001','PUT','/staff-schedules/' + historic.id,payload('sale-002',past),409);
  await ctx.denied('cm001','DELETE','/staff-schedules/' + historic.id,undefined,409);
});

test('approved campus is mandatory and matches both Teacher and CS workplaces', async ({ request }) => {
  const ctx = await session(request,['admin','tc001','cm001','teacher003','cs003']);
  const date = day(92);
  const cls = await makeClass(ctx,date);
  await approve(ctx,'teacher003','tc001',date,'08:30','11:30','Cơ sở Quận 1');
  await approve(ctx,'cs003','cm001',date,'08:30','11:30','Cơ sở Quận 1');
  const requestTeacher = {teacherId:'teacher-003',classId:cls.id,date,
    startTime:'09:00',endTime:'11:00'};
  await ctx.denied('tc001','POST','/teaching-schedules',requestTeacher,400);
  await ctx.denied('tc001','POST','/teaching-schedules',
    {...requestTeacher,campus:'Cơ sở chính'},409);
  const assigned = await ctx.call('tc001','POST','/teaching-schedules',
    {...requestTeacher,campus:'Cơ sở Quận 1'});
  expect(assigned.campus).toBe('Cơ sở Quận 1');
  const requestCs = {employeeId:'cs-003',staffRole:'CS',classId:cls.id,date,
    startTime:'09:00',endTime:'11:00',workType:'CLASS_SUPPORT'};
  await ctx.denied('cm001','POST','/staff-schedules',requestCs,400);
  await ctx.denied('cm001','POST','/staff-schedules',
    {...requestCs,workplaceId:'center-01'},409);
  const supported = await ctx.call('cm001','POST','/staff-schedules',
    {...requestCs,workplaceId:'center-02'});
  expect(supported.employeeId).toBe('cs-003');
});

test('Admin CS override creates a new shift and refuses rewriting historical coverage', async ({ request }) => {
  const ctx = await session(request,['admin','cm001','cs003','cs002']);
  const future = day(103);
  const cls = await makeClass(ctx,future);
  await approve(ctx,'cs003','cm001',future,'08:30','11:30');
  await approve(ctx,'cs002','cm001',future,'08:30','11:30');
  const original = await support(ctx,cls);
  const changed = await ctx.call('admin','PATCH',
    '/classes/' + cls.id + '/staff-schedules/' + original.id + '/override',
    { newCsId:'cs-002',reason:'QA substitution before lesson',allowConflict:false });
  expect(changed.id).not.toBe(original.id);
  expect(changed.employeeId).toBe('cs-002');
  expect(changed.assignmentSource).toBe('ADMIN_OVERRIDE');
  const rows = await ctx.call('cm001','GET','/staff-schedules?weekStart=' + future + '&role=CS');
  expect(rows.find(x => x.id === original.id)).toMatchObject({
    employeeId:'cs-003',status:'CANCELLED',
  });
  expect(rows.find(x => x.id === changed.id)).toMatchObject({
    employeeId:'cs-002',status:'ASSIGNED',
  });
  const past = day(-66);
  const historicClass = await makeClass(ctx,past);
  await approve(ctx,'cs003','cm001',past,'08:30','11:30');
  const historic = await support(ctx,historicClass);
  await ctx.denied('admin','PATCH',
    '/classes/' + historicClass.id + '/staff-schedules/' + historic.id + '/override',
    {newCsId:'cs-002',reason:'QA invalid historical substitution',allowConflict:false},409);
});

test('teacher attendance locks when payroll is calculated and after class completion', async ({ request }) => {
  const ctx = await session(request,['admin','tc001','cm001','teacher002','cs002']);
  const past = day(-76);
  const cls = await makeClass(ctx,past);
  await approve(ctx,'teacher002','tc001',past,'08:30','11:30');
  await approve(ctx,'cs002','cm001',past,'08:30','11:30');
  const assignment = await teacher(ctx,cls,'teacher-002');
  await support(ctx,cls,'cs-002');
  await ctx.call('admin','PATCH','/classes/' + cls.id + '/status',{status:'RUNNING'});
  await ctx.call('cs002','PUT',
    '/classes/' + cls.id + '/teacher-attendance/' + assignment.id,{status:'PRESENT'});
  const period = past.slice(0,7);
  await ctx.call('tc001','POST',
    '/payroll/calculate?period=' + period + '&employeeId=teacher-002');
  await ctx.denied('cs002','PUT',
    '/classes/' + cls.id + '/teacher-attendance/' + assignment.id,
    {status:'ABSENT'},409);
  await ctx.call('admin','PATCH','/classes/' + cls.id + '/status',{status:'COMPLETED'});
  await ctx.denied('cs002','PUT',
    '/classes/' + cls.id + '/teacher-attendance/' + assignment.id,
    {status:'LATE'},409);
});

test('simultaneous result saves remain unique; scores above the database limit are rejected', async ({ request }) => {
  const ctx = await session(request,['admin','tc001','teacher003']);
  const date = day(121);
  const cls = await makeClass(ctx,date);
  await ctx.call('admin','POST','/classes/' + cls.id + '/students',
    {studentIds:['student-0001']});
  await approve(ctx,'teacher003','tc001',date,'08:30','11:30');
  await teacher(ctx,cls);
  const assignment = await ctx.call('teacher003','POST',
    '/classes/' + cls.id + '/assignments',
    {title:'Unique result E2E',description:'',deadline:date});
  const data = (score) => ({
    studentId:'student-0001',assignmentId:assignment.id,examId:null,score,
    feedback:'QA concurrent result',
  });
  const url = '/classes/' + cls.id + '/results';
  const [one,two] = await Promise.all([
    ctx.raw('teacher003','PUT',url,data(75)),
    ctx.raw('teacher003','PUT',url,data(76)),
  ]);
  expect(one.status(),await one.text()).toBe(200);
  expect(two.status(),await two.text()).toBe(200);
  const first=await one.json(), second=await two.json();
  expect(first.id).toBe(second.id);
  const detail=await ctx.call('admin','GET','/classes/' + cls.id);
  expect(detail.results.filter(r => r.studentId==='student-0001' &&
    r.assignmentId===assignment.id)).toHaveLength(1);
  await ctx.denied('teacher003','PUT',url,data(1000),400);
  const upper=await ctx.call('teacher003','PUT',url,data(999.99));
  expect(Number(upper.score)).toBe(999.99);
});

test('rescheduled RUNNING lessons expose missing Teacher/CS and warn in the browser', async ({ request,page }) => {
  const ctx = await session(request,['admin','tc001','cm001','teacher003','cs003']);
  const originalDate=day(142), makeupDate=day(143);
  const cls=await makeClass(ctx,originalDate,day(146));
  await approve(ctx,'teacher003','tc001',originalDate,'08:30','11:30');
  await approve(ctx,'cs003','cm001',originalDate,'08:30','11:30');
  await teacher(ctx,cls);
  await support(ctx,cls);
  await ctx.call('admin','PATCH','/classes/' + cls.id + '/status',{status:'RUNNING'});
  await ctx.call('admin','POST','/classes/' + cls.id + '/reschedule',{
    originalSessionId:cls.lesson.id,newDate:makeupDate,
    newStartTime:'09:00',newEndTime:'11:00',reason:'E2E make-up lesson',
  });
  const sessions=await ctx.call('admin','GET','/classes/' + cls.id + '/planned-sessions');
  const fresh=sessions.find(s => s.status==='PLANNED' &&
    String(s.date).slice(0,10)===makeupDate);
  expect(fresh).toBeTruthy();
  expect(fresh.teacherAssigned).toBe(false);
  expect(fresh.csAssigned).toBe(false);
  await page.goto('/login');
  await page.locator('#login-identifier').fill('admin');
  await page.locator('#login-password').fill(password);
  await page.locator('button[type="submit"]').click();
  await expect(page).toHaveURL(/\/admin(?:\/|$)/);
  await page.goto('/admin/classes');
  await page.getByRole('textbox',{name:'Search classes'}).fill(cls.code);
  await page.getByText(cls.code,{exact:true}).first().click();
  await page.getByRole('tab',{name:'Schedule'}).click();
  await expect(page.getByRole('alert')).toContainText(
    'Lớp đang học có buổi tương lai chưa đủ Teacher/CS');
  await expect(page.getByText('Thiếu GV/CS')).toBeVisible();
});
