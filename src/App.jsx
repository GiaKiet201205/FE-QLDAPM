import { lazy, Suspense } from 'react';

const Application = import.meta.env.VITE_APP_TARGET === 'admin'
  ? lazy(() => import('./ManagementApp'))
  : lazy(() => import('./StorefrontApp'));

export default function App() {
  return <Suspense fallback={<p role="status" className="p-8 text-center">Đang tải...</p>}>
    <Application />
  </Suspense>;
}
