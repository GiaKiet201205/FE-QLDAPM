const BASE_URL =
  (import.meta.env.VITE_API_URL || '/api').replace(/\/+$/, '')

const SESSION_KEY = 'qldapm.scheduling.session'
const PUBLIC_AUTH_PATHS = new Set(['/auth/login', '/auth/register', '/auth/social/providers', '/auth/social/start', '/auth/social/exchange'])

/* =========================================================
   API ERROR
========================================================= */

export class ApiError extends Error {
  constructor(message, status, body = null) {
    super(message)

    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}


/* =========================================================
   SESSION
========================================================= */

function parseSession(raw) {
  if (!raw) return null;
  try {
    const session = JSON.parse(raw);
    if (
      !session ||
      typeof session.token !== 'string' ||
      !session.token ||
      typeof session.username !== 'string' ||
      !session.username ||
      typeof session.role !== 'string' ||
      !session.role
    ) return null;

    const isCustomer = session.role === 'USER';
    if (import.meta.env.VITE_APP_TARGET === 'admin' ? isCustomer : !isCustomer) return null;

    // Reject expired JWTs rather than treating a stale browser session as logged in.
    const jwtPayload = session.token.split('.')[1];
    if (!jwtPayload) return null;
    const payload = JSON.parse(
      atob(jwtPayload.replace(/-/g, '+').replace(/_/g, '/')),
    );
    if (
      !Number.isFinite(payload.exp) ||
      payload.exp * 1000 <= Date.now()
    ) return null;

    return session;
  } catch {
    return null;
  }
}

export function getSession() {
  return (
    parseSession(sessionStorage.getItem(SESSION_KEY)) ||
    parseSession(localStorage.getItem(SESSION_KEY))
  );
}

export function isSessionRemembered() {
  return Boolean(parseSession(localStorage.getItem(SESSION_KEY)));
}

export function saveSession(session, remember = false) {
  // Remove any previous session so old tokens cannot survive logout or account switch.
  sessionStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(SESSION_KEY);

  if (!session) return;

  const storage = remember ? localStorage : sessionStorage;
  storage.setItem(SESSION_KEY, JSON.stringify(session));
}

/* =========================================================
   TOKEN

   Giữ lại 2 function này để tương thích nếu file khác
   trong project vẫn đang import getAccessToken /
   setAccessToken.
========================================================= */

export function getAccessToken() {
  return getSession()?.token || null
}


export function setAccessToken(token) {
  const currentSession = getSession()

  if (!token) {
    saveSession(null)
    return
  }

  saveSession(
    {
      ...(currentSession || {}),
      token,
    },
    Boolean(localStorage.getItem(SESSION_KEY)),
  )
}


/* =========================================================
   UNAUTHORIZED
========================================================= */

function handleUnauthorized() {
  saveSession(null)

  /*
    Event chính mà App.jsx hiện tại đang lắng nghe.
  */
  window.dispatchEvent(
    new Event('qldapm:session-expired'),
  )

  /*
    Giữ event cũ để tránh lỗi nếu một module cũ
    vẫn còn đang lắng nghe event này.
  */
  window.dispatchEvent(
    new Event('iig:unauthorized'),
  )
}


/* =========================================================
   API REQUEST
========================================================= */

export async function apiRequest(
  path,
  options = {},
) {
  const { skipAuth = false, ...requestOptions } = options
  const token = skipAuth ? null : getAccessToken()

  // Spring Security can return 403 when a missing/expired JWT reaches a
  // protected endpoint. Detect stale local sessions before making the request.
  if (
    !skipAuth &&
    !PUBLIC_AUTH_PATHS.has(path) &&
    !token &&
    (sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY))
  ) {
    handleUnauthorized()
    throw new ApiError('Phiên đăng nhập đã hết hạn.', 401)
  }

  const headers = new Headers(
    requestOptions.headers || {},
  )

  /*
    Chỉ tự động set JSON khi request thực sự có body.

    Không set Content-Type nếu body là FormData,
    vì browser cần tự thêm boundary.
  */
  if (
    requestOptions.body != null &&
    !(requestOptions.body instanceof FormData) &&
    !headers.has('Content-Type')
  ) {
    headers.set(
      'Content-Type',
      'application/json',
    )
  }

  /*
    Gắn JWT
  */
  if (
    token &&
    !headers.has('Authorization')
  ) {
    headers.set(
      'Authorization',
      `Bearer ${token}`,
    )
  }

  let response

  try {
    response = await fetch(
      `${BASE_URL}${path}`,
      {
        ...requestOptions,
        headers,
      },
    )
  } catch (error) {
    throw new ApiError(
      'Không thể kết nối tới máy chủ GK. Vui lòng thử lại sau.',
      0,
      error,
    )
  }


  /* =======================================================
     PARSE RESPONSE
  ======================================================= */

  let body = null

  if (response.status !== 204) {
    const contentType =
      response.headers.get('content-type') || ''

    try {
      if (
        contentType.includes(
          'application/json',
        )
      ) {
        body = await response.json()
      } else {
        body = await response.text()
      }
    } catch {
      body = null
    }
  }


  /* =======================================================
     HTTP ERROR
  ======================================================= */

  if (!response.ok) {
    if (
      response.status === 401 &&
      !skipAuth &&
      !PUBLIC_AUTH_PATHS.has(path)
    ) {
      // A failed request from a previous login must not clear a newer session.
      const currentToken = getAccessToken()
      if (!currentToken || currentToken === token) handleUnauthorized()
    }

    let message =
      [502, 503, 504].includes(response.status)
        ? 'Máy chủ GK đang tạm thời không khả dụng. Vui lòng thử lại sau.'
        : `API error: ${response.status}`

    if (
      body &&
      typeof body === 'object' &&
      body.message
    ) {
      message = body.message
    } else if (
      typeof body === 'string' &&
      body.trim()
    ) {
      message = body
    }

    throw new ApiError(
      message,
      response.status,
      body,
    )
  }

