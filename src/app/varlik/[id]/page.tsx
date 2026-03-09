// 📡 İLAN DETAY ÇEKME (TYPESCRIPT ZIRHLI & ULTRA HIZLI 🚀)
  const fetchIlanDetay = async () => {
    if (!resolvedParams?.id) return;
    
    try {
      // Nokta atışı sorgu 🎯
      const res = await fetch(`/api/varliklar?id=${resolvedParams.id}`); 
      if (!res.ok) throw new Error("Sinyal zayıf");
      
      const data = await res.json();
      
      // Veriyi dizi formatına zorla (TypeScript koruması)
      const liste: any[] = Array.isArray(data) ? data : (data.data || data.ilanlar || []);
      
      // Hedef varlığı bul
      const seciliIlan = liste.find((i: any) => 
        String(i._id) === String(resolvedParams.id) || String(i.id) === String(resolvedParams.id)
      ) || (liste.length > 0 ? liste[0] : null);
      
      setIlan(seciliIlan);
      
      if (seciliIlan) {
        const saticiMail = seciliIlan.sellerEmail || seciliIlan.satici?.email || seciliIlan.userId || seciliIlan.satici;
        if (saticiMail) fetchSaticiYorumlari(saticiMail);
      }
    } catch (error) { 
      console.error("Siber veri çekilemedi:", error); 
    } finally {
      setLoading(false);
    }
  };

  // 📡 BENİM VARLIKLARIM (TYPESCRIPT ZIRHLI)
  const fetchBenimIlanlarim = async () => {
    const userEmail = session?.user?.email;
    if (!userEmail) return;

    try {
      const res = await fetch(`/api/varliklar`);
      if (res.ok) {
        const data = await res.json();
        const liste: any[] = Array.isArray(data) ? data : (data.data || data.ilanlar || []);
        
        const benimkiler = liste.filter((i: any) => {
           const sEmail = String(typeof i.userId === 'string' ? i.userId : i.satici?.email || i.satici || "").toLowerCase();
           return sEmail === userEmail.toLowerCase();
        });
        setBenimIlanlarim(benimkiler);
      }
    } catch (error) { 
      console.error("Varlıklar radardan kaçtı."); 
    }
  };
