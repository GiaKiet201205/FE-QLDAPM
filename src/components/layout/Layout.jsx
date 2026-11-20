import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import ChatWidget from "../chat/ChatWidget";

function findPageMeta(role, pathname) {
  const prefix = `/${role.key.toLowerCase()}`;

  const pagePath = pathname.startsWith(`${prefix}/`)
    ? pathname.slice(prefix.length)
    : pathname === prefix
      ? "/"
      : pathname;

  if (pagePath === "/profile") {
    return { label: "Thông tin cá nhân" };
  }

  let match = null;

  for (const section of role.sections) {
    for (const item of section.items) {
      const isMatch =
        item.path === "/"
          ? pagePath === "/"
          : pagePath === item.path ||
            pagePath.startsWith(`${item.path}/`);

      if (
        isMatch &&
        (!match || item.path.length > match.path.length)
      ) {
        match = item;
      }
    }
  }

  return match || { label: "Tổng quan" };
}

export default function Layout({ role }) {
  const { pathname } = useLocation();
  const page = findPageMeta(role, pathname);

  return (
    <div className="gk-admin flex min-h-screen bg-[#f5f8f7]">
      <Sidebar role={role} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          role={role}
          pageTitle={page.label}
          pageSubtitle={
            page.label === "Tổng quan"
              ? new Intl.DateTimeFormat("vi-VN", {
                  dateStyle: "full",
                  timeZone: "Asia/Ho_Chi_Minh",
                }).format(new Date())
              : undefined
          }
        />

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
      <ChatWidget role={role} />
    </div>
  );
}
