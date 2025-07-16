export const dynamic = "force-dynamic"

import { auth, currentUser } from '@clerk/nextjs'
import { NextResponse } from 'next/server'

import db from '@/lib/db'
import { stripe } from '@/lib/stripe'
import { absoluteUrl } from '@/lib/utils'

const settingsUrl = absoluteUrl('/settings')

export async function GET(req: Request) {
  try {
    let userId;
try {
  userId = auth()?.userId;
} catch (error) {
  console.log('[AUTH_ERROR]', error);
}
    const user = await currentUser()

    if (!userId || !user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const userSubscription = await db.userSubscription.findUnique({
      where: {
        userId,
      },
    })

    if (userSubscription && userSubscription.stripeCustomerId) {
      const stripeSession = await stripe.billingPortal.sessions.create({
        customer: userSubscription.stripeCustomerId,
        return_url: settingsUrl,
      })

      return new NextResponse(JSON.stringify({ url: stripeSession.url }))
    }

    const stripeSession = await stripe.checkout.sessions.create({
      success_url: settingsUrl,
      cancel_url: settingsUrl,
      payment_method_types: ['card'],
      mode: 'subscription',
      billing_address_collection: 'auto',
      customer_email: user.emailAddresses[0].emailAddress,
      line_items: [
        {
          price_data: {
            currency: 'USD',
            product_data: {
              name: 'AI Studio Pro',
              description: 'Unlimited AI Generations',
            },
            unit_amount: 2000,
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId,
      },
    })

    return new NextResponse(JSON.stringify({ url: stripeSession.url }))
  } catch (error) {
    console.log('[STRIPE_ERROR]', error)
    return new NextResponse('Stripe Error', { status: 500 })
  }
}
