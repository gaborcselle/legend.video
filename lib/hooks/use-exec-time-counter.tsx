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

        const id = setInterval(() => {
            setExecTime(prev => Math.floor(prev + 1));
        }, 1000);

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