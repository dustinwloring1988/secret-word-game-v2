import { Button } from "@/components/ui/button"
import { ArrowRight, Clock, Lock, Zap } from "lucide-react"
import Link from "next/link"

export default function Component() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="flex flex-col min-h-screen max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8">
        <header className="py-4 flex items-center justify-between">
          <Link className="flex items-center justify-center" href="#">
            <Zap className="h-6 w-6 mr-2" />
            <span className="font-bold text-lg">LLM Jailbreak</span>
          </Link>
          <nav className="flex gap-4 sm:gap-6">
            <Link className="text-sm font-medium hover:underline underline-offset-4" href="#features">
              Features
            </Link>
            <Link className="text-sm font-medium hover:underline underline-offset-4" href="#how-to-play">
              How to Play
            </Link>
            <Link className="text-sm font-medium hover:underline underline-offset-4" href="#about">
              About
            </Link>
          </nav>
        </header>
        <main className="flex-1">
          <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
            <div className="container px-4 md:px-6">
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                    Can You Outsmart the AI?
                  </h1>
                  <p className="mx-auto max-w-[700px] text-gray-300 md:text-xl">
                    Challenge yourself in a battle of wits against an AI. Jailbreak the LLM and uncover the secret word
                    before time runs out!
                  </p>
                </div>
                <Link href="/dashboard">
                  <Button className="bg-white text-black hover:bg-gray-200">
                    Start Playing
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </section>
          <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-gray-800">
            <div className="container px-4 md:px-6">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-12">
                Game Features
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="flex flex-col items-center text-center">
                  <Lock className="h-12 w-12 mb-4 text-blue-400" />
                  <h3 className="text-xl font-bold mb-2">Multiple Levels</h3>
                  <p className="text-gray-300">
                    Progress through increasingly challenging levels, each with its own unique AI personality.
                  </p>
                </div>
                <div className="flex flex-col items-center text-center">
                  <Clock className="h-12 w-12 mb-4 text-green-400" />
                  <h3 className="text-xl font-bold mb-2">Timed Challenges</h3>
                  <p className="text-gray-300">
                    Race against the clock to uncover the secret word before time runs out.
                  </p>
                </div>
                <div className="flex flex-col items-center text-center">
                  <Zap className="h-12 w-12 mb-4 text-yellow-400" />
                  <h3 className="text-xl font-bold mb-2">Strategic Cooldown</h3>
                  <p className="text-gray-300">
                    Plan your moves carefully with a 10-second cooldown between prompts.
                  </p>
                </div>
              </div>
            </div>
          </section>
          <section id="how-to-play" className="w-full py-12 md:py-24 lg:py-32">
            <div className="container px-4 md:px-6">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-12">
                How to Play
              </h2>
              <ol className="list-decimal list-inside space-y-4 max-w-2xl mx-auto text-gray-300">
                <li>Start a new game and choose your difficulty level.</li>
                <li>You'll be presented with an AI chatbot guarding a secret word.</li>
                <li>Craft clever prompts to try and trick the AI into revealing the word.</li>
                <li>Be mindful of the timer - you have limited time for each level!</li>
                <li>Wait 10 seconds between each prompt submission.</li>
                <li>Successfully jailbreak the AI to progress to the next level.</li>
                <li>Can you make it through all the levels and become the ultimate LLM hacker?</li>
              </ol>
            </div>
          </section>
        </main>
        <footer className="py-6 border-t border-gray-700">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-gray-400">© 2024 LLM Jailbreak Game. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  )
}