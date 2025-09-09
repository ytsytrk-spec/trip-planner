"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Plus, Minus, Save } from "lucide-react"
import type { Itinerary, TimelineItem, Transportation } from "@/types/itinerary"

interface AddItineraryModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (itinerary: Omit<Itinerary, "id"> | Itinerary) => void
  editingItinerary?: Itinerary | null
}

export function AddItineraryModal({ isOpen, onClose, onSave, editingItinerary }: AddItineraryModalProps) {
  const [formData, setFormData] = useState({
    date: "",
    dayOfWeek: "",
    title: "",
    accommodation: "",
    highlights: [""],
    timeline: [{ time: "", activity: "", location: "" }] as TimelineItem[],
    transportation: [{ from: "", to: "", method: "", cost: 0, duration: "" }] as Transportation[],
    budget: {
      accommodation: 0,
      food: 0,
      transportation: 0,
      activities: 0,
      total: 0,
    },
    notes: "",
    images: [] as string[],
  })

  useEffect(() => {
    if (editingItinerary) {
      setFormData({
        date: editingItinerary.date,
        dayOfWeek: editingItinerary.dayOfWeek,
        title: editingItinerary.title,
        accommodation: editingItinerary.accommodation,
        highlights: editingItinerary.highlights.length > 0 ? editingItinerary.highlights : [""],
        timeline:
          editingItinerary.timeline.length > 0 ? editingItinerary.timeline : [{ time: "", activity: "", location: "" }],
        transportation:
          editingItinerary.transportation.length > 0
            ? editingItinerary.transportation
            : [{ from: "", to: "", method: "", cost: 0, duration: "" }],
        budget: editingItinerary.budget,
        notes: editingItinerary.notes,
        images: editingItinerary.images,
      })
    } else {
      // Reset form for new itinerary
      setFormData({
        date: "",
        dayOfWeek: "",
        title: "",
        accommodation: "",
        highlights: [""],
        timeline: [{ time: "", activity: "", location: "" }],
        transportation: [{ from: "", to: "", method: "", cost: 0, duration: "" }],
        budget: {
          accommodation: 0,
          food: 0,
          transportation: 0,
          activities: 0,
          total: 0,
        },
        notes: "",
        images: [],
      })
    }
  }, [editingItinerary, isOpen])

  const updateBudgetTotal = (budget: typeof formData.budget) => {
    return {
      ...budget,
      total: budget.accommodation + budget.food + budget.transportation + budget.activities,
    }
  }

  const handleDateChange = (date: string) => {
    const dayOfWeek = new Date(date).toLocaleDateString("ko-KR", { weekday: "long" })
    setFormData((prev) => ({ ...prev, date, dayOfWeek }))
  }

  const handleBudgetChange = (field: keyof typeof formData.budget, value: number) => {
    setFormData((prev) => ({
      ...prev,
      budget: updateBudgetTotal({ ...prev.budget, [field]: value }),
    }))
  }

  const addHighlight = () => {
    setFormData((prev) => ({ ...prev, highlights: [...prev.highlights, ""] }))
  }

  const removeHighlight = (index: number) => {
    setFormData((prev) => ({ ...prev, highlights: prev.highlights.filter((_, i) => i !== index) }))
  }

  const updateHighlight = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      highlights: prev.highlights.map((item, i) => (i === index ? value : item)),
    }))
  }

  const addTimelineItem = () => {
    setFormData((prev) => ({ ...prev, timeline: [...prev.timeline, { time: "", activity: "", location: "" }] }))
  }

  const removeTimelineItem = (index: number) => {
    setFormData((prev) => ({ ...prev, timeline: prev.timeline.filter((_, i) => i !== index) }))
  }

  const updateTimelineItem = (index: number, field: keyof TimelineItem, value: string) => {
    setFormData((prev) => ({
      ...prev,
      timeline: prev.timeline.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    }))
  }

  const addTransportation = () => {
    setFormData((prev) => ({
      ...prev,
      transportation: [...prev.transportation, { from: "", to: "", method: "", cost: 0, duration: "" }],
    }))
  }

  const removeTransportation = (index: number) => {
    setFormData((prev) => ({ ...prev, transportation: prev.transportation.filter((_, i) => i !== index) }))
  }

  const updateTransportation = (index: number, field: keyof Transportation, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      transportation: prev.transportation.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const cleanedData = {
      ...formData,
      highlights: formData.highlights.filter((h) => h.trim() !== ""),
      timeline: formData.timeline.filter((t) => t.time && t.activity && t.location),
      transportation: formData.transportation.filter((t) => t.from && t.to && t.method),
    }

    if (editingItinerary) {
      onSave({ ...cleanedData, id: editingItinerary.id } as Itinerary)
    } else {
      onSave(cleanedData)
    }

    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingItinerary ? "일정 수정" : "새 일정 추가"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">기본 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label htmlFor="date">날짜</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleDateChange(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="title">제목</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="일정 제목을 입력하세요"
                  required
                />
              </div>
              <div>
                <Label htmlFor="accommodation">숙소</Label>
                <Input
                  id="accommodation"
                  value={formData.accommodation}
                  onChange={(e) => setFormData((prev) => ({ ...prev, accommodation: e.target.value }))}
                  placeholder="숙소명을 입력하세요"
                />
              </div>
            </CardContent>
          </Card>

          {/* Highlights */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center justify-between">
                주요 일정
                <Button type="button" variant="outline" size="sm" onClick={addHighlight}>
                  <Plus className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {formData.highlights.map((highlight, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={highlight}
                    onChange={(e) => updateHighlight(index, e.target.value)}
                    placeholder="주요 일정을 입력하세요"
                  />
                  {formData.highlights.length > 1 && (
                    <Button type="button" variant="outline" size="sm" onClick={() => removeHighlight(index)}>
                      <Minus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center justify-between">
                타임라인
                <Button type="button" variant="outline" size="sm" onClick={addTimelineItem}>
                  <Plus className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {formData.timeline.map((item, index) => (
                <div key={index} className="space-y-2 p-3 border rounded-lg">
                  <div className="flex gap-2">
                    <Input
                      type="time"
                      value={item.time}
                      onChange={(e) => updateTimelineItem(index, "time", e.target.value)}
                      className="w-32"
                    />
                    {formData.timeline.length > 1 && (
                      <Button type="button" variant="outline" size="sm" onClick={() => removeTimelineItem(index)}>
                        <Minus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <Input
                    value={item.activity}
                    onChange={(e) => updateTimelineItem(index, "activity", e.target.value)}
                    placeholder="활동 내용"
                  />
                  <Input
                    value={item.location}
                    onChange={(e) => updateTimelineItem(index, "location", e.target.value)}
                    placeholder="장소"
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Transportation */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center justify-between">
                교통편
                <Button type="button" variant="outline" size="sm" onClick={addTransportation}>
                  <Plus className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {formData.transportation.map((transport, index) => (
                <div key={index} className="space-y-2 p-3 border rounded-lg">
                  <div className="flex gap-2">
                    <Input
                      value={transport.from}
                      onChange={(e) => updateTransportation(index, "from", e.target.value)}
                      placeholder="출발지"
                    />
                    <Input
                      value={transport.to}
                      onChange={(e) => updateTransportation(index, "to", e.target.value)}
                      placeholder="도착지"
                    />
                    {formData.transportation.length > 1 && (
                      <Button type="button" variant="outline" size="sm" onClick={() => removeTransportation(index)}>
                        <Minus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={transport.method}
                      onChange={(e) => updateTransportation(index, "method", e.target.value)}
                      placeholder="교통수단"
                    />
                    <Input
                      value={transport.duration}
                      onChange={(e) => updateTransportation(index, "duration", e.target.value)}
                      placeholder="소요시간"
                    />
                  </div>
                  <Input
                    type="number"
                    value={transport.cost}
                    onChange={(e) => updateTransportation(index, "cost", Number(e.target.value))}
                    placeholder="요금 (원)"
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Budget */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">예산</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label htmlFor="budget-accommodation">숙박비</Label>
                <Input
                  id="budget-accommodation"
                  type="number"
                  value={formData.budget.accommodation}
                  onChange={(e) => handleBudgetChange("accommodation", Number(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="budget-food">식비</Label>
                <Input
                  id="budget-food"
                  type="number"
                  value={formData.budget.food}
                  onChange={(e) => handleBudgetChange("food", Number(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="budget-transportation">교통비</Label>
                <Input
                  id="budget-transportation"
                  type="number"
                  value={formData.budget.transportation}
                  onChange={(e) => handleBudgetChange("transportation", Number(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="budget-activities">활동비</Label>
                <Input
                  id="budget-activities"
                  type="number"
                  value={formData.budget.activities}
                  onChange={(e) => handleBudgetChange("activities", Number(e.target.value))}
                />
              </div>
              <Separator />
              <div className="flex justify-between items-center font-semibold">
                <span>총합</span>
                <span>{formData.budget.total.toLocaleString()}원</span>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">메모</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="추가 메모를 입력하세요"
                rows={3}
              />
            </CardContent>
          </Card>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              취소
            </Button>
            <Button type="submit" className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              {editingItinerary ? "수정" : "저장"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
