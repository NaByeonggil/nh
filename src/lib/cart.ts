// 클라이언트 사이드 장바구니 관리
// localStorage를 사용하여 장바구니 데이터 저장

export interface CartItem {
  productId: string
  name: string
  price: number
  discountPrice?: number
  quantity: number
  image?: string
  inStock: boolean
}

const CART_KEY = 'neighbor-pharmacist-cart'

export const cartUtils = {
  // 장바구니 전체 조회
  getCart: (): CartItem[] => {
    if (typeof window === 'undefined') return []
    
    try {
      const cartData = localStorage.getItem(CART_KEY)
      return cartData ? JSON.parse(cartData) : []
    } catch (error) {
      console.error('Error reading cart from localStorage:', error)
      return []
    }
  },

  // 장바구니 저장
  saveCart: (cart: CartItem[]): void => {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart))
    } catch (error) {
      console.error('Error saving cart to localStorage:', error)
    }
  },

  // 상품 추가/수량 업데이트
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }): CartItem[] => {
    const cart = cartUtils.getCart()
    const existingItemIndex = cart.findIndex(cartItem => cartItem.productId === item.productId)
    
    if (existingItemIndex > -1) {
      // 기존 상품이 있으면 수량 증가
      cart[existingItemIndex].quantity += item.quantity || 1
    } else {
      // 새 상품 추가
      cart.push({
        ...item,
        quantity: item.quantity || 1,
      })
    }
    
    cartUtils.saveCart(cart)
    return cart
  },

  // 상품 수량 변경
  updateQuantity: (productId: string, quantity: number): CartItem[] => {
    const cart = cartUtils.getCart()
    const itemIndex = cart.findIndex(item => item.productId === productId)
    
    if (itemIndex > -1) {
      if (quantity <= 0) {
        // 수량이 0 이하면 상품 제거
        cart.splice(itemIndex, 1)
      } else {
        cart[itemIndex].quantity = quantity
      }
    }
    
    cartUtils.saveCart(cart)
    return cart
  },

  // 상품 제거
  removeItem: (productId: string): CartItem[] => {
    const cart = cartUtils.getCart().filter(item => item.productId !== productId)
    cartUtils.saveCart(cart)
    return cart
  },

  // 장바구니 비우기
  clearCart: (): void => {
    cartUtils.saveCart([])
  },

  // 장바구니 총 개수
  getTotalItems: (): number => {
    return cartUtils.getCart().reduce((total, item) => total + item.quantity, 0)
  },

  // 장바구니 총 금액
  getTotalPrice: (): number => {
    return cartUtils.getCart().reduce((total, item) => {
      const price = item.discountPrice || item.price
      return total + (price * item.quantity)
    }, 0)
  },

  // 특정 상품이 장바구니에 있는지 확인
  isInCart: (productId: string): boolean => {
    return cartUtils.getCart().some(item => item.productId === productId)
  },

  // 특정 상품의 장바구니 수량 조회
  getItemQuantity: (productId: string): number => {
    const item = cartUtils.getCart().find(item => item.productId === productId)
    return item ? item.quantity : 0
  },
}