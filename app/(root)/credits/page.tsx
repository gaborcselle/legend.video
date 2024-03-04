"use client"

import { useState } from "react"
import CreditOption from "@/components/credit-option"
import { useProjects } from "@/lib/hooks/use-projects"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"

export default function Credits() {
  const supabase = createClient()
  const [amount, setAmount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  
  const { setUserProfile, userProfile } = useProjects()


  const addCredits = async () => {
    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Unauthorized')
      }

      if (!userProfile) {
        throw new Error('User profile not found')
      }

      const newProfile = await supabase
        .from('user_profiles')
        .update({
          credits: (userProfile.credits || 0) + amount,
        })
        .eq('owner_id', user.id)
        .select()

      if (newProfile.error) {
        throw new Error(newProfile.error.message)
      }

      setUserProfile(newProfile.data[0])

    } catch (error) {
      console.error('Error adding credits:', error)
    }
    setIsLoading(false)
  }

  return (
    <div className="flex flex-col items-center p-10 gap-10">
      <h1 className="text-2xl font-bold text-center">Add Credits</h1>
      <div className="flex flex-col lg:flex-row gap-10">
        <CreditOption className={amount === 100 ? "border border-primary" : ""} amount={100} setAmount={setAmount} price="5$" />
        <CreditOption className={amount === 1000 ? "border border-primary" : ""} amount={1000} setAmount={setAmount} price="30$" />
        <CreditOption className={amount === 10000 ? "border border-primary" : ""} amount={10000} setAmount={setAmount} price="50$" />
      </div>
      <Button onClick={addCredits} disabled={isLoading || !amount}>
        {isLoading ? "Adding..." : "Add Credits"}
      </Button>
    </div>
  )
}
