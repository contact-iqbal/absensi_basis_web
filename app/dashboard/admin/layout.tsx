"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    document.cookie = "user_role=; path=/; max-age=0";
    document.cookie = "user_id=; path=/; max-age=0";
    router.push("/login");
  };

  const menuItems = [
    {
      name: "Verifikasi Absensi",
      path: "/dashboard/admin",
      icon: "fas fa-check-circle",
    },
    {
      name: "Manajemen Jadwal",
      path: "/dashboard/admin/jadwal",
      icon: "fas fa-calendar-alt",
    },
    {
      name: "Manajemen Siswa",
      path: "/dashboard/admin/siswa",
      icon: "fas fa-users",
    },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-0"
        } bg-neutral-800 text-white transition-all duration-300 overflow-hidden flex flex-col`}
      >
        <div className="p-4 border-b border-gray-700">
          <h1 className="text-xl font-bold">Sistem Absensi</h1>
        </div>
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.path}>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    router.push(item.path);
                  }}
                  className={`flex items-center space-x-3 p-3 rounded-lg transition ${
                    pathname === item.path
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "hover:bg-gray-700"
                  }`}
                >
                  <i className={`${item.icon} w-5`}></i>
                  <span>{item.name}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition"
            >
              <i className="fas fa-bars text-gray-600"></i>
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition flex items-center space-x-2"
            >
              <i className="fas fa-sign-out-alt"></i>
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Dashboard Admin</h1>
          </div>
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 px-6 py-4">
          <p className="text-sm text-gray-600">
            <strong>Copyright &copy; 2024 Sistem Absensi.</strong> All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}
