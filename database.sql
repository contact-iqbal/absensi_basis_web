-- Database Schema untuk Sistem Absensi Siswa
-- Buat database terlebih dahulu: CREATE DATABASE absensi_siswa;

-- Tabel Users (untuk login guru dan siswa)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  nama_lengkap VARCHAR(100) NOT NULL,
  role ENUM('admin', 'guru', 'siswa') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Kelas
CREATE TABLE IF NOT EXISTS kelas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama_kelas VARCHAR(50) NOT NULL,
  tingkat INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Siswa (detail siswa)
CREATE TABLE IF NOT EXISTS siswa (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  nis VARCHAR(20) UNIQUE NOT NULL,
  kelas_id INT NOT NULL,
  jenis_kelamin ENUM('L', 'P') NOT NULL,
  alamat TEXT,
  no_telp VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (kelas_id) REFERENCES kelas(id) ON DELETE CASCADE
);

-- Tabel Guru (detail guru)
CREATE TABLE IF NOT EXISTS guru (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  nip VARCHAR(20) UNIQUE NOT NULL,
  mata_pelajaran VARCHAR(100),
  no_telp VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabel Mata Pelajaran
CREATE TABLE IF NOT EXISTS mata_pelajaran (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama_mapel VARCHAR(100) NOT NULL,
  kode_mapel VARCHAR(20) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Jadwal Pelajaran
CREATE TABLE IF NOT EXISTS jadwal (
  id INT AUTO_INCREMENT PRIMARY KEY,
  kelas_id INT NOT NULL,
  mata_pelajaran_id INT NOT NULL,
  guru_id INT NOT NULL,
  hari ENUM('Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu') NOT NULL,
  jam_mulai TIME NOT NULL,
  jam_selesai TIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (kelas_id) REFERENCES kelas(id) ON DELETE CASCADE,
  FOREIGN KEY (mata_pelajaran_id) REFERENCES mata_pelajaran(id) ON DELETE CASCADE,
  FOREIGN KEY (guru_id) REFERENCES guru(id) ON DELETE CASCADE
);

-- Tabel Absensi
CREATE TABLE IF NOT EXISTS absensi (
  id INT AUTO_INCREMENT PRIMARY KEY,
  siswa_id INT NOT NULL,
  jadwal_id INT NOT NULL,
  tanggal DATE NOT NULL,
  waktu_absen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status_kehadiran ENUM('hadir', 'sakit', 'izin', 'alpha') DEFAULT 'hadir',
  status_verifikasi ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  keterangan TEXT,
  verified_by INT,
  verified_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (siswa_id) REFERENCES siswa(id) ON DELETE CASCADE,
  FOREIGN KEY (jadwal_id) REFERENCES jadwal(id) ON DELETE CASCADE,
  FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Data Sample untuk Testing

-- Insert User Admin
INSERT INTO users (username, password, nama_lengkap, role) VALUES
('admin', 'admin123', 'Administrator', 'admin');

-- Insert User Guru
INSERT INTO users (username, password, nama_lengkap, role) VALUES
('guru1', 'guru123', 'Budi Santoso', 'guru'),
('guru2', 'guru123', 'Siti Nurhaliza', 'guru');

-- Insert Kelas
INSERT INTO kelas (nama_kelas, tingkat) VALUES
('X RPL 1', 10),
('X RPL 2', 10),
('XI RPL 1', 11),
('XI RPL 2', 11);

-- Insert User Siswa
INSERT INTO users (username, password, nama_lengkap, role) VALUES
('siswa1', 'siswa123', 'Ahmad Fauzi', 'siswa'),
('siswa2', 'siswa123', 'Dewi Lestari', 'siswa'),
('siswa3', 'siswa123', 'Rizky Pratama', 'siswa'),
('siswa4', 'siswa123', 'Sari Wijaya', 'siswa');

-- Insert Data Guru
INSERT INTO guru (user_id, nip, mata_pelajaran, no_telp) VALUES
(2, '198501012010011001', 'Pemrograman Web', '081234567890'),
(3, '198701022012012001', 'Basis Data', '081234567891');

-- Insert Data Siswa
INSERT INTO siswa (user_id, nis, kelas_id, jenis_kelamin, alamat, no_telp) VALUES
(4, '2023001', 1, 'L', 'Jl. Merdeka No. 123', '081234567892'),
(5, '2023002', 1, 'P', 'Jl. Sudirman No. 456', '081234567893'),
(6, '2023003', 2, 'L', 'Jl. Gatot Subroto No. 789', '081234567894'),
(7, '2023004', 2, 'P', 'Jl. Ahmad Yani No. 321', '081234567895');

-- Insert Mata Pelajaran
INSERT INTO mata_pelajaran (nama_mapel, kode_mapel) VALUES
('Pemrograman Web', 'PWB'),
('Basis Data', 'BD'),
('Matematika', 'MTK'),
('Bahasa Indonesia', 'BIND');

-- Insert Jadwal
INSERT INTO jadwal (kelas_id, mata_pelajaran_id, guru_id, hari, jam_mulai, jam_selesai) VALUES
(1, 1, 1, 'Senin', '07:00:00', '09:00:00'),
(1, 2, 2, 'Selasa', '07:00:00', '09:00:00'),
(2, 1, 1, 'Rabu', '07:00:00', '09:00:00'),
(2, 2, 2, 'Kamis', '07:00:00', '09:00:00');
