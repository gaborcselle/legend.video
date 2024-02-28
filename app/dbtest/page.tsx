import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database, Tables } from '@/lib/database.types';

export default async function Page () {
  const cookieStore = cookies()


const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
        cookies: {
            get(name: string) {
                return cookieStore.get(name)?.value
            },
        },
    }
)

const {data, error} = await supabase.from('test').select(`*, testtoo(*)`);

console.log("test", data);

  return (
   <>
    <div className="flex-1 space-y-6">
        <h1 className="text-3xl font-bold">DB Test</h1>
        <ul>
            {data && Array.isArray(data) && data.map((item) => (
            <li key={item.id} className="flex space-x-4">
                {item.id} |
                {item.title} |
                {item.text}
                {item.testtoo.map((testtoo) => (<>| {testtoo.greeting}</>))}
                </li>         
            ))}
        </ul>    
    </div>
    </>
  )
}
