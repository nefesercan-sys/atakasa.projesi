const handleYayinla = async () => {
  setLoading(true);
  const formData = new FormData();
  
  // Örnek olarak ilk seçilen dosyayı alıyoruz
  const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
  if (fileInput?.files?.[0]) {
    formData.append('file', fileInput.files[0]);
  }

  formData.append('productData', JSON.stringify(form));

  const response = await fetch('/api/ilanlar', {
    method: 'POST',
    body: formData,
  });

  const result = await response.json();
  if (result.success) {
    alert("İlanınız başarıyla yayına alındı!");
    // Ana sayfaya yönlendir
  }
  setLoading(false);
};
