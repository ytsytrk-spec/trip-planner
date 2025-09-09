"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Upload, Link, X, ImageIcon } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import Image from "next/image"

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  onRemove?: () => void
  placeholder?: string
  aspectRatio?: "16:9" | "1:1" | "4:3"
  maxSize?: number // MB
}

export function ImageUpload({
  value,
  onChange,
  onRemove,
  placeholder = "이미지를 업로드하거나 URL을 입력하세요",
  aspectRatio = "16:9",
  maxSize = 5,
}: ImageUploadProps) {
  const [urlInput, setUrlInput] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const aspectClasses = {
    "16:9": "aspect-video",
    "1:1": "aspect-square",
    "4:3": "aspect-[4/3]",
  }

  const handleFileUpload = async (file: File) => {
    if (file.size > maxSize * 1024 * 1024) {
      toast({
        title: "파일 크기 초과",
        description: `파일 크기는 ${maxSize}MB 이하여야 합니다.`,
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)
    try {
      // Convert to data URL for local storage
      const reader = new FileReader()
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string
        onChange(dataUrl)
        toast({
          title: "이미지 업로드 완료",
          description: "이미지가 성공적으로 업로드되었습니다.",
        })
      }
      reader.readAsDataURL(file)
    } catch (error) {
      toast({
        title: "업로드 실패",
        description: "이미지 업로드 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleUrlSubmit = () => {
    if (!urlInput.trim()) return

    // Basic URL validation
    try {
      new URL(urlInput)
      onChange(urlInput)
      setUrlInput("")
      toast({
        title: "이미지 URL 추가 완료",
        description: "이미지 URL이 성공적으로 추가되었습니다.",
      })
    } catch {
      toast({
        title: "잘못된 URL",
        description: "올바른 이미지 URL을 입력해주세요.",
        variant: "destructive",
      })
    }
  }

  if (value) {
    return (
      <Card className="relative overflow-hidden">
        <div className={`${aspectClasses[aspectRatio]} relative`}>
          <Image
            src={value || "/placeholder.svg"}
            alt="업로드된 이미지"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          {onRemove && (
            <Button variant="destructive" size="sm" className="absolute top-2 right-2" onClick={onRemove}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card
        className={`${aspectClasses[aspectRatio]} border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors`}
      >
        <div className="h-full flex flex-col items-center justify-center p-6 text-center">
          <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-sm text-muted-foreground mb-4">{placeholder}</p>

          <div className="flex flex-col sm:flex-row gap-2 w-full max-w-xs">
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex-1"
            >
              <Upload className="h-4 w-4 mr-2" />
              {isUploading ? "업로드 중..." : "파일 선택"}
            </Button>
          </div>
        </div>
      </Card>

      <div className="flex gap-2">
        <Input
          placeholder="이미지 URL 입력"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleUrlSubmit()}
        />
        <Button onClick={handleUrlSubmit} variant="outline">
          <Link className="h-4 w-4" />
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFileUpload(file)
        }}
      />
    </div>
  )
}