  return body
}
/* =========================================================
   AUTH
========================================================= */

export function login(
  username,
  password,
) {
  return apiRequest(
    '/auth/login',
    {
      method: 'POST',

      body: JSON.stringify({
        username,
        password,
      }),
    },
  )
}

export const dashboardApi = {
  overview() {
    return apiRequest('/dashboard')
  },
}

export const statisticsApi = {
  summary({ period, year, month, date }) {
    const params = new URLSearchParams({ period })
    if (year != null) params.set('year', String(year))
    if (month != null) params.set('month', String(month))
    if (date) params.set('date', date)
    return apiRequest(`/statistics?${params.toString()}`)
  },
}


/* =========================================================
   SCHEDULING API
========================================================= */
export const schedulingApi = {
  /* =======================================================
     EMPLOYEES
  ======================================================= */

  employees(role) {
    return apiRequest(
      `/employees?role=${encodeURIComponent(
        role,
      )}`,
    )
  },


  /* =======================================================
     MY AVAILABILITY
  ======================================================= */

  mineAvailability(week) {
    return apiRequest(
      `/availabilities/me?weekStart=${encodeURIComponent(
        week,
      )}`,
    )
  },


  /* =======================================================
     AVAILABILITY BY ROLE

     TC:
       TEACHER

     CM:
       SALE
       CS
  ======================================================= */

  availability(
    role,
    week,
  ) {
    return apiRequest(
      `/availabilities?role=${encodeURIComponent(
        role,
      )}&weekStart=${encodeURIComponent(
        week,
      )}`,
    )
  },


  /* =======================================================
     CREATE AVAILABILITY
  ======================================================= */

  createAvailability(body) {
    return apiRequest(
      '/availabilities',
      {
        method: 'POST',

        body: JSON.stringify(body),
      },
    )
  },


  /* =======================================================
     UPDATE AVAILABILITY
  ======================================================= */

  updateAvailability(
    id,
    body,
  ) {
    return apiRequest(
      `/availabilities/${encodeURIComponent(
        id,
      )}`,
      {
        method: 'PUT',

        body: JSON.stringify(body),
      },
    )
  },


  /* =======================================================
     DELETE AVAILABILITY
  ======================================================= */

  removeAvailability(id) {
    return apiRequest(
      `/availabilities/${encodeURIComponent(
        id,
      )}`,
      {
        method: 'DELETE',
      },
    )
  },


  /* =======================================================
     REVIEW AVAILABILITY

     TC / CM duyệt lịch rảnh
  ======================================================= */

  reviewAvailability(
    id,
    status,
  ) {
    return apiRequest(
      `/availabilities/${encodeURIComponent(
        id,
      )}/review`,
      {
        method: 'PATCH',

        body: JSON.stringify({
          status,
        }),
      },
    )
  },


  /* =======================================================
     TEACHING SCHEDULE

     TC xem lịch giáo viên
  ======================================================= */

  teaching(week) {
    return apiRequest(
      `/teaching-schedules?weekStart=${encodeURIComponent(
        week,
      )}`,
    )
  },


  /* =======================================================
     STAFF SCHEDULE

     CM xem lịch Sale / CS
  ======================================================= */

  staff(
    role,
    week,
  ) {
    return apiRequest(
      `/staff-schedules?role=${encodeURIComponent(
        role,
      )}&weekStart=${encodeURIComponent(
        week,
      )}`,
    )
  },


  /* =======================================================
     MY SCHEDULE

     Teacher:
       lịch dạy

     Sale:
       lịch làm việc

     CS:
       lịch làm việc
  ======================================================= */

  ownSchedule(week) {
    return apiRequest(
      `/schedules/me?weekStart=${encodeURIComponent(
        week,
      )}`,
    )
  },


  /* =======================================================
     TC ASSIGN TEACHER
  ======================================================= */

  assignTeacherBatch(body) {
    return apiRequest('/teaching-schedules/batch', { method: 'POST', body: JSON.stringify(body) })
  },
  assignSupportBatch(body) {
    return apiRequest('/staff-schedules/batch', { method: 'POST', body: JSON.stringify(body) })
  },
  updateTeacher(id, body) {
    return apiRequest(`/teaching-schedules/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(body) })
  },
  updateStaff(id, body) {
    return apiRequest(`/staff-schedules/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(body) })
  },

  assignTeacher(body) {
    return apiRequest(
      '/teaching-schedules',
      {
        method: 'POST',

        body: JSON.stringify(body),
      },
    )
  },


  /* =======================================================
     CM ASSIGN SALE / CS
  ======================================================= */

  assignStaff(body) {
    return apiRequest(
      '/staff-schedules',
      {
        method: 'POST',

        body: JSON.stringify(body),
      },
    )
  },


  /* =======================================================
     CANCEL TEACHER SCHEDULE
  ======================================================= */

  cancelTeacher(id) {
    return apiRequest(
      `/teaching-schedules/${encodeURIComponent(
        id,
      )}`,
      {
        method: 'DELETE',
      },
    )
  },


  /* =======================================================
     CANCEL SALE / CS SCHEDULE
  ======================================================= */

  cancelStaff(id) {
    return apiRequest(
      `/staff-schedules/${encodeURIComponent(
        id,
      )}`,
      {
        method: 'DELETE',
      },
    )
  },
}
