import { PrismaClient, ProductType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

type SeedProduct = {
  slug: string;
  name: string;
  type: ProductType;
  brand: string;
  priceRetail: number;
  priceWholesale?: number;
  stock: number;
  description: string;
  images?: string[];
  specs: Record<string, string | number>;
  featured?: boolean;
};

const NUEVAS: SeedProduct[] = [
  { slug: "tec-force", name: "TEC-FORCE", type: "MOTO_NUEVA", brand: "TECNOVO", priceRetail: 4990000, priceWholesale: 4242000, stock: 8, description: "100% eléctrica. Scooter de 1000 W con batería de grafeno 60/72 V 25 Ah, farolas delanteras, suspensión delantera y freno de disco.", images: ["/motos/tec-force.jpg", "/motos/tec-force-foto.jpg"], specs: { motor: "1000 W full cobre", bateria: "Grafeno 60/72 V 25 Ah", velocidad_max: "60-70 km/h", autonomia: "60-75 km", carga_max: "250 kg", garantia: "5 años" }, featured: true },
  { slug: "tec-one", name: "TEC-ONE", type: "MOTO_NUEVA", brand: "TECNOVO", priceRetail: 1849900, priceWholesale: 1572000, stock: 12, description: "100% eléctrica. Compacta de 500 W con batería de grafeno 48 V 15 Ah, asiento doble con espaldar, suspensión trasera y delantera, manubrio con canasta.", images: ["/motos/tec-one.jpg", "/motos/tec-one-foto.jpg"], specs: { motor: "500 W full cobre", bateria: "Grafeno 48 V 15 Ah", velocidad_max: "40 km/h", autonomia: "40 km", carga_max: "180 kg", garantia: "5 años" } },
  { slug: "tec-pro", name: "TEC-PRO", type: "MOTO_NUEVA", brand: "TECNOVO", priceRetail: 1950000, priceWholesale: 1658000, stock: 12, description: "100% eléctrica. De 500 W con batería de grafeno 48 V 15 Ah, asiento doble con espaldar, farola y canasta.", images: ["/motos/tec-pro.jpg", "/motos/tec-pro-foto.jpg"], specs: { motor: "500 W full cobre", bateria: "Grafeno 48 V 15 Ah", velocidad_max: "40 km/h", autonomia: "40 km", carga_max: "200 kg", garantia: "5 años" } },
  { slug: "tec-cr4-pro", name: "TEC-CR4 PRO", type: "MOTO_NUEVA", brand: "TECNOVO", priceRetail: 4990000, priceWholesale: 4242000, stock: 8, description: "100% eléctrica. Scooter de 1000 W con batería de grafeno 60/72 V 25 Ah, farola delantera, freno de disco, asiento con parrilla y suspensión trasera.", images: ["/motos/tec-cr4-pro.jpg", "/motos/tec-cr4-pro-foto.jpg"], specs: { motor: "1000 W full cobre", bateria: "Grafeno 60/72 V 25 Ah", velocidad_max: "60-70 km/h", autonomia: "60-75 km", carga_max: "250 kg", garantia: "5 años" }, featured: true },
  { slug: "tec-cr5", name: "TEC-CR5", type: "MOTO_NUEVA", brand: "TECNOVO", priceRetail: 4990000, priceWholesale: 4242000, stock: 8, description: "100% eléctrica. Scooter de 1000 W con batería de grafeno 60/72 V 25 Ah, farolas delanteras, suspensión delantera, freno de disco, asiento y manubrio.", images: ["/motos/tec-cr5.jpg", "/motos/tec-cr5-foto.jpg"], specs: { motor: "1000 W full cobre", bateria: "Grafeno 60/72 V 25 Ah", velocidad_max: "60-70 km/h", autonomia: "60-75 km", carga_max: "250 kg", garantia: "5 años" }, featured: true },
];

const USADAS: SeedProduct[] = [
  { slug: "usada-city-s1-2023", name: "TECNOVO City S1 (2023)", type: "MOTO_USADA", brand: "TECNOVO", priceRetail: 3900000, stock: 1, description: "Único dueño, mantenimientos al día en taller autorizado.", specs: { anio: 2023, kilometraje_km: 8200, estado_1_10: 9, garantia: "3 meses de motor y batería" }, featured: true },
  { slug: "usada-volta-andina-2022", name: "Volta Andina 125 (2022)", type: "MOTO_USADA", brand: "Volta", priceRetail: 4900000, stock: 1, description: "Batería reemplazada en 2024 con factura. Lista para traspaso.", specs: { anio: 2022, kilometraje_km: 15400, estado_1_10: 8, garantia: "2 meses de motor" } },
  { slug: "usada-city-s2-2024", name: "TECNOVO City S2 (2024)", type: "MOTO_USADA", brand: "TECNOVO", priceRetail: 5600000, stock: 1, description: "Casi nueva, se vende por viaje. Incluye cargador original y alarma.", specs: { anio: 2024, kilometraje_km: 3100, estado_1_10: 9, garantia: "6 meses de motor y batería" }, featured: true },
  { slug: "usada-ekomoto-t1-2021", name: "EkoMoto Trabajo T1 (2021)", type: "MOTO_USADA", brand: "EkoMoto", priceRetail: 3200000, stock: 1, description: "De trabajo, detalles estéticos menores. Mecánica revisada.", specs: { anio: 2021, kilometraje_km: 24800, estado_1_10: 7, garantia: "1 mes de motor" } },
  { slug: "usada-mini-p1-2023", name: "TECNOVO Mini P1 (2023)", type: "MOTO_USADA", brand: "TECNOVO", priceRetail: 2950000, stock: 1, description: "Ideal primera moto eléctrica. Llantas nuevas.", specs: { anio: 2023, kilometraje_km: 6700, estado_1_10: 8, garantia: "2 meses de motor" } },
  { slug: "usada-urban-pro-2022", name: "TECNOVO Urban Pro (2022)", type: "MOTO_USADA", brand: "TECNOVO", priceRetail: 5900000, stock: 1, description: "Muy cuidada, guardada bajo techo. Historial de taller disponible.", specs: { anio: 2022, kilometraje_km: 12300, estado_1_10: 9, garantia: "3 meses de motor y batería" } },
  { slug: "usada-volta-sport-2023", name: "Volta Sport RS (2023)", type: "MOTO_USADA", brand: "Volta", priceRetail: 6900000, stock: 1, description: "Deportiva con poco uso, pastillas y banda nuevas.", specs: { anio: 2023, kilometraje_km: 5400, estado_1_10: 9, garantia: "3 meses de motor" } },
  { slug: "usada-familiar-f1-2021", name: "EkoMoto Familiar F1 (2021)", type: "MOTO_USADA", brand: "EkoMoto", priceRetail: 3800000, stock: 1, description: "Familiar en buen estado general, batería al 85% de salud.", specs: { anio: 2021, kilometraje_km: 18900, estado_1_10: 7, garantia: "1 mes de motor" } },
];

const REPUESTOS: SeedProduct[] = [
  { slug: "rep-bateria-72v-32ah", name: "Batería litio 72V 32Ah extraíble", type: "REPUESTO", brand: "TECNOVO", priceRetail: 1790000, stock: 10, description: "Batería original compatible con City S1 y Mini P1.", specs: { referencia: "BAT-72V32-EXT", compatibilidad: "City S1, Mini P1" } },
  { slug: "rep-bateria-60v-30ah", name: "Batería litio 60V 30Ah extraíble", type: "REPUESTO", brand: "EkoMoto", priceRetail: 1390000, stock: 12, description: "Batería original para línea familiar y minis.", specs: { referencia: "BAT-60V30-EXT", compatibilidad: "Familiar F1, Mini P1" } },
  { slug: "rep-cargador-72v", name: "Cargador rápido 72V 6A", type: "REPUESTO", brand: "TECNOVO", priceRetail: 289000, stock: 25, description: "Cargador original con protección contra sobrecarga.", specs: { referencia: "CHG-72V6A", compatibilidad: "Toda la línea 72V" } },
  { slug: "rep-cargador-60v", name: "Cargador 60V 5A", type: "REPUESTO", brand: "EkoMoto", priceRetail: 239000, stock: 25, description: "Cargador original para baterías de 60V.", specs: { referencia: "CHG-60V5A", compatibilidad: "Toda la línea 60V" } },
  { slug: "rep-llanta-del-350-10", name: "Llanta 3.50-10 delantera", type: "REPUESTO", brand: "Andina", priceRetail: 129000, stock: 40, description: "Llanta sellomatic para rin 10, uso urbano.", specs: { referencia: "LLA-35010-D", compatibilidad: "City S1, S2, Mini P1" } },
  { slug: "rep-llanta-tra-350-10", name: "Llanta 3.50-10 trasera", type: "REPUESTO", brand: "Andina", priceRetail: 139000, stock: 40, description: "Llanta trasera de compuesto reforzado.", specs: { referencia: "LLA-35010-T", compatibilidad: "City S1, S2, Urban Pro" } },
  { slug: "rep-pastillas-del", name: "Pastillas de freno delanteras (par)", type: "REPUESTO", brand: "Andina", priceRetail: 45000, stock: 80, description: "Pastillas semimetálicas para freno de disco.", specs: { referencia: "FRE-PAD-D", compatibilidad: "City S1, S2, Urban Pro, Sport RS" } },
  { slug: "rep-pastillas-tra", name: "Pastillas de freno traseras (par)", type: "REPUESTO", brand: "Andina", priceRetail: 45000, stock: 80, description: "Pastillas semimetálicas traseras.", specs: { referencia: "FRE-PAD-T", compatibilidad: "City S2, Urban Pro, Max Rider" } },
  { slug: "rep-banda-tra", name: "Banda de freno trasera", type: "REPUESTO", brand: "Andina", priceRetail: 55000, stock: 60, description: "Banda para freno de tambor trasero.", specs: { referencia: "FRE-BND-T", compatibilidad: "Mini P1, Familiar F1, Trabajo T1" } },
  { slug: "rep-controlador-2500w", name: "Controlador 72V 2500W", type: "REPUESTO", brand: "TECNOVO", priceRetail: 459000, stock: 15, description: "Controlador original programado para City S2 y Urban Pro.", specs: { referencia: "CTL-72V25", compatibilidad: "City S2, Urban Pro" } },
  { slug: "rep-controlador-1500w", name: "Controlador 60V 1500W", type: "REPUESTO", brand: "EkoMoto", priceRetail: 359000, stock: 15, description: "Controlador para minis y familiares.", specs: { referencia: "CTL-60V15", compatibilidad: "Mini P1, Familiar F1" } },
  { slug: "rep-espejo-izq", name: "Espejo retrovisor izquierdo", type: "REPUESTO", brand: "Andina", priceRetail: 35000, stock: 50, description: "Espejo universal rosca 10 mm.", specs: { referencia: "ESP-L", compatibilidad: "Universal" } },
  { slug: "rep-espejo-der", name: "Espejo retrovisor derecho", type: "REPUESTO", brand: "Andina", priceRetail: 35000, stock: 50, description: "Espejo universal rosca 10 mm.", specs: { referencia: "ESP-R", compatibilidad: "Universal" } },
  { slug: "rep-faro-led", name: "Faro delantero LED", type: "REPUESTO", brand: "TECNOVO", priceRetail: 189000, stock: 20, description: "Faro LED original con luz día integrada.", specs: { referencia: "LGT-FARO", compatibilidad: "City S1, S2, Urban Pro" } },
  { slug: "rep-stop-led", name: "Stop trasero LED", type: "REPUESTO", brand: "TECNOVO", priceRetail: 99000, stock: 20, description: "Stop LED original.", specs: { referencia: "LGT-STOP", compatibilidad: "City S1, S2, Mini P1" } },
  { slug: "rep-amortiguador-tra", name: "Amortiguador trasero (par)", type: "REPUESTO", brand: "Andina", priceRetail: 219000, stock: 18, description: "Par de amortiguadores regulables.", specs: { referencia: "SUS-TRA", compatibilidad: "Urban Pro, Max Rider, Cacique 200" } },
  { slug: "rep-guaya-acelerador", name: "Guaya de acelerador", type: "REPUESTO", brand: "Andina", priceRetail: 25000, stock: 60, description: "Guaya universal con funda.", specs: { referencia: "GYA-ACE", compatibilidad: "Universal" } },
  { slug: "rep-tablero-digital", name: "Tablero digital LCD", type: "REPUESTO", brand: "TECNOVO", priceRetail: 329000, stock: 12, description: "Tablero original con indicador de batería y velocidad.", specs: { referencia: "TAB-LCD", compatibilidad: "City S2, Urban Pro, Max Rider" } },
  { slug: "rep-alarma", name: "Alarma antirrobo con control", type: "REPUESTO", brand: "TECNOVO", priceRetail: 159000, stock: 30, description: "Alarma con bloqueo de motor y dos controles.", specs: { referencia: "ALM-01", compatibilidad: "Universal 60V/72V" } },
  { slug: "rep-kit-arrastre-electrico", name: "Kit de transmisión (correa + poleas)", type: "REPUESTO", brand: "Volta", priceRetail: 279000, stock: 14, description: "Kit de transmisión para línea Sport y Cacique.", specs: { referencia: "TRN-CORREA", compatibilidad: "Sport RS, Cacique 200" } },
];

const ACCESORIOS: SeedProduct[] = [
  { slug: "acc-casco-abatible-negro", name: "Casco abatible negro mate", type: "ACCESORIO", brand: "Andina", priceRetail: 329000, stock: 30, description: "Casco abatible certificado, tallas S a XL.", specs: { referencia: "CSC-AB-NEG", compatibilidad: "Universal" }, featured: true },
  { slug: "acc-casco-integral-gris", name: "Casco integral gris", type: "ACCESORIO", brand: "Andina", priceRetail: 389000, stock: 25, description: "Casco integral con visor antiempañante.", specs: { referencia: "CSC-IN-GRIS", compatibilidad: "Universal" } },
  { slug: "acc-guantes-urbanos", name: "Guantes urbanos reforzados", type: "ACCESORIO", brand: "Andina", priceRetail: 89000, stock: 50, description: "Guantes con protección de nudillos, tallas M a XL.", specs: { referencia: "GNT-URB", compatibilidad: "Universal" } },
  { slug: "acc-maletero-45l", name: "Maletero rígido 45 L", type: "ACCESORIO", brand: "EkoMoto", priceRetail: 259000, stock: 20, description: "Maletero con base universal y respaldo acolchado.", specs: { referencia: "MAL-45L", compatibilidad: "Universal con parrilla" } },
  { slug: "acc-parrilla-reforzada", name: "Parrilla trasera reforzada", type: "ACCESORIO", brand: "EkoMoto", priceRetail: 149000, stock: 22, description: "Parrilla de acero para maletero o carga.", specs: { referencia: "PAR-REF", compatibilidad: "City S1, S2, Trabajo T1" } },
  { slug: "acc-funda-impermeable", name: "Funda impermeable talla L", type: "ACCESORIO", brand: "Andina", priceRetail: 65000, stock: 60, description: "Funda con forro interno suave y guaya de seguridad.", specs: { referencia: "FND-L", compatibilidad: "Scooters medianos" } },
  { slug: "acc-candado-disco", name: "Candado de disco con alarma", type: "ACCESORIO", brand: "TECNOVO", priceRetail: 119000, stock: 40, description: "Candado con sensor de movimiento de 110 dB.", specs: { referencia: "CND-DISCO", compatibilidad: "Universal" } },
  { slug: "acc-soporte-celular", name: "Soporte de celular con cargador USB", type: "ACCESORIO", brand: "TECNOVO", priceRetail: 79000, stock: 45, description: "Soporte metálico con puerto USB para el manubrio.", specs: { referencia: "SPT-USB", compatibilidad: "Universal" } },
  { slug: "acc-chaleco-reflectivo", name: "Chaleco reflectivo", type: "ACCESORIO", brand: "Andina", priceRetail: 35000, stock: 80, description: "Chaleco de alta visibilidad, talla única.", specs: { referencia: "CHL-REF", compatibilidad: "Universal" } },
  { slug: "acc-exploradoras-led", name: "Exploradoras LED (par)", type: "ACCESORIO", brand: "TECNOVO", priceRetail: 149000, stock: 28, description: "Par de exploradoras con interruptor y cableado.", specs: { referencia: "EXP-LED", compatibilidad: "Universal 12V-72V" } },
];

async function main() {
  // Reemplazo de catálogo: borra las motos nuevas anteriores sin pedidos.
  const removed = await prisma.product.deleteMany({
    where: { type: "MOTO_NUEVA", orderItems: { none: {} } },
  });
  console.log(`Nuevas anteriores eliminadas: ${removed.count}`);

  const all: SeedProduct[] = [...NUEVAS, ...USADAS, ...REPUESTOS, ...ACCESORIOS];
  console.log(`Seed: ${NUEVAS.length} nuevas, ${USADAS.length} usadas, ${REPUESTOS.length} repuestos, ${ACCESORIOS.length} accesorios.`);

  for (const p of all) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name, type: p.type, brand: p.brand, priceRetail: p.priceRetail,
        priceWholesale: p.priceWholesale ?? null, stock: p.stock, description: p.description,
        images: p.images ?? [], specs: p.specs, featured: p.featured ?? false, active: true,
      },
      create: {
        slug: p.slug, name: p.name, type: p.type, brand: p.brand, priceRetail: p.priceRetail,
        priceWholesale: p.priceWholesale ?? null, stock: p.stock, description: p.description,
        images: p.images ?? [], specs: p.specs, featured: p.featured ?? false, active: true,
      },
    });
  }

  const counts = await prisma.product.groupBy({ by: ["type"], _count: true });
  console.log("Conteos en BD:", JSON.stringify(counts));

  // Jefe inicial: ADMIN_EMAIL + ADMIN_PASSWORD (solo si vienen en el entorno).
  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (adminEmail && adminPassword) {
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    await prisma.user.upsert({
      where: { email: adminEmail },
      update: { role: "SUPERADMIN", passwordHash },
      create: { name: "Jefe TECNOVO", email: adminEmail, role: "SUPERADMIN", passwordHash },
    });
    console.log(`Superadmin listo: ${adminEmail}`);
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());

