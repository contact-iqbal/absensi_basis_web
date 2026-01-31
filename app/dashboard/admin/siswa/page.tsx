"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Siswa {
  id: number;
  user_id: number;
  nis: string;
  kelas_id: number;
  jenis_kelamin: string;
  alamat: string;
  no_telp: string;
  username: string;
  nama_lengkap: string;
  nama_kelas: string;
}

interface Kelas {
  id: number;
  nama_kelas: string;
  tingkat: number;
}

export default function ManajemenSiswaPage() {
  const router = useRouter();
  const [siswaList, setSiswaList] = useState<Siswa[]>([]);
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedSiswa, setSelectedSiswa] = useState<Siswa | null>(null);
  const [userRole, setUserRole] = useState<string>("");

  const [formData, setFormData] = useState({
    id: 0,
    user_id: 0,
    username: "",
    password: "",
    nama_lengkap: "",
    nis: "",
    kelas_id: "",
    jenis_kelamin: "L",
    alamat: "",
    no_telp: "",
  });

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
      const [siswaRes, kelasRes] = await Promise.all([
        fetch("/api/siswa/list"),
        fetch("/api/master/kelas"),
      ]);

      if (!siswaRes.ok) {
        router.push("/login");
        return;
      }

      const [siswaData, kelasData] = await Promise.all([
        siswaRes.json(),
        kelasRes.json(),
      ]);

      setSiswaList(siswaData.data);
      setKelasList(kelasData.data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (siswa?: Siswa) => {
    if (siswa) {
      setEditMode(true);
      setSelectedSiswa(siswa);
      setFormData({
        id: siswa.id,
        user_id: siswa.user_id,
        username: siswa.username,
        password: "",
        nama_lengkap: siswa.nama_lengkap,
        nis: siswa.nis,
        kelas_id: siswa.kelas_id.toString(),
        jenis_kelamin: siswa.jenis_kelamin,
        alamat: siswa.alamat || "",
        no_telp: siswa.no_telp || "",
      });
    } else {
      setEditMode(false);
      setSelectedSiswa(null);
      setFormData({
        id: 0,
        user_id: 0,
        username: "",
        password: "",
        nama_lengkap: "",
        nis: "",
        kelas_id: "",
        jenis_kelamin: "L",
        alamat: "",
        no_telp: "",
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditMode(false);
    setSelectedSiswa(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editMode ? "/api/siswa/update" : "/api/siswa/create";
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
    if (!confirm("Apakah Anda yakin ingin menghapus siswa ini?")) {
      return;
    }

    try {
      const response = await fetch(`/api/siswa/delete?id=${id}`, {
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
          <h2 className="text-2xl font-bold bg-neutral-700 bg-clip-text text-transparent">
            Manajemen Siswa
          </h2>
          {userRole === "admin" && (
            <button
              onClick={() => handleOpenModal()}
              className="px-6 py-3 bg-blue-500 text-white rounded-xl transition-all shadow-lg hover:shadow-xl font-medium"
            >
              + Tambah Siswa
            </button>
          )}
        </div>

        {siswaList.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            Belum ada data siswa
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gradient-to-r from-neutral-100 to-gray-100">
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 rounded-tl-xl">
                    NIS
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
                    Nama Lengkap
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
                    Kelas
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
                    Username
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
                    Jenis Kelamin
                  </th>
                  {userRole === "admin" && (
                    <th className="px-6 py-4 text-center text-sm font-bold text-gray-700 rounded-tr-xl">
                      Aksi
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {siswaList.map((siswa, index) => (
                  <tr
                    key={siswa.id}
                    className={index % 2 === 0 ? "bg-white" : "bg-neutral-50/30"}
                  >
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                      {siswa.nis}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                      {siswa.nama_lengkap}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {siswa.nama_kelas}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {siswa.username}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {siswa.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan"}
                    </td>
                    {userRole === "admin" && (
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleOpenModal(siswa)}
                          className="px-4 py-2 bg-gradient-to-r from-neutral-600 to-neutral-700 hover:from-neutral-700 hover:to-neutral-800 text-white rounded-lg transition-all shadow-md mr-2 text-sm font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(siswa.id)}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all shadow-md text-sm font-medium"
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl p-8 max-w-3xl w-full shadow-2xl border-t-4 border-neutral-400 my-8">
            <h3 className="text-2xl font-bold bg-neutral-700 bg-clip-text text-transparent mb-6">
              {editMode ? "Edit Siswa" : "Tambah Siswa"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Username <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-neutral-400 focus:border-neutral-400 transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Password{" "}
                    {editMode ? (
                      <span className="text-gray-500 text-xs">
                        (kosongkan jika tidak ingin mengubah)
                      </span>
                    ) : (
                      <span className="text-red-500">*</span>
                    )}
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:ring-2 focus:ring-neutral-400 focus:border-neutral-400 transition-all"
                    required={!editMode}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.nama_lengkap}
                  onChange={(e) =>
                    setFormData({ ...formData, nama_lengkap: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:ring-2 focus:ring-neutral-400 focus:border-neutral-400 transition-all"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    NIS <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.nis}
                    onChange={(e) =>
                      setFormData({ ...formData, nis: e.target.value })
                    }
                    className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:ring-2 focus:ring-neutral-400 focus:border-neutral-400 transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Kelas <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.kelas_id}
                    onChange={(e) =>
                      setFormData({ ...formData, kelas_id: e.target.value })
                    }
                    className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:ring-2 focus:ring-neutral-400 focus:border-neutral-400 transition-all"
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
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Jenis Kelamin <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-6">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="L"
                      checked={formData.jenis_kelamin === "L"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          jenis_kelamin: e.target.value,
                        })
                      }
                      className="w-5 h-5 text-neutral-500 focus:ring-neutral-400"
                    />
                    <span className="ml-2 text-gray-700">Laki-laki</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="P"
                      checked={formData.jenis_kelamin === "P"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          jenis_kelamin: e.target.value,
                        })
                      }
                      className="w-5 h-5 text-neutral-500 focus:ring-neutral-400"
                    />
                    <span className="ml-2 text-gray-700">Perempuan</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Alamat
                </label>
                <textarea
                  value={formData.alamat}
                  onChange={(e) =>
                    setFormData({ ...formData, alamat: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:ring-2 focus:ring-neutral-400 focus:border-neutral-400 transition-all"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  No. Telepon
                </label>
                <input
                  type="text"
                  value={formData.no_telp}
                  onChange={(e) =>
                    setFormData({ ...formData, no_telp: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:ring-2 focus:ring-neutral-400 focus:border-neutral-400 transition-all"
                />
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
                  className="flex-1 px-6 py-3 bg-neutral-500 hover:bg-neutral-600 text-white rounded-xl transition-all shadow-lg font-medium"
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
