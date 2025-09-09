import html2canvas from "html2canvas"
import { toast } from "@/hooks/use-toast"
import type { DayItinerary, TripData } from "@/types/itinerary"

export interface ExportOptions {
  scale?: number
  backgroundColor?: string
  format?: "png" | "jpeg"
  quality?: number
  filename?: string
}

export async function exportElementToPNG(element: HTMLElement, options: ExportOptions = {}): Promise<void> {
  const { scale = 2, backgroundColor = "#ffffff", format = "png", quality = 0.95, filename = "itinerary" } = options

  try {
    // 폰트 로딩 대기
    await document.fonts.ready

    const canvas = await html2canvas(element, {
      scale,
      backgroundColor,
      useCORS: true,
      allowTaint: true,
      foreignObjectRendering: true,
      logging: false,
      width: element.scrollWidth,
      height: element.scrollHeight,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
      onclone: (clonedDoc) => {
        // 클론된 문서에서 스타일 최적화
        const clonedElement = clonedDoc.querySelector("[data-export-target]") as HTMLElement
        if (clonedElement) {
          clonedElement.style.transform = "none"
          clonedElement.style.animation = "none"
        }
      },
    })

    // Canvas를 Blob으로 변환
    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob(
        (blob) => {
          resolve(blob!)
        },
        `image/${format}`,
        quality,
      )
    })

    // 파일 다운로드
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${filename}-${new Date().toISOString().split("T")[0]}.${format}`

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    URL.revokeObjectURL(url)

    // 모바일에서 공유 API 사용 시도
    if (navigator.share && /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      try {
        const file = new File([blob], `${filename}.${format}`, { type: `image/${format}` })
        await navigator.share({
          title: "여행 일정",
          text: "간사이 여행 일정을 공유합니다",
          files: [file],
        })
      } catch (shareError) {
        // 공유 실패 시 다운로드로 폴백 (이미 처리됨)
      }
    }

    toast({
      title: "내보내기 완료",
      description: "이미지가 성공적으로 저장되었습니다.",
    })
  } catch (error) {
    console.error("PNG 내보내기 실패:", error)
    toast({
      title: "내보내기 실패",
      description: "이미지 생성 중 오류가 발생했습니다.",
      variant: "destructive",
    })
    throw error
  }
}

export function createPrintLayout(content: string, title = "여행 일정"): string {
  return `
    <div style="
      font-family: 'Noto Sans KR', system-ui, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 30px;
      background: white;
      color: #0B1220;
      line-height: 1.6;
    ">
      <header style="
        text-align: center;
        margin-bottom: 40px;
        padding-bottom: 20px;
        border-bottom: 2px solid #1868FF;
      ">
        <h1 style="
          font-size: 28px;
          font-weight: bold;
          color: #1868FF;
          margin: 0 0 10px 0;
        ">${title}</h1>
        <p style="
          font-size: 14px;
          color: #5B6B82;
          margin: 0;
        ">생성일: ${new Date().toLocaleDateString("ko-KR")}</p>
      </header>
      
      <main style="
        font-size: 15px;
        line-height: 1.6;
      ">
        ${content}
      </main>
      
      <footer style="
        margin-top: 40px;
        padding-top: 20px;
        border-top: 1px solid #E6ECF5;
        text-align: center;
        font-size: 12px;
        color: #9FB0C9;
      ">
        <p>간사이 여행 일정 플래너로 생성됨</p>
      </footer>
    </div>
  `
}

export function formatDayForExport(day: DayItinerary, exchangeRate: number): string {
  const formatCurrency = (amount: number, currency: "JPY" | "KRW") => {
    const symbol = currency === "JPY" ? "¥" : "₩"
    return `${symbol}${amount.toLocaleString("ko-KR")}`
  }

  const categoryIcons = {
    이동: "🚌",
    식사: "🍽️",
    관광: "📸",
    휴식: "☕",
  }

  const dayTotal = day.items.reduce((total, item) => {
    return total + (item.cost.currency === "JPY" ? item.cost.value * exchangeRate : item.cost.value)
  }, 0)

  return `
    <div style="
      margin-bottom: 30px;
      padding: 20px;
      border: 1px solid #E6ECF5;
      border-radius: 12px;
      background: #F7F9FC;
    ">
      <div style="
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
        padding-bottom: 10px;
        border-bottom: 1px solid #E6ECF5;
      ">
        <div>
          <h2 style="
            font-size: 20px;
            font-weight: 600;
            color: #0B1220;
            margin: 0 0 5px 0;
          ">${new Date(day.date).toLocaleDateString("ko-KR", {
            month: "long",
            day: "numeric",
            weekday: "short",
          })} - ${day.title}</h2>
          ${
            day.lodging
              ? `<p style="
            font-size: 14px;
            color: #5B6B82;
            margin: 0;
          ">🏨 ${day.lodging}</p>`
              : ""
          }
        </div>
        <div style="
          text-align: right;
          font-size: 14px;
          color: #1868FF;
          font-weight: 600;
        ">
          ${formatCurrency(dayTotal, "KRW")}
        </div>
      </div>
      
      <div style="space-y: 10px;">
        ${day.items
          .map(
            (item) => `
          <div style="
            display: flex;
            align-items: center;
            padding: 10px 0;
            border-bottom: 1px solid #E6ECF5;
          ">
            <div style="
              width: 60px;
              font-size: 12px;
              color: #5B6B82;
              font-weight: 500;
            ">${item.time}</div>
            
            <div style="
              flex: 1;
              margin-left: 15px;
            ">
              <div style="
                display: flex;
                align-items: center;
                margin-bottom: 2px;
              ">
                <span style="margin-right: 8px;">${categoryIcons[item.category] || "📍"}</span>
                <span style="
                  font-weight: 500;
                  color: #0B1220;
                ">${item.title}</span>
              </div>
              ${
                item.memo
                  ? `<div style="
                font-size: 13px;
                color: #5B6B82;
                margin-top: 2px;
              ">${item.memo}</div>`
                  : ""
              }
            </div>
            
            <div style="
              text-align: right;
              font-size: 13px;
              color: #5B6B82;
            ">
              ${formatCurrency(item.cost.value, item.cost.currency)}
              ${item.cost.currency !== "KRW" ? `<br><span style="font-size: 11px;">(${formatCurrency(item.cost.currency === "JPY" ? item.cost.value * exchangeRate : item.cost.value / exchangeRate, "KRW")})</span>` : ""}
            </div>
          </div>
        `,
          )
          .join("")}
      </div>
    </div>
  `
}

