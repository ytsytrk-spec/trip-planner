"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Clock, MapPin, Train, Banknote, StickyNote, Calendar } from "lucide-react"
import type { Itinerary } from "@/types/itinerary"

interface ItineraryModalProps {
  isOpen: boolean
  onClose: () => void
  itinerary: Itinerary | null
}

export function ItineraryModal({ isOpen, onClose, itinerary }: ItineraryModalProps) {
  if (!itinerary) return null

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
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-left">
            <Calendar className="h-5 w-5" />
            <span className="text-balance">{itinerary.title}</span>
          </DialogTitle>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span>{formatDate(itinerary.date)}</span>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Timeline */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <Clock className="h-5 w-5 text-primary" />
                <span>타임라인</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {itinerary.timeline.map((item, index) => (
                <div key={index} className="flex space-x-3">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                    {index < itinerary.timeline.length - 1 && <div className="w-px h-8 bg-border mt-1" />}
                  </div>
                  <div className="flex-1 pb-2">
                    <div className="flex items-center space-x-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        {item.time}
                      </Badge>
                    </div>
                    <div className="text-sm font-medium text-foreground mb-1">{item.activity}</div>
                    <div className="text-xs text-muted-foreground flex items-center space-x-1">
                      <MapPin className="h-3 w-3" />
                      <span>{item.location}</span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Transportation */}
          {itinerary.transportation.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Train className="h-5 w-5 text-primary" />
                  <span>교통편</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {itinerary.transportation.map((transport, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">
                        {transport.from} → {transport.to}
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {transport.method}
                      </Badge>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>소요시간: {transport.duration}</span>
                      <span>요금: {formatCurrency(transport.cost)}</span>
                    </div>
                    {index < itinerary.transportation.length - 1 && <Separator className="my-2" />}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Budget */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <Banknote className="h-5 w-5 text-primary" />
                <span>예산</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-2">
                {itinerary.budget.accommodation > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">숙박</span>
                    <span className="font-medium">{formatCurrency(itinerary.budget.accommodation)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">식비</span>
                  <span className="font-medium">{formatCurrency(itinerary.budget.food)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">교통비</span>
                  <span className="font-medium">{formatCurrency(itinerary.budget.transportation)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">활동비</span>
                  <span className="font-medium">{formatCurrency(itinerary.budget.activities)}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center font-semibold">
                  <span>총합</span>
                  <span className="text-primary">{formatCurrency(itinerary.budget.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {itinerary.notes && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center space-x-2">
                  <StickyNote className="h-5 w-5 text-primary" />
                  <span>메모</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">{itinerary.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
