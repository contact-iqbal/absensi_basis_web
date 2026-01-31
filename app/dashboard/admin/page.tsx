"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Absensi {
  id: number;
  tanggal: string;
  waktu_absen: string;
  status_kehadiran: string;
  status_verifikasi: string;
  keterangan: string;
  nama_siswa: string;
  nis: string;
  nama_kelas: string;
  nama_mapel: string;
  jam_mulai: string;
  jam_selesai: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [absensiList, setAbsensiList] = useState<Absensi[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"pending" | "approved" | "rejected">(
    "pending",
  );
  const [selectedAbsensi, setSelectedAbsensi] = useState<Absensi | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchAbsensiList();
  }, [filter]);

  const fetchAbsensiList = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/absensi/list?status=${filter}`);

      if (!response.ok) {
        router.push("/login");
        return;
      }

      const data = await response.json();
      setAbsensiList(data.data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (absensiId: number, status: string) => {
    try {
      const response = await fetch("/api/absensi/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          absensi_id: absensiId,
          status_verifikasi: status,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message);
        setShowModal(false);
        fetchAbsensiList();
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert("Terjadi kesalahan");
    }
  };

  const getStatusBadgeColor = (status: string) => {
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
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-md border-t-4 border-blue-500">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            <i className="fas fa-check-circle text-blue-500 mr-2"></i>
            Verifikasi Absensi
          </h2>
        </div>
        <div className="p-6">
          <div className="flex gap-3 mb-6">
            <button
              onClick={() => setFilter("pending")}
              className={`px-6 py-2 rounded-lg font-medium transition ${
                filter === "pending"
                  ? "bg-blue-500 text-white shadow-md"
                  : "bg-white text-blue-500 border-2 border-blue-500 hover:bg-blue-50"
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilter("approved")}
              className={`px-6 py-2 rounded-lg font-medium transition ${
                filter === "approved"
                  ? "bg-green-500 text-white shadow-md"
                  : "bg-white text-green-500 border-2 border-green-500 hover:bg-green-50"
              }`}
            >
              Disetujui
            </button>
            <button
              onClick={() => setFilter("rejected")}
              className={`px-6 py-2 rounded-lg font-medium transition ${
                filter === "rejected"
                  ? "bg-red-500 text-white shadow-md"
                  : "bg-white text-red-500 border-2 border-red-500 hover:bg-red-50"
              }`}
            >
              Ditolak
            </button>
          </div>

          {absensiList.length === 0 ? (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 p-4 rounded-lg">
              <i className="fas fa-info-circle mr-2"></i>
              Tidak ada data absensi dengan status {filter}
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
                      Siswa
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Kelas
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Mata Pelajaran
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {absensiList.map((absensi) => (
                    <tr key={absensi.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="text-gray-900 font-medium">
                          {new Date(absensi.tanggal).toLocaleDateString("id-ID")}
                        </div>
                        <div className="text-gray-500 text-xs">
                          {new Date(absensi.waktu_absen).toLocaleTimeString("id-ID")}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="text-gray-900 font-medium">{absensi.nama_siswa}</div>
                        <div className="text-gray-500 text-xs">NIS: {absensi.nis}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {absensi.nama_kelas}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="text-gray-900 font-medium">{absensi.nama_mapel}</div>
                        <div className="text-gray-500 text-xs">
                          {absensi.jam_mulai} - {absensi.jam_selesai}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusBadgeColor(absensi.status_kehadiran)}`}>
                          {absensi.status_kehadiran}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                        <button
                          onClick={() => {
                            setSelectedAbsensi(absensi);
                            setShowModal(true);
                          }}
                          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition flex items-center space-x-2 mx-auto"
                        >
                          <i className="fas fa-eye"></i>
                          <span>Detail</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showModal && selectedAbsensi && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-2xl font-semibold text-gray-800">Detail Absensi</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm font-semibold text-gray-600 mb-1">Nama Siswa</dt>
                      <dd className="text-base text-gray-900">{selectedAbsensi.nama_siswa}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-semibold text-gray-600 mb-1">NIS</dt>
                      <dd className="text-base text-gray-900">{selectedAbsensi.nis}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-semibold text-gray-600 mb-1">Kelas</dt>
                      <dd className="text-base text-gray-900">{selectedAbsensi.nama_kelas}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-semibold text-gray-600 mb-1">Mata Pelajaran</dt>
                      <dd className="text-base text-gray-900">{selectedAbsensi.nama_mapel}</dd>
                    </div>
                  </dl>
                </div>
                <div>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm font-semibold text-gray-600 mb-1">Tanggal</dt>
                      <dd className="text-base text-gray-900">
                        {new Date(selectedAbsensi.tanggal).toLocaleDateString("id-ID")}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-semibold text-gray-600 mb-1">Waktu Absen</dt>
                      <dd className="text-base text-gray-900">
                        {new Date(selectedAbsensi.waktu_absen).toLocaleTimeString("id-ID")}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-semibold text-gray-600 mb-1">Jam Pelajaran</dt>
                      <dd className="text-base text-gray-900">
                        {selectedAbsensi.jam_mulai} - {selectedAbsensi.jam_selesai}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-semibold text-gray-600 mb-1">Status Kehadiran</dt>
                      <dd>
                        <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusBadgeColor(selectedAbsensi.status_kehadiran)}`}>
                          {selectedAbsensi.status_kehadiran}
                        </span>
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
              {selectedAbsensi.keterangan && (
                <div className="mt-6">
                  <dt className="text-sm font-semibold text-gray-600 mb-1">Keterangan</dt>
                  <dd className="text-base text-gray-900 bg-gray-50 p-3 rounded-lg">
                    {selectedAbsensi.keterangan}
                  </dd>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between p-6 border-t border-gray-200">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Tutup
              </button>
              {selectedAbsensi.status_verifikasi === "pending" && (
                <div className="flex gap-3">
                  <button
                    onClick={() => handleVerify(selectedAbsensi.id, "rejected")}
                    className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition flex items-center space-x-2"
                  >
                    <i className="fas fa-times"></i>
                    <span>Tolak</span>
                  </button>
                  <button
                    onClick={() => handleVerify(selectedAbsensi.id, "approved")}
                    className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition flex items-center space-x-2"
                  >
                    <i className="fas fa-check"></i>
                    <span>Setujui</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
