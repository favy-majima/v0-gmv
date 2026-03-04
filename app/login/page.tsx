"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Suspense } from "react"

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const error = searchParams.get("error")
  
  const [shopId, setShopId] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)

  const errorMessages: Record<string, string> = {
    missing_params: "認証パラメータが不足しています",
    invalid_state: "セッションが無効です。もう一度お試しください",
    auth_failed: "認証に失敗しました。もう一度お試しください",
    access_denied: "アクセスが拒否されました",
    invalid_credentials: "店舗IDまたはパスワードが正しくありません",
    shop_not_found: "指定された店舗が見つかりません",
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setLoginError(null)

    try {
      const response = await fetch("/api/auth/shop-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ shopId, password }),
      })

      const data = await response.json()

      if (response.ok) {
        router.push("/")
        router.refresh()
      } else {
        setLoginError(data.error || "ログインに失敗しました")
      }
    } catch {
      setLoginError("ネットワークエラーが発生しました")
    } finally {
      setIsLoading(false)
    }
  }

  const displayError = loginError || (error ? errorMessages[error] : null)

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-sm bg-card border-border">
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold italic text-primary mb-1">
              favy
            </h1>
            <p className="text-[13px] text-muted-foreground">店舗用 モバイルオーダー売上管理</p>
          </div>

          {displayError && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded text-destructive text-[13px]">
              {displayError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="shopId" className="text-[13px]">店舗ID</Label>
              <Input
                id="shopId"
                type="text"
                value={shopId}
                onChange={(e) => setShopId(e.target.value)}
                placeholder="例: S001"
                required
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-[13px]">パスワード</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="パスワードを入力"
                required
                className="h-10"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-10 text-[13px] bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isLoading ? "ログイン中..." : "ログイン"}
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

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-secondary flex items-center justify-center">
          <div className="text-muted-foreground">読み込み中...</div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  )
}
