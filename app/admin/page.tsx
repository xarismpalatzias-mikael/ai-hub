import React from "react"
import { prisma } from "@/lib/prisma"

interface Product {
  id: string
  title: string
  price: number | null
  status?: string | null
  updatedAt: Date
}

function formatPrice(value: string | number | null) {
  if (value === null || value === undefined) return "-"
  const num = typeof value === "string" ? parseFloat(value) : value
  if (isNaN(num)) return "-"
  return "£" + num.toFixed(2)
}

const td: React.CSSProperties = {
  padding: "6px 12px",
  borderBottom: "1px solid #ddd",
  textAlign: "left",
}

const tdMono: React.CSSProperties = {
  ...td,
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  whiteSpace: "nowrap",
  maxWidth: 260,
  overflow: "hidden",
  textOverflow: "ellipsis",
}

export default async function ProductsPage() {
  const products: Product[] = await prisma.product.findMany({
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      price: true,
      status: true,
      updatedAt: true,
    },
  })

  return (
    <main style={{ padding: 24 }}>
      <h1 style={{ marginBottom: 8 }}>Products</h1>
      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th style={td}>ID</th>
            <th style={td}>Title</th>
            <th style={td}>Price</th>
            <th style={td}>Status</th>
            <th style={td}>Updated</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td style={tdMono}>{p.id}</td>
              <td style={td}>{p.title ?? "-"}</td>
              <td style={td}>{formatPrice(p.price)}</td>
              <td style={td}>{p.status ?? "-"}</td>
              <td style={td}>
                {new Date(p.updatedAt).toLocaleString("en-GB", {
                  year: "numeric",
                  month: "short",
                  day: "2-digit",
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  )
}
