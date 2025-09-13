"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import ChatInterface from "@/components/ChatInterface"

export default function HomePage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user has auth token
    const token = localStorage.getItem("authToken")
    if (!token) {
      router.push("/login")
    } else {
      setIsAuthenticated(true)
    }
    setLoading(false)
  }, [router])

  const handleSignOut = () => {
    localStorage.removeItem("authToken")
    router.push("/login")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                QueryMind Chat
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleSignOut}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <ChatInterface />
      </main>
    </div>
  )
}