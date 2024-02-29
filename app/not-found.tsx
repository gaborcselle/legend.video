import Link from 'next/link'
 
export default function NotFound() {
  return (
    <div className="ml-5">
      <h2 className="text-xl">404 Page Not Found</h2>
      <p>Could not find requested resource</p>
      <Link className="underline" href="/">Return Home</Link>
    </div>
  )
}