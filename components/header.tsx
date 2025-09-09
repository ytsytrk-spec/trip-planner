"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calculator, Moon, Sun, Edit2, Check, X } from "lucide-react"
import { useTheme } from "next-themes"
import { useState } from "react"

interface HeaderProps {
  onBudgetClick: () => void
  title: string
  onTitleChange: (newTitle: string) => void
}

export function Header({ onBudgetClick, title, onTitleChange }: HeaderProps) {
  const { theme, setTheme } = useTheme()
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(title)

  const handleSave = () => {
    if (editTitle.trim()) {
      onTitleChange(editTitle.trim())
      setIsEditing(false)
    }
  }

  const handleCancel = () => {
    setEditTitle(title)
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave()
    } else if (e.key === "Escape") {
      handleCancel()
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          {isEditing ? (
            <div className="flex items-center space-x-2 flex-1">
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                className="h-8 text-lg font-semibold"
                autoFocus
                maxLength={50}
              />
              <Button variant="ghost" size="sm" onClick={handleSave} className="h-8 w-8 p-0" aria-label="저장">
                <Check className="h-4 w-4 text-green-600" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleCancel} className="h-8 w-8 p-0" aria-label="취소">
                <X className="h-4 w-4 text-red-600" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-2 flex-1 min-w-0">
              <h1 className="text-lg font-semibold text-foreground truncate">{title}</h1>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="h-8 w-8 p-0 opacity-60 hover:opacity-100"
                aria-label="제목 편집"
              >
                <Edit2 className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" onClick={onBudgetClick} className="h-9 px-3" aria-label="예산 및 환율 보기">
            <Calculator className="h-4 w-4 mr-2" />
            <span className="text-sm">예산/환율</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="h-9 w-9 px-0"
            aria-label="테마 변경"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
        </div>
      </div>
    </header>
  )
}
