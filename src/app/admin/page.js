"use client";

import { useState, useEffect } from "react";
import { collection, addDoc, onSnapshot, query, doc, deleteDoc, orderBy } from "firebase/firestore";
import { db } from "../firebase";

// === PENGATURAN KATA SANDI ADMIN ===
// Silakan ganti "Sintang2026" dengan kata sandi rahasia yang Anda inginkan
const PASSWORD_RAHASIA = "Sintang2026"; 

export default function AdminDashboard() {
  // 1. State untuk Sistem Keamanan
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [inputPassword, setInputPassword] = useState("");
  const [errorLogin, setErrorLogin] = useState("");

  // 2. State untuk Data Aplikasi
  const [namaTamu, setNamaTamu] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [daftarTamu, setDaftarTamu] = useState([]);
  const [daftarUcapan, setDaftarUcapan] = useState([]);
  const [copiedId, setCopiedId] = useState(null);

  // 3. Cek apakah admin sudah login sebelumnya di sesi ini
  useEffect(() => {
    const statusLogin = sessionStorage.getItem("admin_authenticated");
    if (statusLogin === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  // 4. Fungsi Menangani Proses Login
  const handleLogin = (e) => {
    e.preventDefault();
    if (inputPassword === PASSWORD_RAHASIA) {
      sessionStorage.setItem("admin_authenticated", "true");
      setIsAuthenticated(true);
      setErrorLogin("");
    } else {
      setErrorLogin("Kata sandi salah! Akses ditolak.");
      setInputPassword("");
    }
  };

  // 5. Fungsi Log Out (Keluar)
  const handleLogout = () => {
    sessionStorage.removeItem("admin_authenticated");
    setIsAuthenticated(false);
  };

  // 6. Membaca data Tamu (Hanya berjalan jika sudah login)
  useEffect(() => {
    if (!isAuthenticated) return;
    const q = query(collection(db, "tamu"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dataTamu = [];
      snapshot.forEach((doc) => {
        dataTamu.push({ id: doc.id, ...doc.data() });
      });
      setDaftarTamu(dataTamu);
    });
    return () => unsubscribe();
  }, [isAuthenticated]);

  // 7. Membaca data Ucapan (Hanya berjalan jika sudah login)
  useEffect(() => {
    if (!isAuthenticated) return;
    const qUcapan = query(collection(db, "ucapan"), orderBy("timestamp", "desc"));
    const unsubscribeUcapan = onSnapshot(qUcapan, (snapshot) => {
      const dataUcapan = [];
      snapshot.forEach((doc) => {
        dataUcapan.push({ id: doc.id, ...doc.data() });
      });
      setDaftarUcapan(dataUcapan);
    });
    return () => unsubscribeUcapan();
  }, [isAuthenticated]);

  // Fungsi-fungsi manipulasi data (Tambah, Hapus, Copy)
  const tambahTamu = async (e) => {
    e.preventDefault();
    if (!namaTamu) return;
    setIsLoading(true);
    try {
      await addDoc(collection(db, "tamu"), {
        nama: namaTamu,
        statusRSVP: "Belum Merespon",
        jumlahTamu: 0,
      });
      setNamaTamu("");
    } catch (error) {
      console.error(error);
      alert("Gagal menambahkan tamu.");
    }
    setIsLoading(false);
  };

  const hapusTamu = async (idTamu) => {
    if (window.confirm("Yakin ingin menghapus tamu ini?")) {
      try { await deleteDoc(doc(db, "tamu", idTamu)); } catch (error) { console.error(error); }
    }
  };

  const hapusDoa = async (idUcapan) => {
    if (window.confirm("Yakin ingin menghapus doa ini dari sistem?")) {
      await deleteDoc(doc(db, "ucapan", idUcapan));
    }
  };

  const handleCopyLink = (idTamu) => {
    const link = `http://localhost:3000/?id=${idTamu}`;
    navigator.clipboard.writeText(link);
    setCopiedId(idTamu);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const totalHadir = daftarTamu.filter(t => t.statusRSVP === "Hadir").length;
  const totalTidakHadir = daftarTamu.filter(t => t.statusRSVP === "Tidak Hadir").length;
  const perkiraanPorsi = daftarTamu.reduce((total, tamu) => total + (tamu.jumlahTamu || 0), 0);

  const filteredTamu = daftarTamu
    .filter(tamu => tamu.nama.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => a.nama.localeCompare(b.nama));


  // --- TAMPILAN 1: GERBANG LOGIN (Jika belum terautentikasi) ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6 font-sans">
        <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-sm w-full text-center">
          <div className="text-4xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Area Dilindungi</h1>
          <p className="text-sm text-gray-500 mb-6">Masukkan kata sandi khusus admin untuk mengelola data undangan.</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="password" 
              placeholder="Kata Sandi Rahasia" 
              value={inputPassword}
              onChange={(e) => setInputPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 text-center text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none font-bold tracking-widest"
              required
            />
            {errorLogin && <p className="text-xs font-bold text-red-500">{errorLogin}</p>}
            
            <button type="submit" className="w-full bg-gray-950 text-white font-bold py-3 rounded-lg hover:bg-gray-800 transition cursor-pointer">
              Buka Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }


  // --- TAMPILAN 2: DASHBOARD UTAMA (Jika kata sandi benar) ---
  return (
    <div className="min-h-screen bg-gray-100 p-6 md:p-10 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Kepala Dashboard & Tombol Log Out */}
        <div className="bg-white p-8 rounded-xl shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Dashboard Admin</h1>
            <p className="text-sm text-gray-500">Kelola reservasi Tawarikh Anggia & Ayunda Risu</p>
          </div>
          <button onClick={handleLogout} className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg text-sm font-bold cursor-pointer transition border-none">
            Keluar (Log Out)
          </button>
        </div>

        {/* Form Tambah Tamu */}
        <div className="bg-white p-8 rounded-xl shadow-md">
          <form onSubmit={tambahTamu} className="flex flex-col md:flex-row gap-4">
            <input type="text" value={namaTamu} onChange={(e) => setNamaTamu(e.target.value)} placeholder="Masukkan Name Lengkap Tamu..." className="flex-1 border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500 outline-none" required />
            <button type="submit" disabled={isLoading} className="bg-blue-600 text-white px-8 py-3 rounded-md hover:bg-blue-700 font-medium cursor-pointer transition">
              {isLoading ? "Menyimpan..." : "+ Buat Undangan Baru"}
            </button>
          </form>
        </div>

        {/* Bagian Statistik */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
            <p className="text-sm text-gray-500 font-medium">Total Undangan</p>
            <p className="text-3xl font-bold text-gray-800">{daftarTamu.length}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500">
            <p className="text-sm text-gray-500 font-medium">Keluarga Hadir</p>
            <p className="text-3xl font-bold text-green-600">{totalHadir}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-red-500">
            <p className="text-sm text-gray-500 font-medium">Tidak Hadir</p>
            <p className="text-3xl font-bold text-red-600">{totalTidakHadir}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-yellow-500">
            <p className="text-sm text-gray-500 font-medium">Perkiraan Porsi</p>
            <p className="text-3xl font-bold text-yellow-600">{perkiraanPorsi}</p>
          </div>
        </div>

        {/* Data Teks & Tabel */}
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 bg-white rounded-xl shadow-md overflow-hidden h-[650px] flex flex-col">
            <div className="p-5 bg-gray-50 border-b border-gray-200 flex justify-between items-center flex-wrap gap-4">
              <h2 className="text-xl font-bold text-gray-800">Daftar Tamu & RSVP</h2>
              <input type="text" placeholder="Cari nama tamu..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="border border-gray-300 rounded-md p-2 text-sm outline-none focus:ring-1 focus:ring-blue-500 min-w-[200px]" />
            </div>
            <div className="overflow-y-auto flex-1 p-0 custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-gray-100 shadow-sm z-10">
                  <tr className="text-gray-600 text-xs uppercase tracking-wider">
                    <th className="p-4 border-b">Nama Tamu</th>
                    <th className="p-4 border-b text-center">Tautan</th>
                    <th className="p-4 border-b text-center">Status</th>
                    <th className="p-4 border-b text-center">Porsi</th>
                    <th className="p-4 border-b text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="text-gray-800 text-sm">
                  {filteredTamu.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-gray-500 italic">Tidak ada data tamu ditemukan.</td>
                    </tr>
                  ) : (
                    filteredTamu.map((tamu) => (
                      <tr key={tamu.id} className="hover:bg-gray-50 border-b transition">
                        <td className="p-4 font-medium">{tamu.nama}</td>
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-2">
                            <input type="text" readOnly value={`http://localhost:3000/?id=${tamu.id}`} className="w-20 md:w-28 text-blue-600 bg-transparent outline-none cursor-text select-all truncate" />
                            <button onClick={() => handleCopyLink(tamu.id)} className="p-2 hover:bg-gray-200 rounded-md transition-colors flex-shrink-0 cursor-pointer border-none bg-transparent">
                              {copiedId === tamu.id ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="green" viewBox="0 0 16 16"><path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/></svg>
                              ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="text-gray-600" viewBox="0 0 16 16"><path fillRule="evenodd" d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V2Zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H6ZM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1H2Z"/></svg>
                              )}
                            </button>
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${tamu.statusRSVP === 'Hadir' ? 'bg-green-100 text-green-700' : tamu.statusRSVP === 'Tidak Hadir' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                            {tamu.statusRSVP}
                          </span>
                        </td>
                        <td className="p-4 text-center font-bold">{tamu.jumlahTamu}</td>
                        <td className="p-4 text-center">
                          <button onClick={() => hapusTamu(tamu.id)} className="text-red-500 hover:text-red-700 text-xs font-bold cursor-pointer transition border-none bg-transparent">Hapus</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="md:col-span-1 bg-white rounded-xl shadow-md overflow-hidden h-[650px] flex flex-col">
            <div className="p-5 bg-gray-50 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">Buku Tamu & Doa</h2>
            </div>
            <div className="overflow-y-auto flex-1 p-5 space-y-4 bg-gray-50 custom-scrollbar">
              {daftarUcapan.length === 0 ? (
                <p className="text-center text-gray-500 italic text-sm mt-10">Belum ada doa yang masuk.</p>
              ) : (
                daftarUcapan.map((item) => (
                  <div key={item.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                    <p className="font-bold text-sm text-blue-700 mb-1">{item.nama || "Tamu Anonim"}</p>
                    <p className="text-gray-700 text-sm mb-3">"{item.doa}"</p>
                    <div className="flex justify-end">
                      <button onClick={() => hapusDoa(item.id)} className="text-xs text-red-500 hover:text-red-700 font-medium cursor-pointer transition border-none bg-transparent">Hapus Doa</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}