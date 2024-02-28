import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/middleware'

export async function GET(req : NextRequest) {
  console.log('requesting')
  const { supabase } = createClient(req)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const id = req.nextUrl.pathname.split('video/')[1]

  console.log('useer:', user)

  if (!user) {
    return new Response('Unauthorized', {
      status: 401
    })
  }

  const {data, error} = await supabase.from('test').select(`*`);

  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  // const id = req.nextUrl.pathname.split('video/')[1]
  // const userId = (await auth())?.user.id
  // const json = await req.json()

  // if (!userId) {
  //   return new Response('Unauthorized', {
  //     status: 401
  //   })
  // }

  // let data = await kv.hgetall(`video:${id}`);

  // if (!data) {
  //   return new Response('Not Found', {
  //     status: 404
  //   })
  // }

  // const payload = { ...data, ...json }
  // await kv.hset(`video:${id}`, payload)

  // console.log('Updated video:', payload)
  
  // return NextResponse.json(payload)

}
