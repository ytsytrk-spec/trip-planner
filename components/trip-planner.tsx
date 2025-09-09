"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Header } from "./header"
import { Footer } from "./footer"
import { BudgetModal } from "./budget-modal"
import { AddItineraryModal } from "./add-itinerary-modal"
import { ItineraryEditScreen } from "./itinerary-edit-screen"
import { DayCard } from "./day-card"
import { ImageUpload } from "./image-upload"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Plus, Edit, ImageIcon } from "lucide-react"
import type { Itinerary, TripData, DayItinerary, ItineraryItem } from "@/types/itinerary"
import html2canvas from "html2canvas"

const sampleTripData: TripData = {
  id: "kansai-trip-2024",
  title: "간사이 3박4일 여행",
  startDate: "2024-12-03",
  endDate: "2024-12-06",
  exchangeRate: 9.2,
  participants: 2,
  days: [
    {
      id: "day1",
      date: "2024-12-03",
      dayOfWeek: "수요일",
      city: "교토",
      accommodation: "20 Pieces",
      items: [
        {
          id: "item1-1",
          time: "14:00",
          name: "간사이공항(KIX) 도착",
          category: "transportation",
          cost: { amount: 0, currency: "JPY" },
          links: {
            map: "간사이국제공항",
            website: "https://www.kansai-airport.or.jp",
          },
          memo: "KE723 항공편으로 도착",
          imageUrl: "/-----.jpg",
        },
        {
          id: "item1-2",
          time: "16:30",
          name: "교토역 도착 (HARUKA 특급)",
          category: "transportation",
          cost: { amount: 3600, currency: "JPY" },
          links: {
            map: "교토역",
            website: "https://www.jr-odekake.net",
          },
          memo: "75분 소요, IC카드 구매",
        },
        {
          id: "item1-3",
          time: "18:00",
          name: "니시키 시장 점심",
          category: "dining",
          cost: { amount: 2500, currency: "JPY" },
          links: {
            map: "니시키시장",
            website: "https://www.kyoto-nishiki.or.jp",
          },
          memo: "교토의 부엌, 다양한 길거리 음식",
          imageUrl: "/-----------.jpg",
        },
        {
          id: "item1-4",
          time: "19:30",
          name: "금각사(킨카쿠지) 관람",
          category: "sightseeing",
          cost: { amount: 600, currency: "JPY" },
          links: {
            map: "금각사",
            website: "https://www.shokoku-ji.jp/kinkakuji",
          },
          memo: "석양 시간대가 가장 아름다움",
          imageUrl: "/------.jpg",
        },
        {
          id: "item1-5",
          time: "21:00",
          name: "기온 거리 산책",
          category: "sightseeing",
          cost: { amount: 0, currency: "JPY" },
          links: {
            map: "기온거리",
            website: "https://www.gion.or.jp",
          },
          memo: "전통 건축물과 게이샤 문화 체험",
        },
        {
          id: "item1-6",
          time: "22:30",
          name: "20 Pieces 체크인",
          category: "rest",
          cost: { amount: 25000, currency: "JPY" },
          links: {
            map: "20 Pieces 호텔",
            website: "https://20pieces.jp",
          },
          memo: "부티크 호텔, 체크인 시간 확인 필요",
        },
      ],
    },
    {
      id: "day2",
      date: "2024-12-04",
      dayOfWeek: "목요일",
      city: "교토",
      accommodation: "아사노야 료칸",
      items: [
        {
          id: "item2-1",
          time: "07:00",
          name: "호텔 조식",
          category: "dining",
          cost: { amount: 3000, currency: "JPY" },
          links: {},
          memo: "일식 조식 세트",
        },
        {
          id: "item2-2",
          time: "09:00",
          name: "아라시야마 대나무 숲",
          category: "sightseeing",
          cost: { amount: 0, currency: "JPY" },
          links: {
            map: "아라시야마 대나무숲",
            website: "https://www.arashiyama-kyoto.com",
          },
          memo: "오전 햇살이 가장 아름다운 시간",
          imageUrl: "/-------------.jpg",
        },
        {
          id: "item2-3",
          time: "11:30",
          name: "텐류지 절 관람",
          category: "sightseeing",
          cost: { amount: 600, currency: "JPY" },
          links: {
            map: "텐류지",
            website: "https://www.tenryuji.com",
          },
          memo: "세계문화유산, 정원 입장료 별도 500엔",
        },
        {
          id: "item2-4",
          time: "13:00",
          name: "아라시야마 점심",
          category: "dining",
          cost: { amount: 4500, currency: "JPY" },
          links: {
            map: "아라시야마 맛집거리",
          },
          memo: "토후 요리 전문점",
        },
        {
          id: "item2-5",
          time: "15:00",
          name: "유무라온천 이동",
          category: "transportation",
          cost: { amount: 1200, currency: "JPY" },
          links: {
            map: "유무라온천역",
          },
          memo: "한큐선 + 신테츠선 환승, 2시간 소요",
        },
        {
          id: "item2-6",
          time: "17:30",
          name: "아사노야 료칸 체크인",
          category: "rest",
          cost: { amount: 45000, currency: "JPY" },
          links: {
            map: "아사노야 료칸",
            website: "https://asanoya-arima.com",
          },
          memo: "전통 료칸, 온천 포함",
        },
      ],
    },
    {
      id: "day3",
      date: "2024-12-05",
      dayOfWeek: "금요일",
      city: "아리마",
      accommodation: "Candeo Hotels The Tower",
      items: [
        {
          id: "item3-1",
          time: "08:00",
          name: "료칸 조식",
          category: "dining",
          cost: { amount: 0, currency: "JPY" },
          links: {},
          memo: "료칸 포함 조식",
        },
        {
          id: "item3-2",
          time: "10:00",
          name: "긴센 온천 입욕",
          category: "rest",
          cost: { amount: 3000, currency: "JPY" },
          links: {
            map: "긴센온천",
            website: "https://kinsen.ne.jp",
          },
          memo: "철분이 많아 갈색빛, 아리마 대표 온천",
          imageUrl: "/--------.jpg",
        },
        {
          id: "item3-3",
          time: "12:00",
          name: "아리마 온천가 산책",
          category: "sightseeing",
          cost: { amount: 0, currency: "JPY" },
          links: {
            map: "아리마온천가",
          },
          memo: "온천 마을 분위기 만끽",
        },
        {
          id: "item3-4",
          time: "14:00",
          name: "오사카 이동",
          category: "transportation",
          cost: { amount: 800, currency: "JPY" },
          links: {
            map: "오사카역",
          },
          memo: "신테츠선, 1시간 소요",
        },
        {
          id: "item3-5",
          time: "16:00",
          name: "우메다 주변 쇼핑",
          category: "sightseeing",
          cost: { amount: 15000, currency: "JPY" },
          links: {
            map: "우메다",
            website: "https://www.hanshin.co.jp",
          },
          memo: "한신백화점, 다이마루 등",
        },
        {
          id: "item3-6",
          time: "19:00",
          name: "Candeo Hotels 체크인",
          category: "rest",
          cost: { amount: 18000, currency: "JPY" },
          links: {
            map: "Candeo Hotels The Tower",
            website: "https://www.candeohotels.com",
          },
          memo: "오사카 시내 중심가 위치",
        },
        {
          id: "item3-7",
          time: "20:30",
          name: "도톤보리 저녁",
          category: "dining",
          cost: { amount: 8000, currency: "JPY" },
          links: {
            map: "도톤보리",
            website: "https://dotonbori.or.jp",
          },
          memo: "오사카 대표 먹거리 거리",
          imageUrl: "/------------.jpg",
        },
      ],
    },
    {
      id: "day4",
      date: "2024-12-06",
      dayOfWeek: "토요일",
      city: "오사카",
      accommodation: "없음 (출국일)",
      items: [
        {
          id: "item4-1",
          time: "09:00",
          name: "호텔 체크아웃",
          category: "rest",
          cost: { amount: 0, currency: "JPY" },
          links: {},
          memo: "짐 보관 서비스 이용",
        },
        {
          id: "item4-2",
          time: "10:00",
          name: "오사카성 관람",
          category: "sightseeing",
          cost: { amount: 600, currency: "JPY" },
          links: {
            map: "오사카성",
            website: "https://www.osakacastle.net",
          },
          memo: "천수각 입장료, 오사카 대표 명소",
          imageUrl: "/--------.jpg",
        },
        {
          id: "item4-3",
          time: "12:30",
          name: "오사카성 공원 산책",
          category: "sightseeing",
          cost: { amount: 0, currency: "JPY" },
          links: {
            map: "오사카성공원",
          },
          memo: "마지막 여유로운 시간",
        },
        {
          id: "item4-4",
          time: "14:00",
          name: "간사이공항 이동 (HARUKA)",
          category: "transportation",
          cost: { amount: 2900, currency: "JPY" },
          links: {
            map: "간사이국제공항",
          },
          memo: "출국 2시간 전 도착 목표",
        },
        {
          id: "item4-5",
          time: "17:00",
          name: "KE724 출국",
          category: "transportation",
          cost: { amount: 0, currency: "JPY" },
          links: {},
          memo: "인천공항 도착 19:30 (현지시간)",
        },
      ],
    },
  ],
}

