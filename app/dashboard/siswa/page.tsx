"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Jadwal {
  id: number;
  jam_mulai: string;
  jam_selesai: string;
  nama_mapel: string;
  nama_guru: string;
  sudah_absen: boolean;
  status_kehadiran?: string;
  status_verifikasi?: string;
}

interface History {
  id: number;
  tanggal: string;
  waktu_absen: string;
  status_kehadiran: string;
  status_verifikasi: string;
  keterangan: string;
  nama_mapel: string;
  jam_mulai: string;
  jam_selesai: string;
  verified_by_name?: string;
}

export default function SiswaDashboard() {
  const router = useRouter();
  const [jadwalToday, setJadwalToday] = useState<Jadwal[]>([]);
  const [history, setHistory] = useState<History[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJadwal, setSelectedJadwal] = useState<number | null>(null);
  const [statusKehadiran, setStatusKehadiran] = useState("hadir");
  const [keterangan, setKeterangan] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [hari, setHari] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [jadwalRes, historyRes] = await Promise.all([
        fetch("/api/jadwal/today"),
        fetch("/api/absensi/history"),
      ]);

      if (!jadwalRes.ok || !historyRes.ok) {
        router.push("/login");
        return;
      }

      const jadwalData = await jadwalRes.json();
      const historyData = await historyRes.json();

      setJadwalToday(jadwalData.data);
      setHari(jadwalData.hari);
      setHistory(historyData.data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAbsensi = async () => {
    if (!selectedJadwal) return;

    try {
      const response = await fetch("/api/absensi/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jadwal_id: selectedJadwal,
          status_kehadiran: statusKehadiran,
          keterangan: keterangan,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message);
        setShowModal(false);
        setKeterangan("");
        fetchData();
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert("Terjadi kesalahan");
    }
  };

  const handleLogout = () => {
    document.cookie = "user_role=; path=/; max-age=0";
    document.cookie = "user_id=; path=/; max-age=0";
    router.push("/login");
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "approved":
        return "bg-green-100 text-green-800 border-green-300";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getKehadiranBadgeColor = (status: string) => {
    switch (status) {
      case "hadir":
        return "bg-green-100 text-green-800 border-green-300";
      case "sakit":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "izin":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "alpha":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

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
            <li>
              <a
                href="#"
                className="flex items-center space-x-3 p-3 rounded-lg bg-blue-600 hover:bg-blue-700 transition"
              >
                <i className="fas fa-tachometer-alt w-5"></i>
                <span>Dashboard</span>
              </a>
            </li>
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
            <h1 className="text-3xl font-bold text-gray-800">Dashboard Siswa</h1>
          </div>

          {/* Jadwal Hari Ini */}
          <div className="bg-white rounded-lg shadow-md mb-6 border-t-4 border-blue-500">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                <i className="fas fa-calendar-day text-blue-500 mr-2"></i>
                Jadwal Hari Ini - {hari}
              </h2>
            </div>
            <div className="p-6">
              {jadwalToday.length === 0 ? (
                <div className="bg-blue-50 border border-blue-200 text-blue-700 p-4 rounded-lg">
                  <i className="fas fa-info-circle mr-2"></i>
                  Tidak ada jadwal untuk hari ini
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {jadwalToday.map((jadwal) => (
                    <div key={jadwal.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">{jadwal.nama_mapel}</h3>
                      <p className="text-gray-600 mb-1">
                        <strong>Guru:</strong> {jadwal.nama_guru}
                      </p>
                      <p className="text-gray-600 mb-3">
                        <strong>Waktu:</strong> {jadwal.jam_mulai} - {jadwal.jam_selesai}
                      </p>
                      {jadwal.sudah_absen && (
                        <div className="mb-3 flex gap-2">
                          <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusBadgeColor(jadwal.status_verifikasi || "")}`}>
                            {jadwal.status_verifikasi === "pending" && "Menunggu Verifikasi"}
                            {jadwal.status_verifikasi === "approved" && "Disetujui"}
                            {jadwal.status_verifikasi === "rejected" && "Ditolak"}
                          </span>
                          <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getKehadiranBadgeColor(jadwal.status_kehadiran || "")}`}>
                            {jadwal.status_kehadiran}
                          </span>
                        </div>
                      )}
                      {jadwal.sudah_absen ? (
                        <button className="px-4 py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed" disabled>
                          Sudah Absen
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedJadwal(jadwal.id);
                            setShowModal(true);
                          }}
                          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition flex items-center space-x-2"
                        >
                          <i className="fas fa-check"></i>
                          <span>Absen</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Riwayat Absensi */}
          <div className="bg-white rounded-lg shadow-md border-t-4 border-green-500">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                <i className="fas fa-history text-green-500 mr-2"></i>
                Riwayat Absensi
              </h2>
            </div>
            <div className="p-6">
              {history.length === 0 ? (
                <div className="bg-blue-50 border border-blue-200 text-blue-700 p-4 rounded-lg">
                  <i className="fas fa-info-circle mr-2"></i>
                  Belum ada riwayat absensi
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Tanggal
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Mata Pelajaran
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Waktu
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Verifikasi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {history.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(item.tanggal).toLocaleDateString("id-ID")}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.nama_mapel}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {item.jam_mulai} - {item.jam_selesai}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getKehadiranBadgeColor(item.status_kehadiran)}`}>
                              {item.status_kehadiran}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusBadgeColor(item.status_verifikasi)}`}>
                              {item.status_verifikasi === "pending" && "Pending"}
                              {item.status_verifikasi === "approved" && "Disetujui"}
                              {item.status_verifikasi === "rejected" && "Ditolak"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 px-6 py-4">
          <p className="text-sm text-gray-600">
            <strong>Copyright &copy; 2024 Sistem Absensi.</strong> All rights reserved.
          </p>
        </footer>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800">Form Absensi</h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setKeterangan("");
                }}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Status Kehadiran
                </label>
                <select
                  value={statusKehadiran}
                  onChange={(e) => setStatusKehadiran(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value="hadir">Hadir</option>
                  <option value="sakit">Sakit</option>
                  <option value="izin">Izin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Keterangan
                </label>
                <textarea
                  value={keterangan}
                  onChange={(e) => setKeterangan(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  rows={3}
                  placeholder="Keterangan tambahan (opsional)"
                />
              </div>
            </div>
            <div className="flex items-center justify-between p-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowModal(false);
                  setKeterangan("");
                }}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Batal
              </button>
              <button
                onClick={handleAbsensi}
                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition"
              >
                Kirim
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
