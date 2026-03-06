export interface User {
  id: string
  name: string
  email: string
  buildingId: string
  buildingName: string
  accessToken: string
}

export interface ShopUser {
  shopId: string
  shopName: string
  buildingId: string
  buildingName: string
  userType: "shop"
}

export interface Session {
  user: User | null
  isAuthenticated: boolean
}

export interface ShopSession {
  user: ShopUser | null
  isAuthenticated: boolean
}