const convertLegacyData = (legacyItineraries: Itinerary[]): TripData => {
  return {
    id: "converted-trip",
    title: "간사이 3박4일 여행",
    startDate: legacyItineraries[0]?.date || "2024-12-03",
    endDate: legacyItineraries[legacyItineraries.length - 1]?.date || "2024-12-06",
    exchangeRate: 9.2,
    participants: 2,
    days: legacyItineraries.map((itinerary) => ({
      id: itinerary.id,
      date: itinerary.date,
      dayOfWeek: itinerary.dayOfWeek,
      city: itinerary.title.includes("교토") ? "교토" : itinerary.title.includes("아리마") ? "아리마" : "오사카",
      accommodation: itinerary.accommodation,
      items: itinerary.timeline.map((timeline, index) => ({
        id: `${itinerary.id}-${index}`,
        time: timeline.time,
        name: timeline.activity,
        category:
          timeline.activity.includes("식사") || timeline.activity.includes("저녁")
            ? "dining"
            : timeline.activity.includes("이동") || timeline.activity.includes("도착")
              ? "transportation"
              : timeline.activity.includes("체크인") || timeline.activity.includes("휴식")
                ? "rest"
                : "sightseeing",
        cost: { amount: 0, currency: "JPY" as const },
        links: {},
        memo: "",
      })),
    })),
  }
}

