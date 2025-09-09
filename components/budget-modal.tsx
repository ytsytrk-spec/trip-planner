"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import {
  Calculator,
  TrendingUp,
  Banknote,
  RefreshCw,
  Edit2,
  Check,
  X,
  Users,
  Plus,
  Minus,
  Wifi,
  WifiOff,
  Clock,
} from "lucide-react"
import { fetchExchangeRate, setManualExchangeRate, getExchangeRateStatus, formatCurrency } from "@/lib/exchange-rate"
import type { TripData, BudgetSummary } from "@/types/itinerary"

interface BudgetModalProps {
  isOpen: boolean
  onClose: () => void
  tripData: TripData
  onUpdateTripData: (data: TripData) => void
}

export function BudgetModal({ isOpen, onClose, tripData, onUpdateTripData }: BudgetModalProps) {
  const [exchangeRate, setExchangeRate] = useState(tripData.exchangeRate)
  const [exchangeSource, setExchangeSource] = useState<string>("cache")
  const [lastUpdated, setLastUpdated] = useState<string>("")
  const [isEditingRate, setIsEditingRate] = useState(false)
  const [tempRate, setTempRate] = useState(exchangeRate.toString())
  const [isUpdatingRate, setIsUpdatingRate] = useState(false)
  const [totalBudget, setTotalBudget] = useState(tripData.totalBudget || 500000)
  const [budgetCurrency, setBudgetCurrency] = useState<"JPY" | "KRW">(tripData.budgetCurrency || "KRW")
  const [participants, setParticipants] = useState(tripData.participants)
  const { toast } = useToast()

  useEffect(() => {
    const status = getExchangeRateStatus()
    if (status) {
      setExchangeSource(status.source)
      setLastUpdated(status.lastUpdated)
    }
  }, [])

  const updateExchangeRate = async () => {
    setIsUpdatingRate(true)
    try {
      const result = await fetchExchangeRate(true)
      setExchangeRate(result.rate)
      setExchangeSource(result.source)
      setLastUpdated(new Date().toLocaleString("ko-KR"))

      const updatedTripData = { ...tripData, exchangeRate: result.rate }
      onUpdateTripData(updatedTripData)
    } catch (error) {
      // Error handling is done in fetchExchangeRate
    } finally {
      setIsUpdatingRate(false)
    }
  }

  const handleSaveRate = () => {
    const newRate = Number.parseFloat(tempRate)
    if (!isNaN(newRate) && newRate > 0) {
      setExchangeRate(newRate)
      setExchangeSource("manual")
      setLastUpdated(new Date().toLocaleString("ko-KR"))
      setIsEditingRate(false)
      setManualExchangeRate(newRate)

      const updatedTripData = { ...tripData, exchangeRate: newRate }
      onUpdateTripData(updatedTripData)
    } else {
      toast({
        title: "잘못된 입력",
        description: "환율은 0보다 큰 숫자여야 합니다.",
        variant: "destructive",
      })
    }
  }

  const handleCancelEdit = () => {
    setTempRate(exchangeRate.toString())
    setIsEditingRate(false)
  }

  const incrementParticipants = () => {
    if (participants < 20) {
      const newParticipants = participants + 1
      updateParticipants(newParticipants)
    }
  }

  const decrementParticipants = () => {
    if (participants > 1) {
      const newParticipants = participants - 1
      updateParticipants(newParticipants)
    }
  }

  const handleParticipantsChange = (value: string) => {
    const newParticipants = Number.parseInt(value)
    if (!isNaN(newParticipants) && newParticipants >= 1 && newParticipants <= 20) {
      updateParticipants(newParticipants)
    }
  }

  const updateParticipants = (newParticipants: number) => {
    setParticipants(newParticipants)
    const updatedTripData = { ...tripData, participants: newParticipants }
    onUpdateTripData(updatedTripData)

    toast({
      title: "인원수 변경",
      description: `${newParticipants}명으로 설정되었습니다.`,
    })
  }

  const handleBudgetChange = (newBudget: number, currency: "JPY" | "KRW") => {
    setTotalBudget(newBudget)
    setBudgetCurrency(currency)

    const updatedTripData = {
      ...tripData,
      totalBudget: newBudget,
      budgetCurrency: currency,
    }
    onUpdateTripData(updatedTripData)
  }

  const calculateBudgetSummary = (): BudgetSummary => {
    let totalJPY = 0
    let totalKRW = 0
    const dailyTotals = tripData.days.map((day) => {
      let dayJPY = 0
      let dayKRW = 0

      day.items.forEach((item) => {
        if (item.cost.currency === "JPY") {
          dayJPY += item.cost.value
          dayKRW += item.cost.value * exchangeRate
        } else {
          dayKRW += item.cost.value
          dayJPY += item.cost.value / exchangeRate
        }
      })

      totalJPY += dayJPY
      totalKRW += dayKRW

      return {
        dayId: day.id,
        totalJPY: dayJPY,
        totalKRW: dayKRW,
      }
    })

    return {
      totalJPY,
      totalKRW,
      perPersonJPY: totalJPY / participants,
      perPersonKRW: totalKRW / participants,
      dailyTotals,
    }
  }

  const budgetSummary = calculateBudgetSummary()
  const budgetInKRW = budgetCurrency === "JPY" ? totalBudget * exchangeRate : totalBudget
  const budgetInJPY = budgetCurrency === "KRW" ? totalBudget / exchangeRate : totalBudget
  const remainingBudgetKRW = budgetInKRW - budgetSummary.totalKRW
  const budgetProgress = (budgetSummary.totalKRW / budgetInKRW) * 100

  const getSourceInfo = (source: string) => {
    switch (source) {
      case "api":
        return { icon: Wifi, color: "text-positive", label: "실시간" }
      case "manual":
        return { icon: Edit2, color: "text-warning", label: "수동 설정" }
      case "cache":
        return { icon: Clock, color: "text-subtext", label: "캐시" }
      default:
        return { icon: WifiOff, color: "text-danger", label: "오프라인" }
    }
  }

  const sourceInfo = getSourceInfo(exchangeSource)

  useEffect(() => {
    setTempRate(exchangeRate.toString())
  }, [exchangeRate])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-h2 flex items-center space-x-2">
            <Calculator className="h-5 w-5" />
            <span>예산 및 환율</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-h3 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span>환율 설정</span>
                  <sourceInfo.icon className={`h-4 w-4 ${sourceInfo.color}`} />
                </div>
                <div className="flex items-center space-x-2">
                  {!isEditingRate && (
                    <Button variant="outline" size="sm" onClick={updateExchangeRate} disabled={isUpdatingRate}>
                      <RefreshCw className={`h-4 w-4 ${isUpdatingRate ? "animate-spin" : ""}`} />
                    </Button>
                  )}
                  {!isEditingRate ? (
                    <Button variant="outline" size="sm" onClick={() => setIsEditingRate(true)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  ) : (
                    <div className="flex space-x-1">
                      <Button variant="outline" size="sm" onClick={handleSaveRate}>
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isEditingRate ? (
                <div className="space-y-2">
                  <Label htmlFor="exchange-rate">1 JPY = ? KRW</Label>
                  <Input
                    id="exchange-rate"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={tempRate}
                    onChange={(e) => setTempRate(e.target.value)}
                    placeholder="환율을 입력하세요"
                    className="touch-target"
                  />
                </div>
              ) : (
                <div className="text-center space-y-2">
                  <div className="text-2xl font-bold text-primary">1 JPY = {exchangeRate.toFixed(2)} KRW</div>
                  <div className="flex items-center justify-center space-x-2">
                    <Badge variant="secondary" className={`text-xs ${sourceInfo.color}`}>
                      {sourceInfo.label}
                    </Badge>
                    {lastUpdated && (
                      <Badge variant="outline" className="text-xs">
                        {lastUpdated}
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-h3 flex items-center space-x-2">
                <Banknote className="h-5 w-5 text-primary" />
                <span>여행 총예산</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <div className="flex-1">
                  <Label htmlFor="total-budget">총예산</Label>
                  <Input
                    id="total-budget"
                    type="number"
                    min="0"
                    value={totalBudget}
                    onChange={(e) => handleBudgetChange(Number(e.target.value), budgetCurrency)}
                    placeholder="총예산을 입력하세요"
                    className="touch-target"
                  />
                </div>
                <div className="w-24">
                  <Label htmlFor="budget-currency">통화</Label>
                  <Select
                    value={budgetCurrency}
                    onValueChange={(value: "JPY" | "KRW") => handleBudgetChange(totalBudget, value)}
                  >
                    <SelectTrigger className="touch-target">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="KRW">KRW</SelectItem>
                      <SelectItem value="JPY">JPY</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>인원수</span>
                </Label>
                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={decrementParticipants}
                    disabled={participants <= 1}
                    className="h-10 w-10 p-0 touch-target bg-transparent"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center space-x-2 flex-1">
                    <Input
                      id="participants"
                      type="number"
                      min="1"
                      max="20"
                      value={participants}
                      onChange={(e) => handleParticipantsChange(e.target.value)}
                      className="text-center font-medium touch-target"
                    />
                    <span className="text-caption text-muted-foreground whitespace-nowrap">명</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={incrementParticipants}
                    disabled={participants >= 20}
                    className="h-10 w-10 p-0 touch-target"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="text-caption text-muted-foreground text-center">
                  1인당 예산: {formatCurrency(budgetInKRW / participants, "KRW")}
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t">
                <div className="flex justify-between">
                  <span className="text-body">총예산 (KRW)</span>
                  <span className="font-medium">{formatCurrency(budgetInKRW, "KRW")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-body">총예산 (JPY)</span>
                  <span className="font-medium">{formatCurrency(budgetInJPY, "JPY")}</span>
                </div>
                <div className="flex justify-between items-center font-semibold">
                  <span>잔여 예산</span>
                  <span className={remainingBudgetKRW >= 0 ? "text-positive" : "text-danger"}>
                    {formatCurrency(remainingBudgetKRW, "KRW")}
                  </span>
                </div>

                <div className="space-y-1">
                  <Progress value={Math.min(budgetProgress, 100)} className="h-2" />
                  <div className="text-caption text-center text-muted-foreground">
                    {budgetProgress.toFixed(1)}% 사용
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-h3 flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <span>예산 현황</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-caption text-muted-foreground">총 사용 (KRW)</div>
                  <div className="font-semibold">{formatCurrency(budgetSummary.totalKRW, "KRW")}</div>
                </div>
                <div className="text-center">
                  <div className="text-caption text-muted-foreground">총 사용 (JPY)</div>
                  <div className="font-semibold">{formatCurrency(budgetSummary.totalJPY, "JPY")}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                <div className="text-center">
                  <div className="text-caption text-muted-foreground">1인당 (KRW)</div>
                  <div className="font-medium">{formatCurrency(budgetSummary.perPersonKRW, "KRW")}</div>
                </div>
                <div className="text-center">
                  <div className="text-caption text-muted-foreground">1인당 (JPY)</div>
                  <div className="font-medium">{formatCurrency(budgetSummary.perPersonJPY, "JPY")}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-h3">일별 예산</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {budgetSummary.dailyTotals.map((dayTotal, index) => {
                const day = tripData.days[index]
                if (!day) return null

                return (
                  <div key={day.id} className="flex justify-between items-center py-1">
                    <span className="text-body text-muted-foreground">
                      {new Date(day.date).toLocaleDateString("ko-KR", { month: "short", day: "numeric" })}
                      <span className="ml-1 text-caption">({day.title})</span>
                    </span>
                    <div className="text-right">
                      <div className="font-medium text-body">{formatCurrency(dayTotal.totalKRW, "KRW")}</div>
                      <div className="text-caption text-muted-foreground">
                        {formatCurrency(dayTotal.totalJPY, "JPY")}
                      </div>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
