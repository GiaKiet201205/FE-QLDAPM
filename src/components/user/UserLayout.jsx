import { useEffect } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { LogOut, ShoppingBag, UserRound } from 'lucide-react';
import { useAccountData } from '../../features/accounts/hooks/useAccountData';
import { useStore } from '../../features/storefront/useStore';
import Brand from './Brand';
import UserChatbox from './UserChatbox';
import StoreFooter from './StoreFooter';
import './storefront.css';

export default function UserLayout() {
  const { authUser, logout, loggingOut } = useAccountData();
  const { cart } = useStore();
  const navigate = useNavigate();
  const { pathname, hash } = useLocation();
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      if (hash) document.getElementById(hash.slice(1))?.scrollIntoView({ block: 'start' });
      else window.scrollTo(0, 0);
    });
    return () => cancelAnimationFrame(id);
  }, [pathname, hash]);
  async function signOut() {
    const result = await logout();
    if (!result.ok) toast.error(result.reason);
    else if (!result.sessionChanged) navigate('/');
  }
  return <div className={`gk-store font-review${pathname === '/' ? ' gk-store-home' : ''}`}>
    <a className="gk-skip" href="#gk-main">Đi đến nội dung chính</a>
    <header className="gk-header"><div className="gk-container gk-header-inner">
      <Link className="gk-header-brand" to="/" aria-label="GK Academy - Trang chủ"><Brand /></Link>
      <nav aria-label="Điều hướng chính"><NavLink to="/" end>Trang chủ</NavLink><NavLink to="/courses">Khóa học</NavLink><NavLink to="/schedule">Lịch khai giảng</NavLink><NavLink to="/about">Về chúng tôi</NavLink><NavLink to="/contact">Liên hệ</NavLink></nav>
      <div className="gk-header-actions">{authUser ? <><Link className="gk-button gk-account-link" title={authUser.username} to="/user/profile"><UserRound size={18} aria-hidden="true" /><span>{authUser.username}</span></Link><button className="gk-button gk-header-logout" onClick={signOut} disabled={loggingOut} aria-label="Đăng xuất" title="Đăng xuất"><LogOut size={18} aria-hidden="true" /></button></> : <Link className="gk-button gk-header-login" to="/user/login"><UserRound size={18} aria-hidden="true" />Đăng nhập</Link>}<Link className="gk-button gk-cart-link" to="/cart" aria-label={`Giỏ hàng, ${cart.length} khóa học`}><ShoppingBag size={18} aria-hidden="true" />Giỏ hàng <span className="gk-cart-count" aria-live="polite">{cart.length}</span></Link></div>
    </div></header>
    <main id="gk-main"><Outlet /></main>
    <StoreFooter />
    <UserChatbox key={authUser?.username || 'guest'} />
  </div>;
}
