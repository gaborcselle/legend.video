import { nanoid } from '@/lib/utils'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/middleware'

export async function GET(req: NextRequest) {
  const { supabase } = createClient(req)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response('Unauthorized', {
      status: 401
    })
  }

  const {data, error} = await supabase.from('test').select(`*`);

  if (error) return new Response('Error', { status: 500 })

  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  // const json = await req.json()

  // const userId = (await auth())?.user.id

  // if (!userId) {
  //   return new Response('Unauthorized', {
  //     status: 401
  //   })
  // }

  // const id = nanoid()
  // const createdAt = Date.now()
  // const payload = {
  //   id,
  //   title: json.title,
  //   concept : json.concept,
  //   storyboard : json.storyboard ?? [],
  //   userId,
  //   createdAt
  // }

  // await kv.hset(`video:${id}`, payload)

  // await kv.zadd(`videos`, {
  //   score: createdAt,
  //   member: payload
  // })

  // await kv.zadd(`user:${userId}:videos`, {
  //   score: createdAt,
  //   member: payload
  // })

  // return NextResponse.json(payload)
}
