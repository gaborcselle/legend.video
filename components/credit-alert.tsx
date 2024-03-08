'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { useProjects } from '@/lib/hooks/use-projects'
import { useRouter } from 'next/navigation'

export function CreditAlert() {
  const router = useRouter()
  const { userProfile, isCreditAlertOpen, setIsCreditAlertOpen } = useProjects()

  return (
    <AlertDialog open={isCreditAlertOpen} onOpenChange={setIsCreditAlertOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Not enough credits</AlertDialogTitle>
          <AlertDialogDescription>
            {`You have ${userProfile?.credits} credits. But this action costs 20 credits.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={event => {
              event.preventDefault()
              setIsCreditAlertOpen(false)
              router.push('/credits')
            }}
          >
            Buy more Credits
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
