"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const departments = ["Digital Analytics", "Marketing", "CMS", "AI Engineering", "Product Management", "Design", "Sales"]

interface LoginFormProps {
  onLogin: (user: any) => void
}

const mockUsers: any[] = []

export function LoginForm({ onLogin }: LoginFormProps) {
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [department, setDepartment] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<"login" | "register">("login")
  const [error, setError] = useState("")

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !name || !department || !password) return

    setLoading(true)
    setError("")

    // Check if user already exists
    const existingUser = mockUsers.find((user) => user.email === email)
    if (existingUser) {
      setError("User with this email already exists")
      setLoading(false)
      return
    }

    // Simulate registration delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const userData = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      name,
      department,
      password,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
      joinedAt: new Date().toISOString(),
      points: 50, // Starting points for new users
      level: 1,
      badges: ["New Member"],
    }

    mockUsers.push(userData)
    setLoading(false)
    setMode("login")
    setPassword("")
    setError("")

    // Show success message
    alert("Registration successful! Please login with your credentials.")
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return

    setLoading(true)
    setError("")

    // Simulate login delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    if (email === "samuel@xerago.com" && password === "Test@123#") {
      const adminUser = {
        id: "admin-001",
        email: "samuel@xerago.com",
        name: "Samuel Admin",
        department: "Digital Analytics",
        password: "Test@123#",
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=Samuel`,
        joinedAt: new Date().toISOString(),
        points: 1000,
        level: 10,
        badges: ["Admin", "Expert", "Mentor", "Top Contributor"],
        isAdmin: true,
      }
      onLogin(adminUser)
      setLoading(false)
      return
    }

    // Find user in mock storage
    const user = mockUsers.find((u) => u.email === email && u.password === password)

    if (!user) {
      setError("Invalid email or password")
      setLoading(false)
      return
    }

    user.isAdmin = false
    onLogin(user)
    setLoading(false)
  }

  const handleSubmit = mode === "register" ? handleRegister : handleLogin

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div
            className="w-16 h-16 bg-gradient-to-r from-emerald-600 to-green-600 rounded-xl mx-auto flex items-center justify-center shadow-lg border border-emerald-500/20"
            style={{ background: "linear-gradient(to right, #249e5e, #16a34a)" }}
          >
            <span className="text-2xl font-bold text-gray-900">XM</span>
          </div>
          <h1 className="text-3xl font-bold text-balance">Xerago Martech Minds</h1>
          <p className="text-muted-foreground text-pretty">Connect, collaborate, and grow with your team</p>
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">
              {mode === "register" ? "Create Account" : "Welcome Back"}
            </CardTitle>
            <CardDescription className="text-center">
              {mode === "register"
                ? "Register to join your community portal"
                : "Sign in to access your community portal"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "register" && (
                <>
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">
                      Full Name
                    </label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="department" className="text-sm font-medium">
                      Department
                    </label>
                    <Select value={department} onValueChange={setDepartment} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept} value={dept}>
                            {dept}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your work email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && <div className="text-sm text-red-600 bg-red-50 p-2 rounded-md">{error}</div>}

              <Button
                type="submit"
                className="w-full text-gray-900 font-medium"
                style={{ background: "linear-gradient(to right, #249e5e, #16a34a)" }}
                disabled={loading}
              >
                {loading
                  ? mode === "register"
                    ? "Creating Account..."
                    : "Signing in..."
                  : mode === "register"
                    ? "Create Account"
                    : "Sign In"}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setMode(mode === "register" ? "login" : "register")
                  setError("")
                  setPassword("")
                }}
                className="text-sm text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
              >
                {mode === "register" ? "Already have an account? Sign in" : "New to Xerago? Create account"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            {mode === "register"
              ? "Contact IT if you need assistance with registration"
              : "Forgot your password? Contact IT for help"}
          </p>
        </div>
      </div>
    </div>
  )
}
