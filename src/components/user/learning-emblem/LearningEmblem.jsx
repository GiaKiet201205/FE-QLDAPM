import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import './learning-emblem.css';

function UnavailableCanvas({ onError }) {
  useEffect(() => { onError(); }, [onError]);
  return null;
}
const EmblemCanvas = lazy(() => import('./EmblemCanvas').catch(() => ({ default: UnavailableCanvas })));
const Poster = () => <img className="gk-emblem-poster" src="/models/gk-learning-emblem.svg" alt="Biểu tượng sách mở và mũ tốt nghiệp mang màu xanh ngọc của GK Academy" width="600" height="400" />;

export default function LearningEmblem() {
  const region = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [active, setActive] = useState(false);
  const [rotating, setRotating] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setRotating(!preference.matches);
    update();
    preference.addEventListener('change', update);
    const observer = new IntersectionObserver(([entry]) => {
      setActive(entry.isIntersecting);
      if (entry.isIntersecting) setLoaded(true);
    }, { rootMargin: '100px' });
    observer.observe(region.current);
    return () => { observer.disconnect(); preference.removeEventListener('change', update); };
  }, []);

  return <section id="gk-signature" className="gk-emblem-section" aria-labelledby="gk-emblem-heading" ref={region}>
    <div className="gk-emblem-inner"><div className="gk-emblem-copy"><p className="gk-eyebrow">Dấu ấn GK Academy</p><h2 id="gk-emblem-heading">Mở trang kiến thức.<br /><span>Chạm tới tương lai.</span></h2><p>Mỗi trang sách mở ra một cơ hội. Cùng GK xây nền tảng vững vàng cho mục tiêu tiếp theo của bạn.</p><Link className="gk-button gk-emblem-cta" to="/contact">Đăng ký tư vấn</Link></div>
    <div className="gk-emblem-interactive"><div className="gk-emblem-stage">
      {(!ready || failed) && <Poster />}
      {loaded && !failed && <Suspense fallback={null}><EmblemCanvas active={active} rotating={rotating} onReady={() => setReady(true)} onError={() => setFailed(true)} /></Suspense>}
    </div><p className="sr-only" id="gk-emblem-instructions">Biểu tượng GK Academy. Kéo để khám phá góc nhìn, hoặc chọn mô hình và dùng các phím mũi tên.</p></div></div>
  </section>;
}
