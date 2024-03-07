import { useEffect, useState } from 'react'

export const useExecTimeCounter = () => {
    const [pending, setPending] = useState<boolean>(false)
    const [execTime, setExecTime] = useState<number>(0)
    const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null)

    // every time pending changes, start or stop the interval
    useEffect(() => {
        if(pending){
            start()
        } else {
            stop()
        }
    }, [pending])

    const start = () => {
        if (intervalId) {
            return
        }

        // count every 0.1 seconds
        const id = setInterval(() => {
            setExecTime(prev => Math.round((prev + 0.1) * 10) / 10)
        }, 100)

        setIntervalId(id)
        setPending(true)
    }

    const stop = () => {
        if (!intervalId) {
            return
        }

        setExecTime(0)
        clearInterval(intervalId)
        setIntervalId(null)

        setPending(false)
    }

    return {
        execTime,
        pending,
        setPending,
    }
}