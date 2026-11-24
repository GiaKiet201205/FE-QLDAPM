import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AccountDataProvider from './features/accounts/AccountDataProvider';
import StoreDataProvider from './features/storefront/StoreDataProvider';
import UserLayout from './components/user/UserLayout';
import UserRoute from './features/user/UserRoute';
import CourseCatalog from './pages/user/CourseCatalog';
import UserLandingPage from './pages/user/UserLandingPage';
import UserLoginPage from './pages/user/UserLoginPage';
import UserRegisterPage from './pages/user/UserRegisterPage';
import UserCheckout from './pages/user/UserCheckout';
import UserProfile from './pages/user/UserProfile';
import SocialCallback from './pages/user/SocialCallback';
import CourseDetail from './pages/user/CourseDetail';
import OpeningSchedule from './pages/user/OpeningSchedule';
import ShoppingCart from './pages/user/ShoppingCart';
import AboutPage from './pages/user/AboutPage';
import ContactPage from './pages/user/ContactPage';
import UserForgotPassword from './pages/user/UserForgotPassword';
import UserChatbox from './components/user/UserChatbox';

export default function StorefrontApp() {
  return <BrowserRouter>
    <AccountDataProvider><StoreDataProvider>
      <ToastContainer position="top-right" autoClose={2000} />
      <Routes>
        <Route path="/login" element={<Navigate to="/user/login" replace />} />
        <Route path="/user/social/callback" element={<SocialCallback />} />
        <Route path="/user/login" element={<UserLoginPage />} />
        <Route path="/user/register" element={<UserRegisterPage />} />
        <Route path="/user/forgot-password" element={<UserForgotPassword />} />
        <Route element={<UserLayout />}>
          <Route path="/" element={<UserLandingPage />} />
          <Route path="/courses" element={<CourseCatalog />} />
          <Route path="/courses/:courseId" element={<CourseDetail />} />
          <Route path="/schedule" element={<OpeningSchedule />} />
          <Route path="/cart" element={<ShoppingCart />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/checkout/:courseId" element={<UserRoute><UserCheckout /></UserRoute>} />
          <Route path="/user/profile" element={<UserRoute><UserProfile /></UserRoute>} />
          <Route path="/user" element={<Navigate to="/user/profile" replace />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <UserChatbox />
    </StoreDataProvider></AccountDataProvider>
  </BrowserRouter>;
}
