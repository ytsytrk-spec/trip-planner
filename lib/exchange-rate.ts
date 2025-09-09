import { toast } from "@/hooks/use-toast"

interface ExchangeRateResponse {
  rates: {
    KRW: number
  }
  base: string
  date: string
}

interface CachedRate {
  rate: number
  timestamp: number
  source: "api" | "manual" | "fallback"
  lastUpdated: string
}

const CACHE_KEY = "exchange_rate_cache"
const CACHE_DURATION = 60 * 60 * 1000 // 60분
const FALLBACK_RATE = 9.2 // 기본 환율

export async function fetchExchangeRate(showToast = true): Promise<{ rate: number; source: string }> {
  // 캐시 확인
  const cached = getCachedRate()
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return { rate: cached.rate, source: cached.source }
  }

  // API 목록 (우선순위 순)
  const apis = [
    {
      name: "exchangerate.host",
      url: "https://api.exchangerate.host/latest?base=JPY&symbols=KRW",
      parser: (data: any) => data.rates?.KRW,
    },
    {
      name: "exchangerate-api.com",
      url: "https://api.exchangerate-api.com/v4/latest/JPY",
      parser: (data: any) => data.rates?.KRW,
    },
  ]

  for (const api of apis) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10초 타임아웃

      const response = await fetch(api.url, {
        signal: controller.signal,
        headers: {
          Accept: "application/json",
        },
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      const rate = api.parser(data)

      if (!rate || rate <= 0 || isNaN(rate)) {
        throw new Error("유효하지 않은 환율 데이터")
      }

      // 성공적으로 가져온 경우
      setCachedRate(rate, "api")

      if (showToast) {
        toast({
          title: "환율 업데이트 완료",
          description: `1 JPY = ${rate.toFixed(2)} KRW (${api.name})`,
        })
      }

      return { rate, source: "api" }
    } catch (error) {
      console.warn(`${api.name} API 실패:`, error)
      continue
    }
  }

  // 모든 API 실패 시 캐시된 값 사용
  if (cached) {
    if (showToast) {
      toast({
        title: "네트워크 오류",
        description: `캐시된 환율을 사용합니다 (${cached.lastUpdated})`,
        variant: "destructive",
      })
    }
    return { rate: cached.rate, source: "cache" }
  }

  // 캐시도 없으면 기본값 사용
  setCachedRate(FALLBACK_RATE, "fallback")

  if (showToast) {
    toast({
      title: "환율 가져오기 실패",
      description: `기본 환율을 사용합니다 (1 JPY = ${FALLBACK_RATE} KRW)`,
      variant: "destructive",
    })
  }

  return { rate: FALLBACK_RATE, source: "fallback" }
}

export function setManualExchangeRate(rate: number): void {
  if (rate > 0 && !isNaN(rate)) {
    setCachedRate(rate, "manual")
    toast({
      title: "환율 수동 설정",
      description: `1 JPY = ${rate.toFixed(2)} KRW로 설정되었습니다`,
    })
  }
}

function getCachedRate(): CachedRate | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY)
    return cached ? JSON.parse(cached) : null
  } catch {
    return null
  }
}

function setCachedRate(rate: number, source: "api" | "manual" | "fallback"): void {
  try {
    const cacheData: CachedRate = {
      rate,
      timestamp: Date.now(),
      source,
      lastUpdated: new Date().toLocaleString("ko-KR"),
    }
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData))
  } catch (error) {
    console.error("환율 캐시 저장 실패:", error)
  }
}

export function convertCurrency(
  amount: number,
  fromCurrency: "JPY" | "KRW",
  toCurrency: "JPY" | "KRW",
  exchangeRate: number,
): number {
  if (fromCurrency === toCurrency) return amount
  return fromCurrency === "JPY" ? amount * exchangeRate : amount / exchangeRate
}

export function formatCurrency(amount: number, currency: "JPY" | "KRW"): string {
  return new Intl.NumberFormat(currency === "JPY" ? "ja-JP" : "ko-KR", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: currency === "JPY" ? 0 : 0,
  }).format(amount)
}

export function getExchangeRateStatus(): {
  rate: number
  source: string
  lastUpdated: string
  isExpired: boolean
} | null {
  const cached = getCachedRate()
  if (!cached) return null

  return {
    rate: cached.rate,
    source: cached.source,
    lastUpdated: cached.lastUpdated,
    isExpired: Date.now() - cached.timestamp > CACHE_DURATION,
  }
}
