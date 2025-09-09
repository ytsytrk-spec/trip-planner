"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Download, FileImage, Palette, Settings } from "lucide-react"
import type { DayItinerary, TripData } from "@/types/itinerary"

interface ExportModalProps {
  isOpen: boolean
  onClose: () => void
  tripData: TripData
  selectedDay?: DayItinerary | null
  onExport: (options: ExportConfig) => Promise<void>
}

export interface ExportConfig {
  type: "day" | "summary" | "full"
  dayId?: string
  scale: number
  backgroundColor: string
  includeImages: boolean
  format: "png" | "jpeg"
  quality: number
}

export function ExportModal({ isOpen, onClose, tripData, selectedDay, onExport }: ExportModalProps) {
  const [exportType, setExportType] = useState<"day" | "summary" | "full">("day")
  const [selectedDayId, setSelectedDayId] = useState(selectedDay?.id || tripData.days[0]?.id || "")
  const [scale, setScale] = useState([2])
  const [backgroundColor, setBackgroundColor] = useState("#ffffff")
  const [includeImages, setIncludeImages] = useState(true)
  const [format, setFormat] = useState<"png" | "jpeg">("png")
  const [quality, setQuality] = useState([95])
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    setIsExporting(true)
    try {
      await onExport({
        type: exportType,
        dayId: exportType === "day" ? selectedDayId : undefined,
        scale: scale[0],
        backgroundColor,
        includeImages,
        format,
        quality: quality[0] / 100,
      })
      onClose()
    } catch (error) {
      console.error("Export failed:", error)
    } finally {
      setIsExporting(false)
    }
  }

  const getExportDescription = () => {
    switch (exportType) {
      case "day":
        const day = tripData.days.find((d) => d.id === selectedDayId)
        return day ? `${day.title} (${new Date(day.date).toLocaleDateString("ko-KR")}) 일정` : "선택된 날짜 일정"
      case "summary":
        return "여행 전체 요약 (예산, 기간, 주요 정보)"
      case "full":
        return "전체 일정 (모든 날짜 포함)"
      default:
        return ""
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-h2 flex items-center space-x-2">
            <FileImage className="h-5 w-5" />
            <span>PNG 내보내기</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-h3 flex items-center space-x-2">
                <Download className="h-4 w-4" />
                <span>내보내기 옵션</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>내보내기 유형</Label>
                <Select value={exportType} onValueChange={(value: "day" | "summary" | "full") => setExportType(value)}>
                  <SelectTrigger className="touch-target">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">선택한 날짜</SelectItem>
                    <SelectItem value="summary">여행 요약</SelectItem>
                    <SelectItem value="full">전체 일정</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-caption text-muted-foreground">{getExportDescription()}</p>
              </div>

              {exportType === "day" && (
                <div className="space-y-2">
                  <Label>날짜 선택</Label>
                  <Select value={selectedDayId} onValueChange={setSelectedDayId}>
                    <SelectTrigger className="touch-target">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {tripData.days.map((day) => (
                        <SelectItem key={day.id} value={day.id}>
                          {new Date(day.date).toLocaleDateString("ko-KR", {
                            month: "short",
                            day: "numeric",
                            weekday: "short",
                          })}{" "}
                          - {day.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label>파일 형식</Label>
                <Select value={format} onValueChange={(value: "png" | "jpeg") => setFormat(value)}>
                  <SelectTrigger className="touch-target">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="png">PNG (투명 배경 지원)</SelectItem>
                    <SelectItem value="jpeg">JPEG (작은 파일 크기)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-h3 flex items-center space-x-2">
                <Settings className="h-4 w-4" />
                <span>품질 설정</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>해상도 배율: {scale[0]}x</Label>
                <Slider value={scale} onValueChange={setScale} min={1} max={4} step={0.5} className="touch-target" />
                <p className="text-caption text-muted-foreground">높을수록 선명하지만 파일 크기가 커집니다</p>
              </div>

              {format === "jpeg" && (
                <div className="space-y-2">
                  <Label>이미지 품질: {quality[0]}%</Label>
                  <Slider
                    value={quality}
                    onValueChange={setQuality}
                    min={50}
                    max={100}
                    step={5}
                    className="touch-target"
                  />
                </div>
              )}

              <div className="flex items-center justify-between">
                <Label htmlFor="include-images">이미지 포함</Label>
                <Switch id="include-images" checked={includeImages} onCheckedChange={setIncludeImages} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-h3 flex items-center space-x-2">
                <Palette className="h-4 w-4" />
                <span>배경 설정</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>배경색</Label>
                <div className="flex gap-2">
                  {["#ffffff", "#f7f9fc", "#0e1220", "transparent"].map((color) => (
                    <button
                      key={color}
                      onClick={() => setBackgroundColor(color)}
                      className={`w-12 h-12 rounded-lg border-2 touch-target ${
                        backgroundColor === color ? "border-primary" : "border-border"
                      }`}
                      style={{
                        backgroundColor: color === "transparent" ? "transparent" : color,
                        backgroundImage:
                          color === "transparent"
                            ? "linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)"
                            : undefined,
                        backgroundSize: color === "transparent" ? "8px 8px" : undefined,
                        backgroundPosition: color === "transparent" ? "0 0, 0 4px, 4px -4px, -4px 0px" : undefined,
                      }}
                      aria-label={
                        color === "#ffffff"
                          ? "흰색 배경"
                          : color === "#f7f9fc"
                            ? "연한 회색 배경"
                            : color === "#0e1220"
                              ? "어두운 배경"
                              : "투명 배경"
                      }
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Button onClick={handleExport} disabled={isExporting} className="w-full touch-target" size="lg">
            {isExporting ? (
              <>
                <Download className="h-4 w-4 mr-2 animate-pulse" />
                내보내는 중...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                {format.toUpperCase()}로 내보내기
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
