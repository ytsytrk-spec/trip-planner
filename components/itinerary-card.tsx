"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Bed, Clock } from "lucide-react"
import type { Itinerary } from "@/types/itinerary"

interface ItineraryCardProps {
  itinerary: Itinerary
  onClick: () => void
}

export function ItineraryCard({ itinerary, onClick }: ItineraryCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("ko-KR", {
      month: "long",
      day: "numeric",
    })
  }

  return (
    <Card
      className="cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onClick()
        }
      }}
      aria-label={`${itinerary.title} 일정 상세보기`}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Date and Day */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">{formatDate(itinerary.date)}</span>
              <Badge variant="secondary" className="text-xs">
                {itinerary.dayOfWeek}
              </Badge>
            </div>
            <div className="text-sm font-semibold text-primary">{formatCurrency(itinerary.budget.total)}</div>
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold text-foreground leading-tight">{itinerary.title}</h3>

          {/* Accommodation */}
          {itinerary.accommodation && itinerary.accommodation !== "없음 (출발일)" && (
            <div className="flex items-center space-x-2">
              <Bed className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{itinerary.accommodation}</span>
            </div>
          )}

          {/* Highlights */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">주요 일정</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {itinerary.highlights.slice(0, 3).map((highlight, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {highlight}
                </Badge>
              ))}
              {itinerary.highlights.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{itinerary.highlights.length - 3}개 더
                </Badge>
              )}
            </div>
          </div>

          {/* Timeline Preview */}
          <div className="pt-2 border-t border-border">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {itinerary.timeline[0]?.time} {itinerary.timeline[0]?.activity}
              </span>
              <span>→</span>
              <span>
                {itinerary.timeline[itinerary.timeline.length - 1]?.time}{" "}
                {itinerary.timeline[itinerary.timeline.length - 1]?.activity}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
