export const dynamic = "force-dynamic"

import { auth } from '@clerk/nextjs'
import { NextResponse } from 'next/server'
import { Configuration, OpenAIApi } from 'openai'
import { increaseApiLimit, checkApiLimit } from '@/lib/api-limit'
import { checkSubscription } from '@/lib/subscription'

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
  basePath: process.env.OPENAI_BASE_URL,
})
const openai = new OpenAIApi(configuration)

export async function POST(req: Request) {
  try {
    let userId;
    try {
      userId = auth()?.userId;
    } catch (error) {
      console.log('[AUTH_ERROR]', error);
    }

    const body = await req.json()
    const { messages } = body

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    if (!configuration.apiKey) {
      return new NextResponse('OpenAI API Key not configured', { status: 500 })
    }

    if (!messages) {
      return new NextResponse('Messages are required', { status: 400 })
    }

    const freeTrial = await checkApiLimit()
    const isPro = await checkSubscription()

    if (!freeTrial && !isPro) {
      return new NextResponse('You have reached your free trial limit', {
        status: 403,
      })
    }

    const response = await openai.createChatCompletion(
      {
        model: "mistralai/mistral-7b-instruct:free",
        messages,
      },
      {
        headers: {
          "HTTP-Referer": "http://localhost:3000", // ✅ update to your domain on production
          "X-Title": "Rahul AI Studio",
        },
      }
    )

    if (!isPro) {
      await increaseApiLimit()
    }

    return NextResponse.json(response.data.choices[0].message)
  } catch (error) {
    console.log('[CONVERSATION_ERROR]', error)
    return new NextResponse('Internal error', { status: 500 })
  }
}
