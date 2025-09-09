"use client"

import { DayCard } from "./day-card"
import type { DayItinerary } from "@/types/itinerary"

interface ItineraryListProps {
  days: DayItinerary[]
  exchangeRate: number
  totalBudget?: number
  budgetCurrency?: "JPY" | "KRW"
  onDayClick: (day: DayItinerary) => void
  onExportDay: (day: DayItinerary) => void
}

export function ItineraryList({
  days,
  exchangeRate,
  totalBudget,
  budgetCurrency,
  onDayClick,
  onExportDay,
}: ItineraryListProps) {
  return (
    <div className="space-y-4">
      {days.map((day) => (
        <DayCard
          key={day.id}
          day={day}
          exchangeRate={exchangeRate}
          totalBudget={totalBudget}
          budgetCurrency={budgetCurrency}
          onViewDetails={() => onDayClick(day)}
          onExportPNG={() => onExportDay(day)}
        />
      ))}
    </div>
  )
}
