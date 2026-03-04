"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Suspense } from "react"
import { Loader2, Store } from "lucide-react"

function ShopLoginContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const error = searchParams.get("error")
  
  const [shopId, setShopId] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)

  const errorMessages: Record<string, string> = {
    invalid_credentials: "店舗IDまたはパスワードが正しくありません",
    missing_params: "店舗IDとパスワードを入力してください",
    session_expired: "セッションが切れました。再度ログインしてください",
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError(null)
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/shop-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ shopId, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setLoginError(data.error || "ログインに失敗しました")
        return
      }

      router.push(`/shop-dashboard`)
    } catch {
      setLoginError("ネットワークエラーが発生しました")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-sm bg-card border-border">
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Store className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">
                店舗ログイン
              </h1>
            </div>
            <p className="text-[13px] text-muted-foreground">モバイルオーダー売上管理</p>
          </div>

          {(error || loginError) && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded text-destructive text-[13px]">
              {loginError || errorMessages[error!] || "エラーが発生しました"}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="shopId" className="text-[13px] text-foreground">
                店舗ID
              </Label>
              <Input
                id="shopId"
                type="text"
                value={shopId}
                onChange={(e) => setShopId(e.target.value)}
                placeholder="例: S001"
                className="h-10 text-[13px] bg-input border-border"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-[13px] text-foreground">
                パスワード
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="パスワードを入力"
                className="h-10 text-[13px] bg-input border-border"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-10 text-[13px] bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ログイン中...
                </>
              ) : (
                "ログイン"
              )}
            </Button>
          </form>

          <p className="mt-4 text-[11px] text-center text-muted-foreground">
            ログインすることで、利用規約とプライバシーポリシーに同意したものとみなされます。
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default function ShopLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-muted-foreground">読み込み中...</div>
        </div>
      }
    >
      <ShopLoginContent />
    </Suspense>
  )
}
