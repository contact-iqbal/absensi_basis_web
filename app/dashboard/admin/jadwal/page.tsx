"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Jadwal {
  id: number;
  kelas_id: number;
  mata_pelajaran_id: number;
  guru_id: number;
  hari: string;
  jam_mulai: string;
  jam_selesai: string;
  nama_kelas: string;
  nama_mapel: string;
  nama_guru: string;
}

interface Kelas {
  id: number;
  nama_kelas: string;
  tingkat: number;
}

interface Mapel {
  id: number;
  nama_mapel: string;
  kode_mapel: string;
}

interface Guru {
  id: number;
  nip: string;
  nama_lengkap: string;
  mata_pelajaran: string;
}

export default function ManajemenJadwalPage() {
  const router = useRouter();
  const [jadwalList, setJadwalList] = useState<Jadwal[]>([]);
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [mapelList, setMapelList] = useState<Mapel[]>([]);
  const [guruList, setGuruList] = useState<Guru[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedJadwal, setSelectedJadwal] = useState<Jadwal | null>(null);
  const [userRole, setUserRole] = useState<string>("");

  const [formData, setFormData] = useState({
    id: 0,
    kelas_id: "",
    mata_pelajaran_id: "",
    guru_id: "",
    hari: "Senin",
    jam_mulai: "",
    jam_selesai: "",
  });

  const hariOptions = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

  useEffect(() => {
    const role = document.cookie
      .split("; ")
      .find((row) => row.startsWith("user_role="))
      ?.split("=")[1];
    setUserRole(role || "");
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [jadwalRes, kelasRes, mapelRes, guruRes] = await Promise.all([
        fetch("/api/jadwal/list"),
        fetch("/api/master/kelas"),
        fetch("/api/master/mapel"),
        fetch("/api/master/guru"),
      ]);

      if (!jadwalRes.ok) {
        router.push("/login");
        return;
      }

      const [jadwalData, kelasData, mapelData, guruData] = await Promise.all([
        jadwalRes.json(),
        kelasRes.json(),
        mapelRes.json(),
        guruRes.json(),
      ]);

      setJadwalList(jadwalData.data);
      setKelasList(kelasData.data);
      setMapelList(mapelData.data);
      setGuruList(guruData.data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (jadwal?: Jadwal) => {
    if (jadwal) {
      setEditMode(true);
      setSelectedJadwal(jadwal);
      setFormData({
        id: jadwal.id,
        kelas_id: jadwal.kelas_id.toString(),
        mata_pelajaran_id: jadwal.mata_pelajaran_id.toString(),
        guru_id: jadwal.guru_id.toString(),
        hari: jadwal.hari,
        jam_mulai: jadwal.jam_mulai,
        jam_selesai: jadwal.jam_selesai,
      });
    } else {
      setEditMode(false);
      setSelectedJadwal(null);
      setFormData({
        id: 0,
        kelas_id: "",
        mata_pelajaran_id: "",
        guru_id: "",
        hari: "Senin",
        jam_mulai: "",
        jam_selesai: "",
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditMode(false);
    setSelectedJadwal(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editMode ? "/api/jadwal/update" : "/api/jadwal/create";
      const method = editMode ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message);
        handleCloseModal();
        fetchData();
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert("Terjadi kesalahan");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus jadwal ini?")) {
      return;
    }

    try {
      const response = await fetch(`/api/jadwal/delete?id=${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message);
        fetchData();
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert("Terjadi kesalahan");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-white rounded-2xl shadow-xl p-6 border-t-4 border-blue-400">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold bg-neutral-800 bg-clip-text text-transparent">
            Manajemen Jadwal
          </h2>
          {userRole === "admin" && (
            <button
              onClick={() => handleOpenModal()}
              className="px-6 py-3 bg-blue-500 text-white rounded-xl transition-all shadow-lg hover:shadow-xl font-medium"
            >
              + Tambah Jadwal
            </button>
          )}
        </div>

        {jadwalList.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            Belum ada jadwal
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-blue-100">
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 rounded-tl-xl">
                    Hari
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
                    Jam
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
                    Mata Pelajaran
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
                    Guru
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
                    Kelas
                  </th>
                  {userRole === "admin" && (
                    <th className="px-6 py-4 text-center text-sm font-bold text-gray-700 rounded-tr-xl">
                      Aksi
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {jadwalList.map((jadwal, index) => (
                  <tr
                    key={jadwal.id}
                    className={index % 2 === 0 ? "bg-white" : "bg-blue-50/30"}
                  >
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                      {jadwal.hari}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {jadwal.jam_mulai} - {jadwal.jam_selesai}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                      {jadwal.nama_mapel}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {jadwal.nama_guru}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {jadwal.nama_kelas}
                    </td>
                    {userRole === "admin" && (
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleOpenModal(jadwal)}
                          className="px-4 py-2 bg-neutral-600 hover:bg-neutral-700 text-white rounded-lg transition-all shadow-md mr-2 text-sm font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(jadwal.id)}
                          className="px-4 py-2 bg-red-600 hover:bg-red-70 text-white rounded-lg transition-all shadow-md text-sm font-medium"
                        >
                          Hapus
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full shadow-2xl border-t-4 border-blue-400">
            <h3 className="text-2xl font-bold bg-neutral-800 bg-clip-text text-transparent mb-6">
              {editMode ? "Edit Jadwal" : "Tambah Jadwal"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Kelas
                  </label>
                  <select
                    value={formData.kelas_id}
                    onChange={(e) =>
                      setFormData({ ...formData, kelas_id: e.target.value })
                    }
                    className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all"
                    required
                  >
                    <option value="">Pilih Kelas</option>
                    {kelasList.map((kelas) => (
                      <option key={kelas.id} value={kelas.id}>
                        {kelas.nama_kelas}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Mata Pelajaran
                  </label>
                  <select
                    value={formData.mata_pelajaran_id}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        mata_pelajaran_id: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all"
                    required
                  >
                    <option value="">Pilih Mata Pelajaran</option>
                    {mapelList.map((mapel) => (
                      <option key={mapel.id} value={mapel.id}>
                        {mapel.nama_mapel}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Guru
                </label>
                <select
                  value={formData.guru_id}
                  onChange={(e) =>
                    setFormData({ ...formData, guru_id: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all"
                  required
                >
                  <option value="">Pilih Guru</option>
                  {guruList.map((guru) => (
                    <option key={guru.id} value={guru.id}>
                      {guru.nama_lengkap}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Hari
                  </label>
                  <select
                    value={formData.hari}
                    onChange={(e) =>
                      setFormData({ ...formData, hari: e.target.value })
                    }
                    className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all"
                    required
                  >
                    {hariOptions.map((hari) => (
                      <option key={hari} value={hari}>
                        {hari}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Jam Mulai
                  </label>
                  <input
                    type="time"
                    value={formData.jam_mulai}
                    onChange={(e) =>
                      setFormData({ ...formData, jam_mulai: e.target.value })
                    }
                    className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Jam Selesai
                  </label>
                  <input
                    type="time"
                    value={formData.jam_selesai}
                    onChange={(e) =>
                      setFormData({ ...formData, jam_selesai: e.target.value })
                    }
                    className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-blue-600 hover:from-blue-600 hover:to-cyan-600 rounded-xl transition-all shadow-lg font-medium text-white"
                >
                  {editMode ? "Update" : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