export function formatTripSummaryForExport(tripData: TripData): string {
  const totalCostKRW = tripData.days.reduce((total, day) => {
    return (
      total +
      day.items.reduce((dayTotal, item) => {
        return dayTotal + (item.cost.currency === "JPY" ? item.cost.value * tripData.exchangeRate : item.cost.value)
      }, 0)
    )
  }, 0)

  const totalCostJPY = totalCostKRW / tripData.exchangeRate
  const perPersonCostKRW = totalCostKRW / tripData.participants

  return `
    <div style="
      margin-bottom: 30px;
      padding: 20px;
      background: linear-gradient(135deg, #1868FF 0%, #4C8DFF 100%);
      color: white;
      border-radius: 12px;
    ">
      <h2 style="
        font-size: 22px;
        font-weight: bold;
        margin: 0 0 15px 0;
      ">${tripData.title}</h2>
      
      <div style="
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
        margin-top: 15px;
      ">
        <div>
          <div style="font-size: 14px; opacity: 0.9;">총 비용</div>
          <div style="font-size: 18px; font-weight: 600;">₩${totalCostKRW.toLocaleString("ko-KR")}</div>
          <div style="font-size: 12px; opacity: 0.8;">¥${totalCostJPY.toLocaleString("ko-KR")}</div>
        </div>
        
        <div>
          <div style="font-size: 14px; opacity: 0.9;">1인당 비용</div>
          <div style="font-size: 18px; font-weight: 600;">₩${perPersonCostKRW.toLocaleString("ko-KR")}</div>
          <div style="font-size: 12px; opacity: 0.8;">${tripData.participants}명 기준</div>
        </div>
      </div>
      
      <div style="
        margin-top: 15px;
        padding-top: 15px;
        border-top: 1px solid rgba(255,255,255,0.2);
        font-size: 12px;
        opacity: 0.8;
      ">
        환율: 1 JPY = ${tripData.exchangeRate.toFixed(2)} KRW
      </div>
    </div>
  `
}
