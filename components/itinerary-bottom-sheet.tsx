"use client"
import { useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Clock,
  MapPin,
  Banknote,
  StickyNote,
  Edit,
  Trash2,
  Info,
  Map,
  ImageIcon,
  CheckSquare,
  Plus,
  ExternalLink,
  Phone,
  Download,
} from "lucide-react"
import { ImageUpload } from "./image-upload"
import { CATEGORY_ICONS, CATEGORY_COLORS, CURRENCY_SYMBOLS } from "@/types/itinerary"
import type { ItineraryItem, DayItinerary } from "@/types/itinerary"
import Image from "next/image"
import { toast } from "@/hooks/use-toast"

interface ItineraryBottomSheetProps {
  isOpen: boolean
  onClose: () => void
  item: ItineraryItem | null
  day: DayItinerary | null
  exchangeRate: number
  onEdit: (item: ItineraryItem) => void
  onDelete: (itemId: string, dayId: string) => void
  onUpdate: (item: ItineraryItem) => void
}

interface ChecklistItem {
  id: string
  text: string
  completed: boolean
}

export function ItineraryBottomSheet({
  isOpen,
  onClose,
  item,
  day,
  exchangeRate,
  onEdit,
  onDelete,
  onUpdate,
}: ItineraryBottomSheetProps) {
  console.log("ItineraryBottomSheet render - isOpen:", isOpen, "item:", item, "day:", day)
  const [activeTab, setActiveTab] = useState("overview")
  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    { id: "1", text: "입장권 예약 확인", completed: false },
    { id: "2", text: "카메라 배터리 충전", completed: true },
  ])
  const [newChecklistItem, setNewChecklistItem] = useState("")
  const [notes, setNotes] = useState(item?.memo || "")
  const [mapLoaded, setMapLoaded] = useState(false)

  if (!item || !day) return null

  const formatCurrency = (amount: number, currency: "JPY" | "KRW") => {
    return new Intl.NumberFormat(currency === "JPY" ? "ja-JP" : "ko-KR", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const convertCurrency = (amount: number, fromCurrency: "JPY" | "KRW", toCurrency: "JPY" | "KRW") => {
    if (fromCurrency === toCurrency) return amount
    return fromCurrency === "JPY" ? amount * exchangeRate : amount / exchangeRate
  }

  const getCategoryColor = (category: string) => {
    return CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] || "bg-gray-100 text-gray-800"
  }

  const addChecklistItem = () => {
    if (newChecklistItem.trim()) {
      const newItem: ChecklistItem = {
        id: Date.now().toString(),
        text: newChecklistItem.trim(),
        completed: false,
      }
      setChecklist([...checklist, newItem])
      setNewChecklistItem("")
    }
  }

  const toggleChecklistItem = (id: string) => {
    setChecklist(checklist.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item)))
  }

  const removeChecklistItem = (id: string) => {
    setChecklist(checklist.filter((item) => item.id !== id))
  }

  const handleNotesChange = (newNotes: string) => {
    setNotes(newNotes)
    const updatedItem = { ...item, memo: newNotes }
    onUpdate(updatedItem)
  }

  const getMapEmbedUrl = () => {
    if (item.placeIdOrAddress) {
      // Place ID가 있는 경우
      if (item.placeIdOrAddress.startsWith("ChIJ")) {
        return `https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=place_id:${item.placeIdOrAddress}`
      }
      // 일반 주소인 경우
      return `https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${encodeURIComponent(item.placeIdOrAddress)}`
    }
    if (item.links.mapUrl) {
      return `https://www.google.com/maps/embed/v1/search?key=YOUR_API_KEY&q=${encodeURIComponent(item.links.mapUrl)}`
    }
    // 기본적으로 아이템 이름으로 검색
    return `https://www.google.com/maps/embed/v1/search?key=YOUR_API_KEY&q=${encodeURIComponent(item.name || item.title)}`
  }

  const handleAddImage = (url: string) => {
    const updatedImages = [...(item.images || []), url]
    const updatedItem = { ...item, images: updatedImages }
    onUpdate(updatedItem)
    toast({
      title: "이미지 추가 완료",
      description: "이미지가 성공적으로 추가되었습니다.",
    })
  }

  const handleRemoveImage = (index: number) => {
    const updatedImages = (item.images || []).filter((_, i) => i !== index)
    const updatedItem = { ...item, images: updatedImages }
    onUpdate(updatedItem)
    toast({
      title: "이미지 삭제 완료",
      description: "이미지가 삭제되었습니다.",
    })
  }

  const handleExportItemPNG = async () => {
    try {
      // This would be implemented with html2canvas
      toast({
        title: "PNG 내보내기",
        description: "아이템 카드를 PNG로 저장 중입니다...",
      })
      // Implementation would go here
    } catch (error) {
      toast({
        title: "내보내기 실패",
        description: "PNG 내보내기 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[85vh] overflow-hidden flex flex-col">
        <SheetHeader className="pb-4 flex-shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <SheetTitle className="flex items-center space-x-2 text-left mb-2">
                <Clock className="h-5 w-5" />
                <span className="text-balance">{item.name || item.title}</span>
              </SheetTitle>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
                <Badge variant="outline" className="text-xs">
                  {item.time}
                </Badge>
                <Badge className={`text-xs ${getCategoryColor(item.category)}`}>
                  {CATEGORY_ICONS[item.category]} {item.category}
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                {item.links.mapUrl && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={item.links.mapUrl} target="_blank" rel="noopener noreferrer">
                      <MapPin className="h-3 w-3 mr-1" />
                      지도
                    </a>
                  </Button>
                )}
                {item.links.webUrl && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={item.links.webUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      웹사이트
                    </a>
                  </Button>
                )}
                {item.links.tel && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={`tel:${item.links.tel}`}>
                      <Phone className="h-3 w-3 mr-1" />
                      전화
                    </a>
                  </Button>
                )}
              </div>
            </div>
            <div className="flex space-x-2 ml-4">
              <Button variant="outline" size="sm" onClick={handleExportItemPNG}>
                <Download className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => onEdit(item)}>
                <Edit className="h-4 w-4" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>아이템을 삭제하시겠습니까?</AlertDialogTitle>
                    <AlertDialogDescription>
                      이 작업은 되돌릴 수 없습니다. 아이템이 영구적으로 삭제됩니다.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>취소</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onDelete(item.id, day.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      삭제
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </SheetHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-4 flex-shrink-0">
            <TabsTrigger value="overview" className="flex items-center space-x-1">
              <Info className="h-4 w-4" />
              <span className="hidden sm:inline">개요</span>
            </TabsTrigger>
            <TabsTrigger value="map" className="flex items-center space-x-1">
              <Map className="h-4 w-4" />
              <span className="hidden sm:inline">지도</span>
            </TabsTrigger>
            <TabsTrigger value="images" className="flex items-center space-x-1">
              <ImageIcon className="h-4 w-4" />
              <span className="hidden sm:inline">이미지</span>
            </TabsTrigger>
            <TabsTrigger value="checklist" className="flex items-center space-x-1">
              <CheckSquare className="h-4 w-4" />
              <span className="hidden sm:inline">메모</span>
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto mt-4">
            <TabsContent value="overview" className="space-y-4 mt-0">
              {/* 기본 정보 */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-h3 flex items-center space-x-2">
                    <Info className="h-5 w-5 text-primary" />
                    <span>기본 정보</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-body">시간: {item.time}</span>
                  </div>
                  {(item.placeIdOrAddress || item.links.mapUrl) && (
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-body">위치: {item.placeIdOrAddress || item.links.mapUrl}</span>
                    </div>
                  )}
                  {item.links.webUrl && (
                    <div className="flex items-center space-x-2">
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                      <a
                        href={item.links.webUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-body text-primary hover:underline"
                      >
                        웹사이트 방문
                      </a>
                    </div>
                  )}
                  {item.links.tel && (
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <a href={`tel:${item.links.tel}`} className="text-body text-primary hover:underline">
                        {item.links.tel}
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 비용 정보 */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-h3 flex items-center space-x-2">
                    <Banknote className="h-5 w-5 text-primary" />
                    <span>비용</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-caption text-muted-foreground">원화 (KRW)</span>
                    <span className="font-medium text-body">
                      {CURRENCY_SYMBOLS.KRW}
                      {(item.cost.currency === "KRW"
                        ? (item.cost.amount || item.cost.value)
                        : convertCurrency(item.cost.amount || item.cost.value, "JPY", "KRW")
                      ).toLocaleString("ko-KR")}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-caption text-muted-foreground">엔화 (JPY)</span>
                    <span className="font-medium text-body">
                      {CURRENCY_SYMBOLS.JPY}
                      {(item.cost.currency === "JPY"
                        ? (item.cost.amount || item.cost.value)
                        : convertCurrency(item.cost.amount || item.cost.value, "KRW", "JPY")
                      ).toLocaleString("ko-KR")}
                    </span>
                  </div>
                  <div className="text-caption text-muted-foreground text-center pt-2 border-t">
                    환율: 1 JPY = {exchangeRate.toFixed(2)} KRW
                  </div>
                </CardContent>
              </Card>

              {/* 메모 */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-h3 flex items-center space-x-2">
                    <StickyNote className="h-5 w-5 text-primary" />
                    <span>메모</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={notes}
                    onChange={(e) => handleNotesChange(e.target.value)}
                    placeholder="메모를 입력하세요..."
                    className="min-h-[100px] resize-none"
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="map" className="mt-0">
              <Card className="h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="text-h3 flex items-center space-x-2">
                    <Map className="h-5 w-5 text-primary" />
                    <span>지도</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {activeTab === "map" && (
                    <div className="w-full h-[400px] bg-muted rounded-lg flex items-center justify-center">
                      {!mapLoaded ? (
                        <div className="text-center space-y-2">
                          <Button onClick={() => setMapLoaded(true)}>지도 로드하기</Button>
                          <p className="text-caption text-muted-foreground">
                            데이터 사용량을 절약하기 위해 수동으로 로드합니다
                          </p>
                        </div>
                      ) : (
                        <iframe
                          src={getMapEmbedUrl()}
                          width="100%"
                          height="100%"
                          style={{ border: 0 }}
                          allowFullScreen
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                          className="rounded-lg"
                        />
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="images" className="mt-0">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-h3 flex items-center space-x-2">
                    <ImageIcon className="h-5 w-5 text-primary" />
                    <span>이미지</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {item.images && item.images.length > 0 ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-2">
                        {item.images.map((imageUrl, index) => (
                          <div key={index} className="relative aspect-[3/2] overflow-hidden rounded-lg">
                            <Image
                              src={imageUrl || "/placeholder.svg"}
                              alt={`${item.name || item.title} 이미지 ${index + 1}`}
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 50vw, 25vw"
                            />
                            <Button
                              variant="destructive"
                              size="sm"
                              className="absolute top-1 right-1"
                              onClick={() => handleRemoveImage(index)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                      <ImageUpload 
                        onChange={handleAddImage} 
                        placeholder="추가 이미지 업로드" 
                        aspectRatio="3:2" 
                      />
                    </div>
                  ) : (
                    <ImageUpload
                      onChange={handleAddImage}
                      placeholder="이미지를 업로드하거나 URL을 입력하세요"
                      aspectRatio="3:2"
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="checklist" className="mt-0 space-y-4">
              {/* 체크리스트 */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-h3 flex items-center space-x-2">
                    <CheckSquare className="h-5 w-5 text-primary" />
                    <span>체크리스트</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* 새 아이템 추가 */}
                  <div className="flex space-x-2">
                    <Input
                      value={newChecklistItem}
                      onChange={(e) => setNewChecklistItem(e.target.value)}
                      placeholder="새 체크리스트 아이템..."
                      onKeyPress={(e) => e.key === "Enter" && addChecklistItem()}
                      className="touch-target"
                    />
                    <Button onClick={addChecklistItem} size="sm" className="touch-target">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* 체크리스트 아이템들 */}
                  <div className="space-y-2">
                    {checklist.map((checkItem) => (
                      <div key={checkItem.id} className="flex items-center space-x-2 group touch-target">
                        <Checkbox
                          checked={checkItem.completed}
                          onCheckedChange={() => toggleChecklistItem(checkItem.id)}
                        />
                        <span
                          className={`flex-1 text-body ${checkItem.completed ? "line-through text-muted-foreground" : ""}`}
                        >
                          {checkItem.text}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeChecklistItem(checkItem.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity touch-target"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  {checklist.length === 0 && (
                    <div className="text-center py-4 text-muted-foreground text-caption">체크리스트가 비어있습니다</div>
                  )}
                </CardContent>
              </Card>

              {/* 추가 메모 */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-h3 flex items-center space-x-2">
                    <StickyNote className="h-5 w-5 text-primary" />
                    <span>추가 메모</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={notes}
                    onChange={(e) => handleNotesChange(e.target.value)}
                    placeholder="추가 메모나 특별한 정보를 입력하세요..."
                    className="min-h-[120px] resize-none"
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </SheetContent>
    </Sheet>
  )
}
