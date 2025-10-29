import { prisma } from "@/lib/prisma";
import UploadCSV from "./UploadCSV";

export default async function ProductsPage() {
  const products = await prisma.product.findMany();

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Products</h1>

      {/* CSV Upload button */}
      <UploadCSV />

      <table border={1} cellPadding={8} style={{ marginTop: "1rem" }}>
        <thead>
          <tr>
            <th>Title</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td>{p.title}</td>
              <td>{p.price}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
