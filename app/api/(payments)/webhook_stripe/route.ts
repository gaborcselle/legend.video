import { headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE!
)

export async function POST(request: NextRequest) {
  const body = await request.text()
  const headersList = headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  try {
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret)

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object

      if (session.mode === 'payment' && session.payment_status === 'paid') {
        const { user_id, amount } = session.metadata || {}

        if (!user_id) {
          return NextResponse.json({ error: 'No user id' }, { status: 400 })
        }

        if (!amount) {
          return NextResponse.json({ error: 'No amount' }, { status: 400 })
        }

        const { data, error: profileError } = await supabase
          .schema('public')
          .from('user_profiles')
          .select('credits')
          .eq('owner_id', user_id)
          .single()

        if (profileError) {
          return NextResponse.json(
            { error: 'No user profile' },
            { status: 400 }
          )
        }

        if (!data) {
          return NextResponse.json(
            { error: 'No user profile' },
            { status: 400 }
          )
        }

        const { error } = await supabase
          .from('user_profiles')
          .update({
            credits: data.credits + parseInt(amount)
          })
          .eq('owner_id', user_id)

        if (error) {
          return NextResponse.json(
            { error: 'An error ocurred' },
            { status: 500 }
          )
        }

        return NextResponse.json({ success: true }, { status: 200 })
      }
    }
  } catch (error) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }
}
