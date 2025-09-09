export interface ItineraryItem {
  id: string
  time: string
  name: string // 실제 사용되는 필드명
  title?: string // 호환성을 위한 필드
  category: "이동" | "식사" | "관광" | "휴식" | "sightseeing" | "dining" | "transportation" | "rest" // 기존 데이터 호환
  cost: {
    amount: number // 실제 사용되는 필드명
    value?: number // 호환성을 위한 필드
    currency: "JPY" | "KRW"
  }
  links: {
    map?: string // 실제 사용되는 필드명
    mapUrl?: string // 호환성을 위한 필드
    website?: string // 실제 사용되는 필드명
    webUrl?: string // 호환성을 위한 필드
    tel?: string
  }
  placeIdOrAddress?: string
  memo?: string
  imageUrl?: string // 실제 사용되는 필드명
  images?: string[] // 호환성을 위한 필드
}

export interface DayItinerary {
  id: string
  date: string
  dayOfWeek?: string // 실제 사용되는 필드명
  city?: string // 실제 사용되는 필드명
  title?: string // 호환성을 위한 필드
  accommodation?: string // 실제 사용되는 필드명
  lodging?: string // 호환성을 위한 필드
  budgetHint?: string
  coverImage?: string
  items: ItineraryItem[]
}

export interface TripData {
  id: string
  title: string
  startDate: string
  endDate: string
  days: DayItinerary[]
  exchangeRate: number
  participants: number
  totalBudget?: number
  budgetCurrency?: "JPY" | "KRW"
}

export interface ExchangeRateCache {
  rate: number
  timestamp: number
  source: "api" | "manual" | "cache"
}

export interface BudgetSummary {
  totalJPY: number
  totalKRW: number
  perPersonJPY: number
  perPersonKRW: number
  dailyTotals: Array<{
    dayId: string
    totalJPY: number
    totalKRW: number
  }>
}

export interface ImageUpload {
  id: string
  url: string
  type: "url" | "upload"
  filename?: string
  size?: number
}

export const CATEGORY_LABELS = {
  이동: "이동",
  식사: "식사",
  관광: "관광",
  휴식: "휴식",
} as const

export const CATEGORY_ICONS = {
  이동: "",
  식사: "️",
  관광: "📸",
  휴식: "☕",
} as const

export const CATEGORY_COLORS = {
  이동: "category-transport",
  식사: "category-food",
  관광: "category-sightseeing",
  휴식: "category-rest",
} as const

export const CURRENCY_SYMBOLS = {
  JPY: "¥",
  KRW: "₩",
} as const

export const createEmptyDay = (date: string): DayItinerary => ({
  id: crypto.randomUUID(),
  date,
  title: "",
  lodging: "",
  items: [],
})

export const createEmptyItem = (): ItineraryItem => ({
  id: crypto.randomUUID(),
  time: "09:00",
  name: "",
  title: "",
  category: "관광",
  cost: {
    amount: 0,
    value: 0,
    currency: "JPY",
  },
  links: {},
  memo: "",
})

export const validateTripData = (data: any): data is TripData => {
  return (
    data &&
    typeof data.id === "string" &&
    typeof data.title === "string" &&
    Array.isArray(data.days) &&
    typeof data.participants === "number"
  )
}

export const migrateLegacyData = (data: any): TripData => {
  // Handle migration from old schema to new schema
  if (data.days) {
    data.days = data.days.map((day: any) => ({
      ...day,
      title: day.city || day.title || "",
      lodging: day.accommodation || day.lodging || "",
      items:
        day.items?.map((item: any) => ({
          ...item,
          name: item.name || item.title || "",
          title: item.title || item.name || "",
          category:
            item.category === "sightseeing"
              ? "관광"
              : item.category === "dining"
                ? "식사"
                : item.category === "transportation"
                  ? "이동"
                  : item.category === "rest"
                    ? "휴식"
                    : "관광",
          cost: {
            amount: item.cost?.amount || item.cost?.value || 0,
            value: item.cost?.value || item.cost?.amount || 0,
            currency: item.cost?.currency || "JPY",
          },
          links: {
            map: item.links?.map || item.links?.mapUrl,
            mapUrl: item.links?.mapUrl || item.links?.map,
            website: item.links?.website || item.links?.webUrl,
            webUrl: item.links?.webUrl || item.links?.website,
            tel: item.links?.tel,
          },
          imageUrl: item.imageUrl,
          images: item.imageUrl ? [item.imageUrl] : item.images || [],
        })) || [],
    }))
  }
  return data as TripData
}
