'use client'

import { useState } from 'react'
import { Minus, Plus } from 'lucide-react'

export default function FaqItem({ children, title }) {
  const [expand, setExpand] = useState(true)
  return (
    <div className="flex flex-col space-y-2 border-t pt-4 faq-item">
      <button
        className="font-bold flex items-center justify-between text-left space-x-4"
        onClick={() => setExpand(!expand)}
      >
        <span className="flex-1 text-lg">{title}</span>
        {expand ? <Minus /> : <Plus />}
      </button>
      {expand && (
        <div className="text-neutral-600 dark:text-neutral-400 prose py-3">
          {children}
        </div>
      )}
    </div>
  )
}
