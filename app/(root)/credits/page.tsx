'use client'

import { useState } from 'react'
import CreditOption from '@/components/credit-option'
import { useProjects } from '@/lib/hooks/use-projects'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'

export default function Credits() {
  const supabase = createClient()
  const [amount, setAmount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  const { userProfile } = useProjects()

  const addCredits = async () => {
    setIsLoading(true)

    try {
      const {
        data: { user }
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('Unauthorized')
      }

      if (!userProfile) {
        throw new Error('User profile not found')
      }

      const response = await fetch('/api/checkout', {
        method: 'POST',
        body: JSON.stringify({
          amount: amount.toString(),
          user_id: user.id
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const session = (await response.json()) as { url: string }

      if (session.url) {
        window.location.href = session.url
      } else {
        throw new Error('An error ocurred')
      }
    } catch (error) {
      console.error(error)
      alert('An error ocurred')
    }

    setIsLoading(false)
  }

  return (
    <div className="flex flex-col items-center p-10 gap-10">
      <h1 className="text-2xl font-bold text-center">Add Credits</h1>
      <div className="flex flex-col lg:flex-row gap-10">
        <CreditOption
          className={amount === 100 ? 'border border-primary' : ''}
          amount={100}
          setAmount={setAmount}
          price="USD $5"
        />
        <CreditOption
          className={amount === 1000 ? 'border border-primary' : ''}
          amount={1000}
          setAmount={setAmount}
          price="USD $30"
        />
        <CreditOption
          className={amount === 10000 ? 'border border-primary' : ''}
          amount={10000}
          setAmount={setAmount}
          price="USD $50"
        />
      </div>
      <Button onClick={addCredits} disabled={isLoading || !amount}>
        {isLoading ? 'Adding...' : 'Add Credits'}
      </Button>
    </div>
  )
}
