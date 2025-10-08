"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart } from "lucide-react"
import { useCart } from "@/hooks/useCart"

export function CartButton() {
  const { totalItems, isLoading } = useCart()

  if (isLoading) {
    return (
      <Button variant="ghost" size="sm" disabled>
        <ShoppingCart className="h-4 w-4" />
      </Button>
    )
  }

  return (
    <Button variant="ghost" size="sm" asChild>
      <Link href="/cart" className="relative">
        <ShoppingCart className="h-4 w-4" />
        {totalItems > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
          >
            {totalItems > 99 ? '99+' : totalItems}
          </Badge>
        )}
      </Link>
    </Button>
  )
}