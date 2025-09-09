"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Plus,
  Trash2,
  Copy,
  GripVertical,
  Clock,
  MapPin,
  Link,
  Camera,
  Save,
  Download,
  Upload,
  Calculator,
  ArrowLeft,
} from "lucide-react"
import { type DayItinerary, type ItineraryItem, CATEGORY_LABELS, CURRENCY_SYMBOLS } from "@/types/itinerary"

interface ItineraryEditScreenProps {
  dayData: DayItinerary
  exchangeRate: number
  participants: number
  onSave: (updatedDay: DayItinerary) => void
  onClose: () => void
}

export function ItineraryEditScreen({
  dayData,
  exchangeRate,
  participants,
  onSave,
  onClose,
}: ItineraryEditScreenProps) {
  const [editingDay, setEditingDay] = useState<DayItinerary>(dayData)
  const [isAddingItem, setIsAddingItem] = useState(false)
  const [editingItem, setEditingItem] = useState<ItineraryItem | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      onSave(editingDay)
    }, 1000)
    return () => clearTimeout(timer)
  }, [editingDay, onSave])

  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const items = Array.from(editingDay.items)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setEditingDay({ ...editingDay, items })
  }

  const addNewItem = () => {
    const newItem: ItineraryItem = {
      id: Date.now().toString(),
      time: "09:00",
      name: "",
      category: "sightseeing",
      cost: { amount: 0, currency: "JPY" },
      links: {},
      memo: "",
    }
    setEditingItem(newItem)
    setIsAddingItem(true)
  }

  const duplicateItem = (item: ItineraryItem) => {
    const duplicatedItem: ItineraryItem = {
      ...item,
      id: Date.now().toString(),
      name: `${item.name} (복사본)`,
    }
    setEditingDay({
      ...editingDay,
      items: [...editingDay.items, duplicatedItem],
    })
  }

  const deleteItem = (itemId: string) => {
    setEditingDay({
      ...editingDay,
      items: editingDay.items.filter((item) => item.id !== itemId),
    })
  }

  const saveItem = (item: ItineraryItem) => {
    if (isAddingItem) {
      setEditingDay({
        ...editingDay,
        items: [...editingDay.items, item],
      })
    } else {
      setEditingDay({
        ...editingDay,
        items: editingDay.items.map((i) => (i.id === item.id ? item : i)),
      })
    }
    setEditingItem(null)
    setIsAddingItem(false)
  }

  const calculateTotals = () => {
    const jpyTotal = editingDay.items
      .filter((item) => item.cost.currency === "JPY")
      .reduce((sum, item) => sum + item.cost.amount, 0)

    const krwTotal = editingDay.items
      .filter((item) => item.cost.currency === "KRW")
      .reduce((sum, item) => sum + item.cost.amount, 0)

    const totalInKRW = krwTotal + jpyTotal * exchangeRate
    const perPersonCost = totalInKRW / participants

    return { jpyTotal, krwTotal, totalInKRW, perPersonCost }
  }

  const { jpyTotal, krwTotal, totalInKRW, perPersonCost } = calculateTotals()

  const exportToJSON = () => {
    const dataStr = JSON.stringify(editingDay, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${editingDay.date}-itinerary.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const importFromJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string)
        setEditingDay(importedData)
      } catch (error) {
        alert("JSON 파일을 읽는 중 오류가 발생했습니다.")
      }
    }
    reader.readAsText(file)
    event.target.value = ""
  }

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
      <div className="container mx-auto p-4 max-w-2xl">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="sm" onClick={onClose}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold">{editingDay.date} 일정 편집</h1>
            <p className="text-sm text-muted-foreground">
              {editingDay.city} • {editingDay.accommodation}
            </p>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calculator className="h-5 w-5" />
              예산 합계
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">JPY 합계:</span>
                <p className="font-semibold">
                  {CURRENCY_SYMBOLS.JPY}
                  {jpyTotal.toLocaleString()}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">KRW 합계:</span>
                <p className="font-semibold">
                  {CURRENCY_SYMBOLS.KRW}
                  {krwTotal.toLocaleString()}
                </p>
              </div>
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-muted-foreground">총 비용 (KRW):</span>
                <p className="text-lg font-bold text-primary">
                  {CURRENCY_SYMBOLS.KRW}
                  {Math.round(totalInKRW).toLocaleString()}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">1인당 비용:</span>
                <p className="text-lg font-bold">
                  {CURRENCY_SYMBOLS.KRW}
                  {Math.round(perPersonCost).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-2 mb-6">
          <Button onClick={addNewItem} className="h-12">
            <Plus className="h-4 w-4 mr-2" />
            아이템 추가
          </Button>
          <div className="grid grid-cols-2 gap-1">
            <Button variant="outline" onClick={exportToJSON} size="sm">
              <Download className="h-4 w-4 mr-1" />
              내보내기
            </Button>
            <Button variant="outline" size="sm" asChild>
              <label className="cursor-pointer flex items-center justify-center">
                <Upload className="h-4 w-4 mr-1" />
                가져오기
                <input type="file" accept=".json" onChange={importFromJSON} className="hidden" />
              </label>
            </Button>
          </div>
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="items">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                {editingDay.items.map((item, index) => (
                  <Draggable key={item.id} draggableId={item.id} index={index}>
                    {(provided, snapshot) => (
                      <Card
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`${snapshot.isDragging ? "shadow-lg rotate-2" : ""} transition-all`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div
                              {...provided.dragHandleProps}
                              className="mt-1 text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing touch-manipulation"
                            >
                              <GripVertical className="h-5 w-5" />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="secondary" className="text-xs">
                                  {CATEGORY_LABELS[item.category]}
                                </Badge>
                                <span className="text-sm text-muted-foreground flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {item.time}
                                </span>
                              </div>

                              <h3 className="font-semibold mb-1 text-sm">{item.name}</h3>

                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span className="font-medium text-primary">
                                  {CURRENCY_SYMBOLS[item.cost.currency]}
                                  {item.cost.amount.toLocaleString()}
                                </span>
                                {item.links.map && <MapPin className="h-3 w-3" />}
                                {item.links.website && <Link className="h-3 w-3" />}
                                {item.imageUrl && <Camera className="h-3 w-3" />}
                              </div>

                              {item.memo && (
                                <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{item.memo}</p>
                              )}
                            </div>

                            <div className="flex flex-col gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingItem(item)}
                                className="h-8 px-2 text-xs"
                              >
                                편집
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => duplicateItem(item)}
                                className="h-8 px-2"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteItem(item.id)}
                                className="h-8 px-2 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        {editingDay.items.length === 0 && (
          <Card className="p-8 text-center text-muted-foreground">
            <p>아직 일정이 없습니다.</p>
            <p className="text-sm">위의 "아이템 추가" 버튼을 눌러 일정을 추가해보세요.</p>
          </Card>
        )}

        <div className="h-20" />
      </div>

      {editingItem && (
        <ItemEditModal
          item={editingItem}
          onSave={saveItem}
          onCancel={() => {
            setEditingItem(null)
            setIsAddingItem(false)
          }}
        />
      )}
    </div>
  )
}

