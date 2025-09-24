"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface WelcomePopupProps {
  userName: string
  onClose: () => void
}

export function WelcomePopup({ userName, onClose }: WelcomePopupProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Show popup after a brief delay
    const timer = setTimeout(() => setIsVisible(true), 500)
    return () => clearTimeout(timer)
  }, [])

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem("welcomePopup", "false");
    setTimeout(onClose, 300) // Wait for animation to complete
  }

  if (!isVisible || localStorage.getItem("welcomePopup") === "false") return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in duration-300">
      <Card className="w-full max-w-md mx-4 animate-in slide-in-from-bottom-4 duration-300">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-xl font-bold text-white">XM</span>
            </div>
            <Button variant="ghost" size="icon" onClick={handleClose} className="h-8 w-8 rounded-full">
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-balance">Welcome {userName}!</h2>
            <p className="text-muted-foreground text-pretty">
              Great to have you back in the Xerago Martech Minds community portal.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
