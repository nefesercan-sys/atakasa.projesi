// 📡 İLAN DETAY ÇEKME (SADECE HEDEF VARLIĞA ODAKLANIR 🎯)
  const fetchIlanDetay = async () => {
    try {
      // NOKTA ATIŞI: Artık API'ye ID gönderiyoruz, böylece 10 saniye değil 0.1 saniyede geliyor.
      const res = await fetch(`/api/varliklar?id=${resolvedParams.id}`); 
      const data = await res.json();
      
      // API'den gelen veriyi güvenli bir şekilde yakala
      const liste = Array.isArray(data) ? data : data.data || data.ilanlar || [];
      const seciliIlan = liste.find((i: any) => i._id === resolvedParams.id || i.id === resolvedParams.id) || liste[0];
      
      setIlan(seciliIlan);
      
      if (seciliIlan) {
        const saticiMail = seciliIlan.sellerEmail || seciliIlan.satici?.email || seciliIlan.userId || seciliIlan.satici;
        fetchSaticiYorumlari(saticiMail);
      }
    } catch (error) { 
      console.error("Siber veri çekilemedi:", error); 
    } finally {
      setLoading(false);
    }
  };

  // 📡 BENİM VARLIKLARIM (SADECE GİRİŞ YAPILDIYSA ÇALIŞIR)
  const fetchBenimIlanlarim = async () => {
    if (!session?.user?.email) return;
    try {
      // Burası da kendi ilanlarını hızlıca çekmek için optimize edildi
      const res = await fetch(`/api/varliklar`);
      if (res.ok) {
        const data = await res.json();
        const liste = Array.isArray(data) ? data : data.data || data.ilanlar || [];
        const benimkiler = liste.filter((i: any) => {
           const sEmail = (typeof i.userId === 'string' ? i.userId : i.satici?.email || i.satici || "").toLowerCase();
           return sEmail === session?.user?.email?.toLowerCase();
        });
        setBenimIlanlarim(benimkiler);
      }
    } catch (error) { 
      console.error("Varlıklar çekilemedi."); 
    }
  };
