// app/admin/products/page.tsx
import { prisma } from "@/lib/prisma"; // if this errors, try: import prisma from "@/lib/prisma";

export default async function ProductsPage() {
  // Fetch products from DB
  const products = await prisma.product.findMany({
    orderBy: { updatedAt: "desc" },
    select: { id: true, title: true, price: true }, // add more fields if you need
  });

  return (
    <div>
      <h1 style={{ margin: "12px 0" }}>Products</h1>
      <table width="100%" cellPadding={8} style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid #f1f1f1" }}>
            <th align="left">ID</th>
            <th align="left">Title</th>
            <th align="left">Price</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p: any) => (
            <tr key={p.id} style={{ borderBottom: "1px solid #f1f1f1" }}>
              <td>{p.id}</td>
              <td>{p.title}</td>
              <td>{p.price}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