export function TripPlanner() {
  const [tripData, setTripData] = useState<TripData>(sampleTripData)
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<ItineraryItem | null>(null)
  const [selectedDay, setSelectedDay] = useState<DayItinerary | null>(null)
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingDay, setEditingDay] = useState<DayItinerary | null>(null)
  const [isEditScreenOpen, setIsEditScreenOpen] = useState(false)
  const [thumbnailEditDay, setThumbnailEditDay] = useState<DayItinerary | null>(null)
  const [isThumbnailModalOpen, setIsThumbnailModalOpen] = useState(false)
  const { toast } = useToast()
  const [legacyItineraries, setLegacyItineraries] = useState<Itinerary[]>([])

  useEffect(() => {
    const savedTripData = localStorage.getItem("kansai-trip-data")
    const savedItineraries = localStorage.getItem("kansai-itineraries")

    if (savedTripData) {
      setTripData(JSON.parse(savedTripData))
    } else if (savedItineraries) {
      const legacy = JSON.parse(savedItineraries)
      setLegacyItineraries(legacy)
      const converted = convertLegacyData(legacy)
      setTripData(converted)
    } else {
      setTripData(sampleTripData)
    }
  }, [])

  useEffect(() => {
    if (tripData.days.length > 0) {
      localStorage.setItem("kansai-trip-data", JSON.stringify(tripData))
    }
  }, [tripData])

  const handleItemClick = (item: ItineraryItem, day: DayItinerary) => {
    setSelectedItem(item)
    setSelectedDay(day)
    setIsBottomSheetOpen(true)
  }

  const handleDayClick = (day: DayItinerary) => {
    setSelectedDay(day)
    setSelectedItem(null)
    setIsBottomSheetOpen(true)
  }

  const handleEditDay = (day: DayItinerary) => {
    setEditingDay(day)
    setIsEditScreenOpen(true)
    setIsBottomSheetOpen(false)
  }

  const handleSaveDay = (updatedDay: DayItinerary) => {
    setTripData((prev) => ({
      ...prev,
      days: prev.days.map((day) => (day.id === updatedDay.id ? updatedDay : day)),
    }))
  }

  const handleUpdateItem = (updatedItem: ItineraryItem) => {
    if (!selectedDay) return

    setTripData((prev) => ({
      ...prev,
      days: prev.days.map((day) =>
        day.id === selectedDay.id
          ? {
              ...day,
              items: day.items.map((item) => (item.id === updatedItem.id ? updatedItem : item)),
            }
          : day,
      ),
    }))
  }

  const handleDeleteItem = (itemId: string, dayId: string) => {
    setTripData((prev) => ({
      ...prev,
      days: prev.days.map((day) =>
        day.id === dayId
          ? {
              ...day,
              items: day.items.filter((item) => item.id !== itemId),
            }
          : day,
      ),
    }))
    setIsBottomSheetOpen(false)
    toast({
      title: "아이템 삭제 완료",
      description: "일정 아이템이 삭제되었습니다.",
    })
  }

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(tripData, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = "kansai-trip-data.json"
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleImportJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target?.result as string)
          if (importedData.days && Array.isArray(importedData.days)) {
            setTripData(importedData)
          } else if (Array.isArray(importedData)) {
            const converted = convertLegacyData(importedData)
            setTripData(converted)
          }
        } catch (error) {
          console.error("JSON 파일을 읽는 중 오류가 발생했습니다:", error)
        }
      }
      reader.readAsText(file)
    }
    event.target.value = ""
  }

  const handleExportPNG = async () => {
    try {
      toast({
        title: "PNG 내보내기 시작",
        description: "이미지를 생성하고 있습니다...",
      })

      const exportElement = document.createElement("div")
      exportElement.style.cssText = `
        position: fixed;
        top: -9999px;
        left: -9999px;
        width: 800px;
        background: white;
        padding: 40px;
        font-family: 'Noto Sans KR', system-ui, sans-serif;
        font-size: 16px;
        line-height: 1.5;
        color: #111827;
      `

      const totalBudget = tripData.days.reduce(
        (sum, day) =>
          sum +
          day.items.reduce((daySum, item) => {
            const costInJPY = item.cost.currency === "JPY" ? item.cost.amount : item.cost.amount / tripData.exchangeRate
            return daySum + costInJPY
          }, 0),
        0,
      )

      exportElement.innerHTML = `
        <div style="text-align: center; margin-bottom: 40px; border-bottom: 2px solid #059669; padding-bottom: 20px;">
          <h1 style="font-size: 32px; font-weight: bold; color: #059669; margin: 0 0 10px 0;">${tripData.title}</h1>
          <p style="color: #6b7280; font-size: 18px; margin: 0 0 15px 0;">교토 → 아리마 → 오사카</p>
          <div style="display: flex; justify-content: center; gap: 30px; margin-top: 20px;">
            <div style="text-align: center;">
              <div style="color: #059669; font-size: 24px; font-weight: 600;">¥${totalBudget.toLocaleString()}</div>
              <div style="color: #6b7280; font-size: 14px;">총 예산</div>
            </div>
            <div style="text-align: center;">
              <div style="color: #059669; font-size: 24px; font-weight: 600;">${tripData.participants}명</div>
              <div style="color: #6b7280; font-size: 14px;">여행 인원</div>
            </div>
            <div style="text-align: center;">
              <div style="color: #059669; font-size: 24px; font-weight: 600;">¥${Math.round(totalBudget / tripData.participants).toLocaleString()}</div>
              <div style="color: #6b7280; font-size: 14px;">1인당 예산</div>
            </div>
          </div>
        </div>
        
        ${tripData.days
          .map(
            (day, dayIndex) => `
          <div style="margin-bottom: 35px; border: 2px solid #e5e7eb; border-radius: 12px; padding: 25px; background: #f9fafb;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid #e5e7eb; padding-bottom: 15px;">
              <div>
                <h2 style="font-size: 22px; font-weight: 600; color: #111827; margin: 0 0 5px 0;">Day ${dayIndex + 1}. ${day.city} 일정</h2>
                <div style="color: #6b7280; font-size: 16px;">${new Date(day.date).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric", weekday: "long" })}</div>
                ${day.accommodation && day.accommodation !== "없음 (출국일)" ? `<div style="color: #059669; font-size: 14px; margin-top: 5px;">🏨 ${day.accommodation}</div>` : ""}
              </div>
              <div style="text-align: right;">
                <div style="color: #059669; font-weight: 600; font-size: 20px;">¥${day.items
                  .reduce((sum, item) => {
                    const costInJPY =
                      item.cost.currency === "JPY" ? item.cost.amount : item.cost.amount / tripData.exchangeRate
                    return sum + costInJPY
                  }, 0)
                  .toLocaleString()}</div>
                <div style="color: #6b7280; font-size: 12px;">${day.items.length}개 일정</div>
              </div>
            </div>
            
            <div style="display: grid; gap: 12px;">
              ${day.items
                .map(
                  (item, itemIndex) => `
                <div style="display: flex; align-items: center; padding: 15px; background: white; border-radius: 8px; border-left: 4px solid ${
                  item.category === "sightseeing"
                    ? "#3b82f6"
                    : item.category === "dining"
                      ? "#f59e0b"
                      : item.category === "transportation"
                        ? "#10b981"
                        : "#8b5cf6"
                };">
                  <div style="min-width: 60px; text-align: center; margin-right: 15px;">
                    <div style="color: #059669; font-weight: 600; font-size: 14px;">${item.time}</div>
                  </div>
                  <div style="flex: 1;">
                    <div style="font-weight: 600; color: #111827; margin-bottom: 2px;">${item.name}</div>
                    <div style="color: #6b7280; font-size: 13px;">${item.memo || ""}</div>
                  </div>
                  <div style="text-align: right; margin-left: 15px;">
                    <div style="color: #059669; font-weight: 600; font-size: 14px;">
                      ${item.cost.amount > 0 ? `¥${item.cost.amount.toLocaleString()}` : "무료"}
                    </div>
                    <div style="color: #6b7280; font-size: 11px; text-transform: capitalize;">
                      ${
                        item.category === "sightseeing"
                          ? "관광"
                          : item.category === "dining"
                            ? "식사"
                            : item.category === "transportation"
                              ? "이동"
                              : "휴식"
                      }
                    </div>
                  </div>
                </div>
              `,
                )
                .join("")}
            </div>
          </div>
        `,
          )
          .join("")}
        
        <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 2px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px; margin: 0;">
            ${tripData.title} • 생성일: ${new Date().toLocaleDateString("ko-KR")} • 환율: ¥1 = ₩${tripData.exchangeRate}
          </p>
        </div>
      `

      document.body.appendChild(exportElement)

      await new Promise((resolve) => setTimeout(resolve, 500))

      const canvas = await html2canvas(exportElement)
      const link = document.createElement("a")
      link.download = `간사이-여행일정-${new Date().toISOString().split("T")[0]}.png`
      link.href = canvas.toDataURL("image/png", 1.0)
      link.click()

      document.body.removeChild(exportElement)

      toast({
        title: "PNG 내보내기 완료",
        description: "여행 일정이 이미지로 저장되었습니다.",
      })
    } catch (error) {
      console.error("PNG 내보내기 실패:", error)
      toast({
        title: "내보내기 실패",
        description: "이미지 생성 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    }
  }

  const handleEditThumbnail = (day: DayItinerary) => {
    setThumbnailEditDay(day)
    setIsThumbnailModalOpen(true)
  }

  const handleSaveThumbnail = (imageUrl: string) => {
    if (!thumbnailEditDay) return

    setTripData((prev) => ({
      ...prev,
      days: prev.days.map((day) => (day.id === thumbnailEditDay.id ? { ...day, coverImage: imageUrl } : day)),
    }))

    setIsThumbnailModalOpen(false)
    setThumbnailEditDay(null)

    toast({
      title: "썸네일 업데이트 완료",
      description: "Day 카드 썸네일이 변경되었습니다.",
    })
  }

  const handleTitleChange = (newTitle: string) => {
    setTripData((prev) => ({
      ...prev,
      title: newTitle,
    }))
    toast({
      title: "제목 변경 완료",
      description: `여행 제목이 "${newTitle}"로 변경되었습니다.`,
    })
  }

  const getTripSummary = () => {
    const cities = [...new Set(tripData.days.map((day) => day.city))].join(" → ")
    const totalBudget = tripData.days.reduce(
      (sum, day) =>
        sum +
        day.items.reduce((daySum, item) => {
          const costInJPY = item.cost.currency === "JPY" ? item.cost.amount : item.cost.amount / tripData.exchangeRate
          return daySum + costInJPY
        }, 0),
      0,
    )

    return {
      cities,
      totalBudget,
      perPersonBudget: Math.round(totalBudget / tripData.participants),
    }
  }

  const tripSummary = getTripSummary()

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        onBudgetClick={() => setIsBudgetModalOpen(true)}
        title={tripData.title}
        onTitleChange={handleTitleChange}
      />

      <div className="flex-1 px-4 py-6">
        <div className="max-w-md mx-auto space-y-4">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-foreground mb-2">{tripData.title}</h1>
            <p className="text-muted-foreground">{tripSummary.cities}</p>
            <div className="flex justify-center items-center gap-4 text-sm text-muted-foreground mt-2">
              <span>{tripData.participants}명</span>
              <span>•</span>
              <span>환율: ¥1 = ₩{tripData.exchangeRate}</span>
              <span>•</span>
              <span>총 ¥{tripSummary.totalBudget.toLocaleString()}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              1인당 ¥{tripSummary.perPersonBudget.toLocaleString()} (₩
              {Math.round(tripSummary.perPersonBudget * tripData.exchangeRate).toLocaleString()})
            </p>
          </div>

          <div className="flex gap-2 mb-4">
            <Button onClick={() => setIsAddModalOpen(true)} className="flex-1" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              일정 추가
            </Button>
            <Button variant="outline" onClick={handleExportJSON} size="sm">
              JSON 내보내기
            </Button>
            <Button variant="outline" size="sm" asChild>
              <label className="cursor-pointer">
                JSON 가져오기
                <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
              </label>
            </Button>
          </div>

          <div className="space-y-4">
            {tripData.days.map((day) => (
              <div key={day.id} className="relative">
                <DayCard
                  day={day}
                  exchangeRate={tripData.exchangeRate}
                  onViewDetails={() => handleDayClick(day)}
                  onExportPNG={handleExportPNG}
                />

                <div className="absolute top-2 right-2 flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleEditThumbnail(day)
                    }}
                    className="h-8 w-8 p-0 bg-white/80 hover:bg-white/90 backdrop-blur-sm"
                  >
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleEditDay(day)
                    }}
                    className="h-8 w-8 p-0 bg-white/80 hover:bg-white/90 backdrop-blur-sm"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer onExportPNG={handleExportPNG} />

      <Dialog open={isThumbnailModalOpen} onOpenChange={setIsThumbnailModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>썸네일 이미지 설정</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">{thumbnailEditDay?.city} 일정의 대표 이미지를 설정하세요.</p>
            <ImageUpload
              currentImage={thumbnailEditDay?.coverImage}
              onImageChange={handleSaveThumbnail}
              aspectRatio="16:9"
            />
          </div>
        </DialogContent>
      </Dialog>

      <BudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        tripData={tripData}
        onUpdateTripData={setTripData}
      />

      <AddItineraryModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false)
          setEditingDay(null)
        }}
        onSave={() => {}}
        editingItinerary={null}
      />

      {isEditScreenOpen && editingDay && (
        <ItineraryEditScreen
          dayData={editingDay}
          exchangeRate={tripData.exchangeRate}
          participants={tripData.participants}
          onSave={handleSaveDay}
          onClose={() => {
            setIsEditScreenOpen(false)
            setEditingDay(null)
          }}
        />
      )}
    </div>
  )
}
