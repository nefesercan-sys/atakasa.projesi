async function getProducts() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/products`, {
    cache: "no-store"
  })
  return res.json()
}

export default async function ProductsPage() {
  const products = await getProducts()

  return (
    <div style={{ padding: 40 }}>
      <h2>Ürünler</h2>
      {products.map((p: any) => (
        <div key={p._id}>
          <h3>{p.title}</h3>
          <p>{p.description}</p>
        </div>
      ))}
    </div>
  )
}
