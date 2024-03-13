'use client'

import { useState } from 'react'
import CreditOption from '@/components/credit-option'
import { useProjects } from '@/lib/hooks/use-projects'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { IconCoin } from '@/components/ui/icons'

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
      <h1 className="text-2xl font-bold">Purchase Credits</h1>
      <div className="items-left">
        <p>Thank you for helping us pay our AI bills!</p>
          <ul className="list-disc pl-5">
            <li>We initially give each new user <IconCoin className="inline" width={16} /> 500 credits.</li>
            <li>Each storyboard and video generation costs us about USD $0.12. We charge <IconCoin className="inline" width={16} /> 20 for each.</li>
            <li>After your initial <IconCoin className="inline" width={16} /> 500 credits are used up, we ask you to purchase more below.</li>
            <li>Your payment will be processed by Stripe.</li>
          </ul>
      </div>
      <div className="flex flex-col lg:flex-row gap-10">
        <CreditOption
          className={amount === 500 ? 'border-4 border-double bg-green-400 dark:bg-green-800' : ''}
          amount={500}
          setAmount={setAmount}
          price="USD $5"
        />
        <CreditOption
          className={amount === 1000 ? 'border-4 border-double bg-green-400 dark:bg-green-800' : ''}
          amount={1000}
          setAmount={setAmount}
          price="USD $8"
        />
        <CreditOption
          className={amount === 10000 ? 'border-4 border-double bg-green-400 dark:bg-green-800' : ''}
          amount={10000}
          setAmount={setAmount}
          price="USD $20"
        />
      </div>
      <Button onClick={addCredits} disabled={isLoading || !amount}>
        {isLoading ? 'Adding...' : 'Add Credits'}
      </Button>
    </div>
  )
}
