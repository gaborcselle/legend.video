import { NextRequest, NextResponse } from 'next/server'
import { Stripe } from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const options = {
  500: 5,
  1000: 8,
  10000: 20
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    amount: number
    user_id: string
  }

  if (!Object.keys(options).includes(String(body.amount))) {
    return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
  }

  try {
    const session = await stripe.checkout.sessions.create({
      success_url: `${process.env.BASE_URL || process.env.VERCEL_URL || 'http://localhost:3000'}/thank-you`,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${body.amount} Credits`
            },
            unit_amount: options[body.amount] * 100
          },
          quantity: 1
        }
      ],
      metadata: {
        user_id: body.user_id,
        amount: body.amount
      },
      mode: 'payment'
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error(error)

    return NextResponse.json({ error: 'An error ocurred' }, { status: 500 })
  }
}
