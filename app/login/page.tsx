"use client"

import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Suspense } from "react"

function LoginContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")

  const errorMessages: Record<string, string> = {
    missing_params: "認証パラメータが不足しています",
    invalid_state: "セッションが無効です。もう一度お試しください",
    auth_failed: "認証に失敗しました。もう一度お試しください",
    access_denied: "アクセスが拒否されました",
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-sm bg-card border-border">
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold italic text-primary mb-1">
              favy
            </h1>
            <p className="text-[13px] text-muted-foreground">モバイルオーダー売上管理</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded text-destructive text-[13px]">
              {errorMessages[error] || "エラーが発生しました"}
            </div>
          )}

          <Button
            asChild
            className="w-full h-10 text-[13px] bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <a href="/api/auth/login">favy アカウントでログイン</a>
          </Button>

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
