import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3"
import bcrypt from "bcryptjs"
import path from "path"

const dbPath = path.resolve(__dirname, "..", "dev.db")
const adapter = new PrismaBetterSqlite3({ url: dbPath })
const prisma = new PrismaClient({ adapter })

const DEMO_SHOPS = [
  {
    name: "Taquería El Güero",
    description: "Los mejores tacos de guisado de la colonia. Abiertos desde las 7am con desayunos incluidos. ¡Prueba nuestros chilaquiles!",
    category: "food",
    address: "Calle Madero 45",
    city: "Ciudad de México",
    country: "México",
    lat: 19.4326,
    lng: -99.1332,
  },
  {
    name: "Papelería Rosario",
    description: "Todo para la escuela y la oficina. Copias, impresiones, encuadernación y materiales de arte. 30 años en el negocio.",
    category: "books",
    address: "Av. Insurgentes Sur 234",
    city: "Ciudad de México",
    country: "México",
    lat: 19.4250,
    lng: -99.1700,
  },
  {
    name: "Tienda Doña Carmen",
    description: "Abarrotes, refrescos, botanas y todo lo que necesitas para el día a día. Entrega a domicilio en la colonia.",
    category: "grocery",
    address: "Calle Hidalgo 12",
    city: "Guadalajara",
    country: "México",
    lat: 20.6597,
    lng: -103.3496,
  },
  {
    name: "Boutique Luna",
    description: "Ropa de moda local y accesorios únicos hechos por diseñadores mexicanos. Cada temporada renueva colección.",
    category: "clothing",
    address: "Paseo de Montejo 89",
    city: "Mérida",
    country: "México",
    lat: 20.9674,
    lng: -89.6237,
  },
  {
    name: "La Librería de Juan",
    description: "Libros de segunda mano, comics, revistas y raridades. Más de 15,000 títulos disponibles. Compramos y vendemos.",
    category: "books",
    address: "Calle Obispo 67",
    city: "La Habana",
    country: "Cuba",
    lat: 23.1352,
    lng: -82.3595,
  },
  {
    name: "Artesanías Andinas",
    description: "Tejidos, cerámica y artesanías hechas a mano por comunidades indígenas. Cada pieza es única y cuenta una historia.",
    category: "crafts",
    address: "Plaza de Armas 3",
    city: "Cusco",
    country: "Perú",
    lat: -13.5163,
    lng: -71.9786,
  },
  {
    name: "Frutería El Paraíso",
    description: "Frutas y verduras frescas traídas directo del campo cada mañana. Jugos naturales, ensaladas y más.",
    category: "grocery",
    address: "Mercado Central, Local 45",
    city: "Medellín",
    country: "Colombia",
    lat: 6.2442,
    lng: -75.5812,
  },
  {
    name: "Pet Shop Bimbo",
    description: "Todo para tu mascota: alimentos, accesorios, baño y estética. Servicio veterinario los sábados.",
    category: "pets",
    address: "Av. Corrientes 1234",
    city: "Buenos Aires",
    country: "Argentina",
    lat: -34.6037,
    lng: -58.3816,
  },
]

async function main() {
  console.log("🌱 Seeding database...")

  const password = await bcrypt.hash("demo1234", 10)
  const owner = await prisma.user.upsert({
    where: { email: "demo@thelittleshop.app" },
    update: {},
    create: {
      name: "Demo Owner",
      email: "demo@thelittleshop.app",
      password,
    },
  })

  for (const shop of DEMO_SHOPS) {
    await prisma.shop.create({
      data: {
        ...shop,
        images: "[]",
        ownerId: owner.id,
        isPaid: true,
        avgRating: Math.round((3.5 + Math.random() * 1.5) * 10) / 10,
        reviewCount: Math.floor(Math.random() * 20) + 1,
      },
    })
  }

  console.log(`✅ Created ${DEMO_SHOPS.length} demo shops`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
