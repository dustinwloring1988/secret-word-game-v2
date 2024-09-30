'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useRouter } from 'next/navigation'
import { levels } from '@/lib/gameData'
import { supabase } from '@/lib/supabase'

export default function Dashboard() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any | null>(null)

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setIsLoading(false)
      if (!user) {
        router.push('/login')
      }
    }

    checkUser()
  }, [router])

  const startLevel = (levelId: number) => {
    router.push(`/game/${levelId}`)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (isLoading) {
    return null // or a loading spinner
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-center">LLM Jailbreak Game - Level Select</h1>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Logout
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {levels.map(level => (
            <Card key={level.id} className="cursor-pointer hover:shadow-lg transition-shadow bg-gray-800 border-gray-700" onClick={() => startLevel(level.id)}>
              <CardHeader>
                <CardTitle className="text-xl mb-1 text-white">{level.name}</CardTitle>
                <CardDescription className="text-sm text-gray-400">{level.difficulty}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-300">Time Limit: {level.timeLimit} seconds</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}