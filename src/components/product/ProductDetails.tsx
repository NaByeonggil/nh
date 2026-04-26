import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { type Product } from "@/lib/product-data"

interface ProductDetailsProps {
  product: Product
}

export function ProductDetails({ product }: ProductDetailsProps) {
  return (
    <Tabs defaultValue="description" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="description">Description</TabsTrigger>
        <TabsTrigger value="specifications">Specifications</TabsTrigger>
        <TabsTrigger value="shipping">Shipping</TabsTrigger>
      </TabsList>

      <TabsContent value="description" className="space-y-4 pt-6">
        <div className="prose max-w-none">
          <p className="text-muted-foreground leading-relaxed">
            {product.description}
          </p>
          <h3 className="mt-6 text-lg font-semibold">Features</h3>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>Premium build quality with attention to detail</li>
            <li>Advanced technology for superior performance</li>
            <li>Comfortable design for extended use</li>
            <li>Long-lasting battery life</li>
            <li>Easy connectivity and setup</li>
          </ul>
        </div>
      </TabsContent>

      <TabsContent value="specifications" className="pt-6">
        <div className="grid gap-4">
          {Object.entries(product.specifications).map(([key, value]) => (
            <div
              key={key}
              className="grid grid-cols-2 gap-4 border-b pb-3 last:border-0"
            >
              <span className="font-medium">{key}</span>
              <span className="text-muted-foreground">{value}</span>
            </div>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="shipping" className="space-y-4 pt-6">
        <div className="prose max-w-none">
          <h3 className="text-lg font-semibold">Shipping Information</h3>
          <p className="text-muted-foreground">{product.shippingInfo}</p>

          <h3 className="mt-6 text-lg font-semibold">Returns & Exchanges</h3>
          <p className="text-muted-foreground">
            We offer a 30-day return policy for all products. Items must be unused
            and in original packaging. Return shipping is free for defective items.
          </p>

          <h3 className="mt-6 text-lg font-semibold">Warranty</h3>
          <p className="text-muted-foreground">
            All products come with a {product.specifications.Warranty || "1 year"}{" "}
            manufacturer warranty covering defects in materials and workmanship.
          </p>
        </div>
      </TabsContent>
    </Tabs>
  )
}
