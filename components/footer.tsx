"use client"
import { Button } from "@/components/ui/button"
import { Download, Plus, Share2 } from "lucide-react"

interface FooterProps {
  onExportPNG: () => void
  onAddItem?: () => void
  onShare?: () => void
}

export function Footer({ onExportPNG, onAddItem, onShare }: FooterProps) {
  return (
    <footer className="sticky bottom-0 z-50 w-full border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 max-w-md mx-auto">
        <Button
          onClick={onExportPNG}
          variant="outline"
          size="sm"
          className="touch-target bg-transparent"
          aria-label="일정을 PNG 이미지로 내보내기"
        >
          <Download className="h-4 w-4 mr-2" />
          PNG 내보내기
        </Button>

        {onAddItem && (
          <Button onClick={onAddItem} size="sm" className="touch-target" aria-label="새 일정 아이템 추가">
            <Plus className="h-4 w-4 mr-2" />
            일정 추가
          </Button>
        )}

        {onShare && (
          <Button
            onClick={onShare}
            variant="outline"
            size="sm"
            className="touch-target bg-transparent"
            aria-label="일정 공유하기"
          >
            <Share2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </footer>
  )
}
