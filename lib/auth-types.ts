export interface User {
  id: string
  name: string
  email: string
  buildingId: string
  buildingName: string
  accessToken: string
}

export interface Session {
  user: User | null
  isAuthenticated: boolean
}
