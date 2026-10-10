import { ProductForm } from "@/components/admin/product-form";

export default function NuevoProductoPage() {
  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">Nuevo producto</h1>
      <div className="mt-6">
        <ProductForm />
      </div>
    </div>
  );
}
