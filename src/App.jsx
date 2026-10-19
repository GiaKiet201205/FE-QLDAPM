import { useMemo } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import Classes from "./pages/Classes";
import AccountManagement from "./pages/AccountManagement";
import LoginPage from "./pages/LoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ProfilePage from "./pages/ProfilePage";
import PlaceholderPage from "./pages/PlaceholderPage";
import PayrollPage from "./pages/PayrollPage";
import StatisticsPage from "./pages/StatisticsPage";

import {
  AvailabilityScreen,
  AssignmentScreen,
  MyScheduleScreen,
} from "./features/scheduling/SchedulingApiScreens";
import { AcademicDataProvider } from "./features/academic/AcademicDataContext";
import AccountDataProvider from "./features/accounts/AccountDataProvider";
import { useAccountData } from "./features/accounts/hooks/useAccountData";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { ROLES } from "./config/roles";

function resolveElement(item, roleKey) {
  switch (item.meta?.page) {
    case "payroll":
      return (
        <PayrollPage
          permission={item.meta.permission}
          scope={item.meta.scope}
          roleKey={roleKey}
          title={item.label}
        />
      );
    case "statistics":
      return <StatisticsPage />;
    case "teacher-assignment":
      return <AssignmentScreen role="TEACHER" />;
    case "staff-assignment":
      return (
        <AssignmentScreen
          key={item.meta.staffRole}
          role={item.meta.staffRole}
        />
      );
    case "my-schedule":
      return (
        <MyScheduleScreen
          key={item.meta.roleKey}
          role={item.meta.roleKey}
        />
      );
    default:
      return <PlaceholderPage title={item.label} />;
  }
}

function AppRoutes() {
  const { authUser } = useAccountData();
  const roleKey = authUser?.roleKey;
  const role = roleKey ? ROLES[roleKey] : null;
  const home = roleKey && role ? `/${roleKey.toLowerCase()}` : "/login";

  const allItems = useMemo(() => {
    if (!role) return [];
    const seen = new Set();
    return role.sections.flatMap((section) =>
      section.items.filter((item) => {
        if (seen.has(item.path)) return false;
        seen.add(item.path);
        return true;
      }),
    );
  }, [role]);

  return (
    <>
      <ToastContainer position="top-right" autoClose={2000} />
      <Routes>
        <Route
          path="/login"
          element={authUser ? <Navigate to={home} replace /> : <LoginPage />}
        />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/" element={<Navigate to={home} replace />} />

        {role && (
          <Route
            path={home}
            element={
              <ProtectedRoute allowedRoles={[roleKey]}>
                <AcademicDataProvider>
                  <Layout role={role} />
                </AcademicDataProvider>
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard role={role} />} />
            <Route path="profile" element={<ProfilePage />} />

            {allItems
              .filter((item) => item.path !== "/")
              .map((item) => {
                let element;
                if (item.path === "/students") {
                  element = <Students role={role} />;
                } else if (
                  item.path.startsWith("/classes") ||
                  item.path === "/my-classes"
                ) {
                  element = <Classes role={role} />;
                } else if (item.path === "/availability/register") {
                  element = <AvailabilityScreen />;
                } else if (item.path === "/accounts") {
                  element = (
                    <ProtectedRoute allowedRoles={["ADMIN"]}>
                      <AccountManagement />
                    </ProtectedRoute>
                  );
                } else {
                  element = resolveElement(item, roleKey);
                }

                return (
                  <Route
                    key={item.path}
                    path={item.path.slice(1)}
                    element={element}
                  />
                );
              })}

            <Route path="*" element={<Navigate to={home} replace />} />
          </Route>
        )}

        <Route path="*" element={<Navigate to={home} replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AccountDataProvider>
        <AppRoutes />
      </AccountDataProvider>
    </BrowserRouter>
  );
}
