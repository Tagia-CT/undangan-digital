"use client";

import { useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { doc, getDoc, updateDoc, collection, addDoc, onSnapshot, 
  query, orderBy, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';

// --- KOMPONEN ISI UNDANGAN ---
function IsiUndangan({ namaTamu, tamuId }) {
  // State RSVP & Ucapan
  const [kehadiran, setKehadiran] = useState("Hadir");
  const [jumlah, setJumlah] = useState(1);
  const [isRsvpSubmitting, setIsRsvpSubmitting] = useState(false);
  const [isRsvpSuccess, setIsRsvpSuccess] = useState(false);
  const [teksUcapan, setTeksUcapan] = useState("");
  const [daftarUcapan, setDaftarUcapan] = useState([]);
  const [isUcapanSubmitting, setIsUcapanSubmitting] = useState(false);

  // State Hitung Mundur
  const [timeLeft, setTimeLeft] = useState({ hari: 0, jam: 0, menit: 0, detik: 0 });

  useEffect(() => {
      const targetDate = new Date("2026-09-14T10:00:00").getTime();
      const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance > 0) {
        setTimeLeft({
          hari: Math.floor(distance / (1000 * 60 * 60 * 24)),
          jam: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          menit: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          detik: Math.floor((distance % (1000 * 60)) / 1000),
        });
      } else {
        clearInterval(interval);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Mengambil daftar ucapan secara Real-Time
  useEffect(() => {
    const q = query(collection(db, "ucapan"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ucapanData = [];
      snapshot.forEach((doc) => {
        ucapanData.push({ id: doc.id, ...doc.data() });
      });
      setDaftarUcapan(ucapanData);
    });
    return () => unsubscribe();
  }, []);

  const kirimRSVP = async (e) => {
    e.preventDefault();
    if (!tamuId) return;
    setIsRsvpSubmitting(true);
    try {
      const tamuRef = doc(db, "tamu", tamuId);
      await updateDoc(tamuRef, {
        statusRSVP: kehadiran,
        jumlahTamu: kehadiran === "Hadir" ? parseInt(jumlah) || 0 : 0,
      });
      setIsRsvpSuccess(true);
    } catch (error) {
      console.error("Error mengirim RSVP:", error);
      alert("Gagal mengirim RSVP.");
    }
    setIsRsvpSubmitting(false);
  };

  const kirimUcapan = async (e) => {
    e.preventDefault();
    if (!teksUcapan.trim()) return;
    setIsUcapanSubmitting(true);
    try {
      await addDoc(collection(db, "ucapan"), {
        doa: teksUcapan,
        timestamp: serverTimestamp(),
        tamuId: tamuId, 
        nama: namaTamu
      });
      setTeksUcapan("");
    } catch (error) {
      console.error("Error mengirim ucapan:", error);
      alert("Gagal mengirim ucapan.");
    }
    setIsUcapanSubmitting(false);
  };

  const hapusUcapan = async (idUcapan) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus doa ini?")) {
      try {
        await deleteDoc(doc(db, "ucapan", idUcapan));
      } catch (error) {
        console.error("Error menghapus ucapan:", error);
      }
    }
  };

  const copyRekening = () => {
    navigator.clipboard.writeText("1460017035689");
    alert("Nomor Rekening berhasil disalin!");
  };

  return (
    <div className="font-inter text-slate-900 bg-slate-900">
      
      {/* BARIS 1: Hitung Mundur */}
      <section 
        className="min-h-screen flex flex-col justify-center items-center py-20 px-6 relative"
        style={{ backgroundImage: "url('/wedding 1.jpeg')", backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}
      >
        <div className="absolute inset-0 bg-black/40 z-0"></div> 
        
        <div className="relative z-10 glass-panel-dark p-8 text-center max-w-lg w-full flex flex-col items-center gap-6">
          <h2 className="text-3xl font-serif font-bold text-white tracking-widest mb-4">Menuju Hari Bahagia</h2>
          
          <div className="flex justify-center gap-4 text-white">
            <div className="flex flex-col items-center">
              <span className="text-4xl md:text-5xl font-bold drop-shadow-md">{timeLeft.hari}</span>
              <span className="text-sm uppercase tracking-widest mt-2">Hari</span>
            </div>
            <span className="text-4xl font-bold">:</span>
            <div className="flex flex-col items-center">
              <span className="text-4xl md:text-5xl font-bold drop-shadow-md">{timeLeft.jam}</span>
              <span className="text-sm uppercase tracking-widest mt-2">Jam</span>
            </div>
            <span className="text-4xl font-bold">:</span>
            <div className="flex flex-col items-center">
              <span className="text-4xl md:text-5xl font-bold drop-shadow-md">{timeLeft.menit}</span>
              <span className="text-sm uppercase tracking-widest mt-2">Menit</span>
            </div>
            <span className="text-4xl font-bold">:</span>
            <div className="flex flex-col items-center">
              <span className="text-4xl md:text-5xl font-bold drop-shadow-md">{timeLeft.detik}</span>
              <span className="text-sm uppercase tracking-widest mt-2">Detik</span>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/30 text-center text-sm italic opacity-90 leading-relaxed">
            "Demikianlah mereka bukan lagi dua, melainkan satu. Karena itu, apa yang telah dipersatukan Allah, tidak boleh diceraikan manusia."<br/><br/>
            <strong className="font-serif block">— Matius 19:6 —</strong>
          </div>
        </div>
      </section>

      {/* BARIS 2: Profil Mempelai */}
      <section 
  className="py-24 px-6 relative flex items-center justify-center min-h-screen"
  style={{ backgroundImage: "url('/wedding 6.jpeg')", backgroundSize: 'cover', backgroundPosition: 'center' }}
>
  <div className="absolute inset-0 bg-white/40 z-0"></div> 

  <div className="relative z-10 glass-panel-light p-10 max-w-4xl w-full text-center">
    <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-slate-800 mb-12" style={{letterSpacing: '0.3em'}}>Sang Mempelai</h2>
    
    <div className="flex flex-col md:flex-row justify-center items-center gap-16 md:gap-24">
      
      {/* Mempelai Pria */}
      <div className="flex-1 max-w-sm flex flex-col items-center">
        {/* Diubah: h-64 dan rounded-2xl */}
        <div className="w-48 h-64 rounded-2xl border-[6px] border-white/40 shadow-lg overflow-hidden mb-6">
          <img src="/anggia.jpeg" alt="Mempelai Pria" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
        </div>
        <h3 className="text-3xl font-serif font-bold text-slate-950 mb-2">Tawarikh Anggia Cristopher</h3>
        <p className="text-slate-800 font-medium leading-relaxed drop-shadow-sm">Putra dari<br />Bapak Udang & Ibu Suryani</p>
      </div>
      
      <div className="text-6xl font-serif text-slate-800 font-light">&</div>
      
      {/* Mempelai Wanita */}
      <div className="flex-1 max-w-sm flex flex-col items-center">
        {/* Diubah: h-64 dan rounded-2xl */}
        <div className="w-48 h-64 rounded-2xl border-[6px] border-white/40 shadow-lg overflow-hidden mb-6">
          <img src="/risu.jpeg" alt="Mempelai Wanita" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
        </div>
        <h3 className="text-3xl font-serif font-bold text-slate-950 mb-2">Ely Aulia</h3>
        <p className="text-slate-800 font-medium leading-relaxed drop-shadow-sm">Putri dari<br />Bapak Alvon & Ibu Lirian</p>
      </div>

    </div>
  </div>
</section>

      {/* BARIS 3: Detail Acara */}
      <section 
        className="py-24 px-6 relative min-h-screen flex items-center justify-center"
        style={{ backgroundImage: "url('/wedding 2.jpeg')", backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}
      >
        <div className="absolute inset-0 bg-black/40 z-0"></div>

        <div className="relative z-10 w-full max-w-4xl grid md:grid-cols-2 gap-8">
          <div className="glass-panel-light p-10 text-center flex flex-col items-center">
            {/* Border bawah tulisan diubah menjadi tipis dan semi transparan */}
            <h3 className="text-3xl font-serif font-bold mb-6 text-slate-950 border-b border-black/20 pb-4 w-full">Pemberkatan</h3>
            <p className="font-bold text-slate-900 text-xl mb-2 drop-shadow-sm">Senim, 14 September 2026</p>
            <p className="text-slate-800 mb-8 font-medium">Pukul 10.00 WIB - 12.00 WIB</p>
            <p className="text-sm text-slate-900 mb-8 leading-relaxed font-medium">
              <strong className="text-lg block mb-1 font-bold">Katedral Kristus Raja Sintang</strong>
              Jalan Kelam, Baning Kota, Sintang
            </p>
            <a href="https://maps.app.goo.gl/Z8YcdpFEUdaddeQt7" className="mt-auto px-8 py-3 bg-slate-900/80 backdrop-blur-md border border-white/30 text-white rounded-full font-bold hover:bg-slate-700" style={{textDecoration: 'none'}}>Lihat Lokasi</a>
          </div>

          <div className="glass-panel-light p-10 text-center flex flex-col items-center">
            <h3 className="text-3xl font-serif font-bold mb-6 text-slate-950 border-b border-black/20 pb-4 w-full">Resepsi</h3>
            <p className="font-bold text-slate-900 text-xl mb-2 drop-shadow-sm">Senin, 14 September 2026</p>
            <p className="text-slate-800 mb-8 font-medium">Pukul 18.00 WIB - Selesai</p>
            <p className="text-sm text-slate-900 mb-8 leading-relaxed font-medium">
              <strong className="text-lg block mb-1 font-bold">Gedung Balai Kenyalang Sintang</strong>
              Jl. Lintas Melawi, Sintang
            </p>
            <a href="https://maps.app.goo.gl/LjhDHGGVSiNs28Mg8" className="mt-auto px-8 py-3 bg-slate-900/80 backdrop-blur-md border border-white/30 text-white rounded-full font-bold hover:bg-slate-700" style={{textDecoration: 'none'}}>Lihat Lokasi</a>
          </div>
        </div>
      </section>

      {/* BARIS 4: RSVP */}
      <section 
        className="py-24 px-6 relative flex items-center justify-center min-h-screen"
        style={{ backgroundImage: "url('/wedding 3.jpeg')", backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div className="absolute inset-0 bg-white/50 z-0"></div>

        <div className="relative z-10 glass-panel-light p-12 max-w-xl w-full">
          <h2 className="text-4xl font-serif font-bold text-center text-slate-950 mb-8 drop-shadow-sm">Reservasi Kehadiran</h2>

          {isRsvpSuccess ? (
            <div className="text-center p-6 bg-green-100/70 backdrop-blur-sm rounded-xl border border-green-500/50">
              <h3 className="text-xl font-bold text-green-900 mb-2">RSVP Berhasil!</h3>
              <p className="text-green-800 font-medium">Terima kasih atas konfirmasinya.</p>
            </div>
          ) : (
            <form onSubmit={kirimRSVP} className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-slate-900 drop-shadow-sm">Nama Tamu</label>
                {/* Kotak isian dibuat bg-white/40 (semi transparan) */}
                <input type="text" value={namaTamu} disabled className="border border-white/60 rounded-lg p-4 bg-white/40 text-slate-800 font-bold backdrop-blur-sm shadow-inner" />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-slate-900 drop-shadow-sm">Apakah Anda akan hadir?</label>
                <select value={kehadiran} onChange={(e) => setKehadiran(e.target.value)} className="border border-white/60 rounded-lg p-4 bg-white/50 text-slate-900 font-bold backdrop-blur-sm shadow-inner outline-none">
                  <option value="Hadir">Ya, saya akan hadir</option>
                  <option value="Tidak Hadir">Maaf, saya tidak bisa hadir</option>
                </select>
              </div>

              {kehadiran === "Hadir" && (
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-slate-900 drop-shadow-sm">Jumlah orang yang hadir</label>
                  <input type="number" min="1" value={jumlah} onChange={(e) => setJumlah(e.target.value)} className="border border-white/60 rounded-lg p-4 bg-white/50 text-slate-900 font-bold backdrop-blur-sm shadow-inner outline-none" required />
                </div>
              )}

              <button type="submit" disabled={isRsvpSubmitting} className="mt-4 w-full bg-slate-900/80 backdrop-blur-md border border-white/30 text-white font-bold py-4 rounded-lg hover:bg-slate-700 cursor-pointer shadow-lg transition-all">
                {isRsvpSubmitting ? "Menyimpan..." : "Kirim Konfirmasi"}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* BARIS 5: Ucapan & Doa */}
      <section 
        className="py-24 px-6 relative min-h-screen"
        style={{ backgroundImage: "url('/wedding 5.jpeg')", backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}
      >
        <div className="absolute inset-0 bg-black/50 z-0"></div>

        <div className="relative z-10 max-w-3xl mx-auto flex flex-col gap-8">
          <h2 className="text-4xl font-serif font-bold text-center text-white mb-4 shadow-black drop-shadow-lg">Wedding Wishes</h2>
          
          <div className="glass-panel-light p-8 flex flex-col gap-4">
            <form onSubmit={kirimUcapan} className="flex flex-col gap-4">
              {/* Kolom pesan dibuat semi-transparan */}
              <textarea rows="3" value={teksUcapan} onChange={(e) => setTeksUcapan(e.target.value)} placeholder="Tulis doa untuk mempelai..." className="w-full border border-white/60 rounded-lg p-4 bg-white/50 text-slate-900 font-medium resize-none backdrop-blur-sm shadow-inner outline-none placeholder:text-slate-600" required></textarea>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-widest drop-shadow-sm">Pesan Anonim</span>
                <button type="submit" disabled={isUcapanSubmitting} className="bg-slate-900/80 backdrop-blur-md text-white border border-white/30 px-8 py-3 rounded-full font-bold hover:bg-slate-800 cursor-pointer shadow-lg">
                  Kirim Doa
                </button>
              </div>
            </form>
          </div>

          <div className="flex flex-col gap-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {daftarUcapan.length === 0 ? (
              <p className="text-center text-white italic py-8">Jadilah yang pertama memberikan doa!</p>
            ) : (
              daftarUcapan.map((item) => (
                <div key={item.id} className="glass-panel-light p-6 relative flex flex-col gap-4">
                  <span className="absolute top-2 right-4 text-4xl text-slate-500/30">❝</span>
                  <p className="text-slate-900 italic relative z-10 font-bold drop-shadow-sm">"{item.doa}"</p>
                  <div className="flex justify-between items-center border-t border-slate-900/10 pt-3">
                    <span className="text-xs font-bold text-slate-700 uppercase">— Tamu Undangan</span>
                    {item.tamuId === tamuId && (
                      <button onClick={() => hapusUcapan(item.id)} className="text-xs font-bold text-red-600 hover:text-red-800 cursor-pointer bg-transparent border-none">Hapus</button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* BARIS 6: Wedding Gift */}
      <section 
        className="py-24 px-6 relative flex items-center justify-center min-h-[70vh]"
        style={{ backgroundImage: "url('/wedding 4.jpeg')", backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div className="absolute inset-0 bg-white/60 z-0"></div>

        <div className="relative z-10 glass-panel-light p-12 max-w-md w-full text-center flex flex-col items-center gap-6">
          <h2 className="text-3xl font-serif font-bold text-slate-950 drop-shadow-sm">Wedding Gift</h2>
          <p className="text-slate-900 font-medium leading-relaxed drop-shadow-sm">
            Doa restu Anda merupakan karunia yang sangat berarti bagi kami. Namun jika Anda bermaksud memberikan tanda kasih, Anda dapat mengirimkannya melalui:
          </p>
          
          {/* Kotak rekening dibuat transparan bg-white/30 */}
          <div className="w-full border border-white/60 rounded-xl p-6 bg-white/30 backdrop-blur-md flex flex-col gap-2 items-center shadow-inner">
            <h4 className="font-bold text-lg text-slate-950">Bank Mandiri</h4>
            <p className="text-2xl font-bold text-slate-900 tracking-widest my-2 drop-shadow-sm">1460017035689</p>
            <p className="text-sm font-bold text-slate-800 uppercase">A.N TAWARIKH ANGGIA CRIS</p>
            
            <button onClick={copyRekening} className="mt-4 px-6 py-2 bg-white/60 border border-white/80 text-slate-900 rounded-full text-sm font-bold hover:bg-white/80 cursor-pointer shadow-sm backdrop-blur-sm">
              Salin Nomor Rekening
            </button>
          </div>
        </div>
      </section>

      {/* BARIS 7: Penutup */}
      <section 
        className="py-24 px-6 relative flex flex-col justify-between min-h-screen text-white text-center"
        style={{ backgroundImage: "url('/wedding 9.jpeg')", backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}
      >
        <div className="absolute inset-0 bg-black/50 z-0"></div>

        <div className="relative z-10 flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto gap-8">
          <h2 className="text-4xl font-serif font-bold drop-shadow-lg">Terima Kasih</h2>
          <p className="text-lg leading-relaxed opacity-90 font-medium drop-shadow-md">
            Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir untuk memberikan doa restu kepada kami.
          </p>
          <div className="mt-8 flex flex-col items-center gap-2">
            <p className="text-sm uppercase tracking-[0.3em] opacity-80 drop-shadow-sm">Kami yang berbahagia</p>
            <h3 className="text-3xl font-serif font-bold mt-2 drop-shadow-lg">Anggia & Aulia</h3>
          </div>
        </div>

        <div className="relative z-10 mt-20 pt-8 border-t border-white/30 flex flex-col items-center gap-4">
          <h4 className="font-bold tracking-[0.4em] text-lg drop-shadow-sm">T.A.C</h4>
          <p className="text-xs opacity-70 uppercase tracking-widest">Design & Development</p>
          <div className="flex gap-6 mt-2">
            <a href="https://wa.me/6281253401297" className="text-white hover:text-gray-300 font-medium drop-shadow-sm" style={{textDecoration: 'none'}}>WhatsApp</a>
            <a href="https://www.instagram.com/tagia_ct" className="text-white hover:text-gray-300 font-medium drop-shadow-sm" style={{textDecoration: 'none'}}>Instagram</a>
            <a href="https://tac.dennyjcs.com/" className="text-white hover:text-gray-300 font-medium drop-shadow-sm" style={{textDecoration: 'none'}}>Website</a>
          </div>
        </div>
      </section>

    </div>
  );
}


// Komponen utama cover undangan
function CoverContent() {
  const searchParams = useSearchParams();
  const tamuId = searchParams.get('id');

  const [namaTamu, setNamaTamu] = useState("Tamu Undangan");
  const [isLoading, setIsLoading] = useState(true);
  const [isOpened, setIsOpened] = useState(false);

  // Mengambil nama tamu dari Firebase berdasarkan tamuId
  useEffect(() => {
    const fetchNamaTamu = async () => {
      if (!tamuId) {
        setIsLoading(false);
        return;
      }

      try {
        const docRef = doc(db, "tamu", tamuId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setNamaTamu(docSnap.data().nama);
        } else {
          console.log("Data tamu tidak ditemukan!");
        }
      } catch (error) {
        console.error("Error mengambil data:", error);
      }
      setIsLoading(false);
    };

    fetchNamaTamu();
  }, [tamuId]);

  if (isOpened) {
    return <IsiUndangan namaTamu={namaTamu} tamuId={tamuId} />;
  }

 // Tampilan Halaman Cover (Teks Putih, Bayangan Kuat, Nama Menyilang)
  return (
    <main
      className="relative flex flex-col items-center justify-center min-h-screen bg-cover bg-center font-inter antialiased"
      // URL FOTO ASLI ANDA
      style={{ backgroundImage: "url('/wedding 7.jpeg')" }}
    >
      {/* Overlay transparan agar foto tetap terang tapi teks terbaca */}
      <div className="absolute inset-0 bg-black/10 z-0"></div>

      <div className="relative z-10 text-center flex flex-col items-center justify-center p-6 w-full max-w-md mx-auto">
        
        <p 
          className="text-sm font-medium uppercase tracking-[0.3em] mb-2"
          // Memaksa warna putih dan bayangan hitam kuat
          style={{ color: "white", textShadow: "1px 2px 4px rgba(0,0,0,0.9)" }}
        >
          The Wedding Of
        </p>
        
        {/* Layout Nama Menyilang */}
        <div className="flex flex-col w-full max-w-[280px] md:max-w-[380px] mx-auto font-serif">
          
          {/* Nama 1 */}
          <h1 
            className="text-6xl md:text-7xl font-bold text-left leading-[0.7]"
            style={{ color: "white", textShadow: "2px 4px 8px rgba(0,0,0,1)" }}
          >
            Anggia
          </h1>
          
          {/* Simbol & - Di-posisikan menumpuk secara paksa */}
          <div 
            className="relative z-10 text-7xl md:text-8xl font-light italic text-center leading-none"
            style={{ 
              color: "white", 
              textShadow: "2px 4px 8px rgba(0,0,0,1)",
              marginTop: "-15px",   // Tarik ke atas
              marginBottom: "-15px" // Tarik ke bawah
            }}
          >
            &
          </div>
          
          {/* Nama 2 */}
          <h1 
            className="text-6xl md:text-7xl font-bold text-right leading-[0.7]"
            style={{ color: "white", textShadow: "2px 4px 8px rgba(0,0,0,1)" }}
          >
            Aulia
          </h1>
          
        </div>

        {/* Area Nama Tamu */}
        <div className="flex flex-col items-center justify-center space-y-4 mt-8 mb-8">
          <p 
            className="text-sm tracking-widest"
            style={{ color: "white", textShadow: "1px 2px 4px rgba(0,0,0,0.9)" }}
          >
            Kepada Yth.
          </p>
          
          {isLoading ? (
            <div className="h-8 w-48 bg-white/40 animate-pulse rounded-md my-1"></div>
          ) : (
            <h2 
              className="text-3xl md:text-4xl font-serif font-bold capitalize tracking-wide"
              style={{ color: "white", textShadow: "2px 4px 8px rgba(0,0,0,1)" }}
            >
              {namaTamu}
            </h2>
          )}
          
          <p 
            className="text-sm tracking-widest"
            style={{ color: "white", textShadow: "1px 2px 4px rgba(0,0,0,0.9)" }}
          >
            di Tempat
          </p>
        </div>

        <button
          onClick={() => setIsOpened(true)}
          className="px-8 py-3.5 bg-white/10 backdrop-blur-sm border border-white/40 text-white rounded-full font-bold text-sm tracking-widest uppercase hover:bg-white/20 transition-all shadow-lg active:scale-95"
        >
          Buka Undangan
        </button>
      </div>
    </main>
  );
}

// Next.js mewajibkan fitur pencari URL dibungkus oleh Suspense
export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">Memuat...</div>}>
      <CoverContent />
    </Suspense>
  );
}
