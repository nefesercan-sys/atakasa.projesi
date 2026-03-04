async function getTrades() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/trades`, {
    cache: "no-store"
  })
  return res.json()
}

export default async function TradesPage() {
  const trades = await getTrades()

  return (
    <div style={{ padding: 40 }}>
      <h2>Takaslar</h2>
      {trades.map((t: any) => (
        <div key={t._id}>
          <p>Status: {t.status}</p>
        </div>
      ))}
    </div>
  )
}
