import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus } from "lucide-react"
import Image from "next/image"

// Static sample products
const sampleProducts = [
  {
    id: 1,
    name: "Chocolate Protein Bar",
    description: "Delicious chocolate protein bar with 20g of protein.",
    price: 25,
    category: "protein_bars",
    imageUrl: "/protein-bar.png",
  },
  {
    id: 2,
    name: "Berry Protein Bar",
    description: "Berry flavored protein bar with 18g of protein.",
    price: 25,
    category: "protein_bars",
    imageUrl: "/berry-protein-bar.png",
  },
  {
    id: 3,
    name: "Honey Almond Granola",
    description: "Crunchy granola with honey and almonds.",
    price: 45,
    category: "granola",
    imageUrl: "/honey-almond-granola.png",
  },
]

export default function StaticExpressShop() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-4xl font-bold">Express Shop</h1>
        <p className="mx-auto max-w-2xl text-gray-600">
          Browse our selection of healthy snacks, protein bars, and more for quick delivery.
        </p>
        <div className="mt-4">
          <Link href="/express-shop">
            <Button variant="outline">View Dynamic Shop</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {sampleProducts.map((product) => (
          <Card key={product.id} className="overflow-hidden">
            <div className="relative h-48 w-full overflow-hidden bg-gray-100">
              <Image src={product.imageUrl || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
            </div>
            <CardHeader className="p-4 pb-0">
              <CardTitle className="line-clamp-1 text-lg">{product.name}</CardTitle>
              <CardDescription className="line-clamp-2">{product.description}</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold">{product.price} MAD</span>
                <Badge variant="outline" className="text-xs">
                  {product.category.replace("_", " ")}
                </Badge>
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-0">
              <Button className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Add to Cart
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