interface ItemEditModalProps {
  item: ItineraryItem
  onSave: (item: ItineraryItem) => void
  onCancel: () => void
}

function ItemEditModal({ item, onSave, onCancel }: ItemEditModalProps) {
  const [editingItem, setEditingItem] = useState<ItineraryItem>(item)

  const handleSave = () => {
    if (!editingItem.name.trim()) {
      alert("일정 이름을 입력해주세요.")
      return
    }
    onSave(editingItem)
  }

  return (
    <Dialog open={true} onOpenChange={() => onCancel()}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>일정 {item.id === editingItem.id ? "편집" : "추가"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="time">시간</Label>
              <Input
                id="time"
                type="time"
                value={editingItem.time}
                onChange={(e) => setEditingItem({ ...editingItem, time: e.target.value })}
                className="text-base" // 모바일에서 줌 방지
              />
            </div>
            <div>
              <Label htmlFor="category">카테고리</Label>
              <Select
                value={editingItem.category}
                onValueChange={(value: any) => setEditingItem({ ...editingItem, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="name">일정 이름</Label>
            <Input
              id="name"
              value={editingItem.name}
              onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
              placeholder="예: 기요미즈데라 관람"
              className="text-base"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="currency">통화</Label>
              <Select
                value={editingItem.cost.currency}
                onValueChange={(value: any) =>
                  setEditingItem({
                    ...editingItem,
                    cost: { ...editingItem.cost, currency: value },
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="JPY">일본 엔 (¥)</SelectItem>
                  <SelectItem value="KRW">한국 원 (₩)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="amount">금액</Label>
              <Input
                id="amount"
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                value={editingItem.cost.amount}
                onChange={(e) =>
                  setEditingItem({
                    ...editingItem,
                    cost: { ...editingItem.cost, amount: Number(e.target.value) || 0 },
                  })
                }
                placeholder="0"
                className="text-base"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="mapLink">지도 링크</Label>
            <Input
              id="mapLink"
              type="url"
              value={editingItem.links.map || ""}
              onChange={(e) =>
                setEditingItem({
                  ...editingItem,
                  links: { ...editingItem.links, map: e.target.value },
                })
              }
              placeholder="https://maps.google.com/..."
              className="text-base"
            />
          </div>

          <div>
            <Label htmlFor="websiteLink">웹사이트 링크</Label>
            <Input
              id="websiteLink"
              type="url"
              value={editingItem.links.website || ""}
              onChange={(e) =>
                setEditingItem({
                  ...editingItem,
                  links: { ...editingItem.links, website: e.target.value },
                })
              }
              placeholder="https://example.com"
              className="text-base"
            />
          </div>

          <div>
            <Label htmlFor="imageUrl">이미지 URL</Label>
            <Input
              id="imageUrl"
              type="url"
              value={editingItem.imageUrl || ""}
              onChange={(e) => setEditingItem({ ...editingItem, imageUrl: e.target.value })}
              placeholder="https://example.com/image.jpg"
              className="text-base"
            />
          </div>

          <div>
            <Label htmlFor="memo">메모</Label>
            <Textarea
              id="memo"
              value={editingItem.memo}
              onChange={(e) => setEditingItem({ ...editingItem, memo: e.target.value })}
              placeholder="추가 정보나 메모를 입력하세요..."
              rows={3}
              className="text-base resize-none"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={handleSave} className="flex-1 h-12">
              <Save className="h-4 w-4 mr-2" />
              저장
            </Button>
            <Button variant="outline" onClick={onCancel} className="h-12 bg-transparent">
              취소
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
