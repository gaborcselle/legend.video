'use server'

import { type Project } from '@/lib/types'

export async function removeProject({ id }: { id: number }) {
  // TODO rewrite this to use Supabase
  // const session = await auth()

  // if (!session) {
  //   return {
  //     error: 'Unauthorized'
  //   }
  // }

  // //Convert uid to string for consistent comparison with session.user.id
  // const uid = String(await kv.hget(`chat:${id}`, 'userId'))

  // if (uid !== session?.user?.id) {
  //   return {
  //     error: 'Unauthorized'
  //   }
  // }

  // await kv.del(`chat:${id}`)
  // await kv.zrem(`user:chat:${session.user.id}`, `chat:${id}`)

  // revalidatePath('/')
  // return revalidatePath(path)
}

export async function clearProjects() {
  // TODO rewrite this to use Supabase
  // const session = await auth()

  // if (!session?.user?.id) {
  //   return {
  //     error: 'Unauthorized'
  //   }
  // }

  // const chats: string[] = await kv.zrange(`user:chat:${session.user.id}`, 0, -1)
  // if (!chats.length) {
  //   return redirect('/')
  // }
  // const pipeline = kv.pipeline()

  // for (const chat of chats) {
  //   pipeline.del(chat)
  //   pipeline.zrem(`user:chat:${session.user.id}`, chat)
  // }

  // await pipeline.exec()

  // revalidatePath('/')
  // return redirect('/')
}