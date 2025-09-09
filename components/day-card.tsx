"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Bed, Clock, Eye, Download, ImageIcon } from "lucide-react"
import { CATEGORY_ICONS, CATEGORY_COLORS, CURRENCY_SYMBOLS } from "@/types/itinerary"
import type { DayItinerary } from "@/types/itinerary"
import Image from "next/image"

interface DayCardProps {
  day: DayItinerary
  exchangeRate: number
  totalBudget?: number
  budgetCurrency?: "JPY" | "KRW"
  onViewDetails: () => void
  onExportPNG: () => void
}

export function DayCard({
  day,
  exchangeRate,
  totalBudget,
  budgetCurrency = "JPY",
  onViewDetails,
  onExportPNG,
}: DayCardProps) {
  const calculateDailyTotals = () => {
    let totalJPY = 0
    let totalKRW = 0

    day.items.forEach((item) => {
      const amount = (item as any)?.cost?.amount ?? (item as any)?.cost?.value ?? 0
      if (item.cost.currency === "JPY") {
        totalJPY += amount
        totalKRW += amount * exchangeRate
      } else {
        totalKRW += amount
        totalJPY += amount / exchangeRate
      }
    })

    return { totalJPY, totalKRW }
  }

  const { totalJPY, totalKRW } = calculateDailyTotals()
  const perPersonJPY = totalJPY / Math.max(1, 1) // Will be updated with actual participant count
  const perPersonKRW = totalKRW / Math.max(1, 1)

  const budgetProgress = totalBudget
    ? budgetCurrency === "JPY"
      ? (totalJPY / totalBudget) * 100
      : (totalKRW / totalBudget) * 100
    : 0

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const month = date.getMonth() + 1
    const day = date.getDate()
    const dayOfWeek = date.toLocaleDateString("ko-KR", { weekday: "short" })
    return { month, day, dayOfWeek }
  }

  const { month, day: dayNum, dayOfWeek } = formatDate(day.date)

  const getCategoryPreview = () => {
    const categories = day.items.reduce(
      (acc, item) => {
        acc[item.category as unknown as string] = (acc[item.category as unknown as string] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    return Object.entries(categories)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 4)
      .map(([category]) => category)
  }

  const categoryPreview = getCategoryPreview()

  return (
    <Card className="card-hover touch-target overflow-hidden cursor-pointer" onClick={onViewDetails}>
      <CardContent className="p-0">
        <div className="p-4 pb-0">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-center bg-primary rounded-lg px-3 py-2 min-w-[60px]">
                <span className="text-xs text-primary-foreground font-medium">{month}월</span>
                <span className="text-lg font-bold text-primary-foreground">{dayNum}</span>
                <span className="text-xs text-primary-foreground">{dayOfWeek}</span>
              </div>
              <div className="flex-1">
                <h3 className="text-h3 font-semibold text-foreground mb-1">{(day as any).city || day.title || "일정"}</h3>
                {(((day as any).accommodation) || day.lodging) && (
                  <div className="flex items-center gap-1 text-caption">
                    <Bed className="h-3 w-3" />
                    <span>{(day as any).accommodation || day.lodging}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="aspect-video relative bg-muted">
          {day.coverImage ? (
            <Image
              src={day.coverImage || "/placeholder.svg"}
              alt={`${(day as any).city || day.title} 썸네일`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          ) : (
            <div className="h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
              <div className="text-center">
                <ImageIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-caption text-muted-foreground">이미지 없음</p>
              </div>
            </div>
          )}
        </div>

        <div className="p-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">타임라인 미리보기</span>
            </div>

            <div className="flex flex-wrap gap-1">
              {categoryPreview.map((category) => (
                <Badge key={category} variant="secondary" className={`text-xs ${CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS]}`}>
                  {CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS]} {category}
                </Badge>
              ))}
              {day.items.length > 4 && (
                <Badge variant="outline" className="text-xs">
                  +{day.items.length - 4}개 더
                </Badge>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">일일 합계</span>
                <div className="text-right">
                  <div className="font-semibold">
                    {CURRENCY_SYMBOLS.JPY}
                    {totalJPY.toLocaleString("ko-KR")}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {CURRENCY_SYMBOLS.KRW}
                    {totalKRW.toLocaleString("ko-KR")}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>1인당</span>
                <span>
                  {CURRENCY_SYMBOLS.JPY}
                  {perPersonJPY.toLocaleString("ko-KR")} / {CURRENCY_SYMBOLS.KRW}
                  {perPersonKRW.toLocaleString("ko-KR")}
                </span>
              </div>

              {totalBudget && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">예산 대비</span>
                    <span
                      className={
                        budgetProgress > 100 ? "text-danger" : budgetProgress > 80 ? "text-warning" : "text-positive"
                      }
                    >
                      {budgetProgress.toFixed(1)}%
                    </span>
                  </div>
                  <Progress
                    value={Math.min(budgetProgress, 100)}
                    className="h-1"
                    // @ts-ignore
                    style={{
                      "--progress-background":
                        budgetProgress > 100
                          ? "hsl(var(--danger))"
                          : budgetProgress > 80
                            ? "hsl(var(--warning))"
                            : "hsl(var(--positive))",
                    }}
                  />
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="default"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onViewDetails()
                }}
                className="flex-1 touch-target"
              >
                <Eye className="h-4 w-4 mr-2" />
                상세 보기
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onExportPNG()
                }}
                className="touch-target bg-transparent"
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
