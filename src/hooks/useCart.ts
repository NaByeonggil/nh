"use client"

import { useState, useEffect } from 'react'
import { cartUtils, CART_UPDATED_EVENT, type CartItem } from '@/lib/cart'

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // 컴포넌트 마운트 시 장바구니 로드 + 이후 변경 구독
  useEffect(() => {
    setCart(cartUtils.getCart())
    setIsLoading(false)

    // 같은 탭의 다른 인스턴스(헤더 배지 등)와 다른 탭 양쪽 모두 따라가게 한다.
    const sync = () => setCart(cartUtils.getCart())
    window.addEventListener(CART_UPDATED_EVENT, sync)
    window.addEventListener('storage', sync)

    return () => {
      window.removeEventListener(CART_UPDATED_EVENT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  // 상품 추가
  const addItem = (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
    const updatedCart = cartUtils.addItem(item)
    setCart(updatedCart)
    return updatedCart
  }

  // 수량 업데이트
  const updateQuantity = (productId: string, quantity: number) => {
    const updatedCart = cartUtils.updateQuantity(productId, quantity)
    setCart(updatedCart)
    return updatedCart
  }

  // 상품 제거
  const removeItem = (productId: string) => {
    const updatedCart = cartUtils.removeItem(productId)
    setCart(updatedCart)
    return updatedCart
  }

  // 장바구니 비우기
  const clearCart = () => {
    cartUtils.clearCart()
    setCart([])
  }

  // 계산된 값들
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0)
  const totalPrice = cart.reduce((total, item) => {
    const price = item.discountPrice || item.price
    return total + (price * item.quantity)
  }, 0)

  const isInCart = (productId: string) => {
    return cart.some(item => item.productId === productId)
  }

  const getItemQuantity = (productId: string) => {
    const item = cart.find(item => item.productId === productId)
    return item ? item.quantity : 0
  }

  return {
    cart,
    isLoading,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    totalItems,
    totalPrice,
    isInCart,
    getItemQuantity,
  }
}