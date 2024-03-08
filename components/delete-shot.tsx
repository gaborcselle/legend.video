'use client'

import * as React from 'react'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog'
import { IconSpinner, IconTrash } from '@/components/ui/icons'
import { Trash2Icon } from 'lucide-react'

interface DeleteShotProps {
  shotID: number,
  deleteShot: (shotID: number) => void,
  deleteLoading: boolean
}

export function DeleteShot({
  shotID,
  deleteShot,
  deleteLoading
}: DeleteShotProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild disabled={deleteLoading}>
        <Trash2Icon className="w-4 h-4" />
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the shot and remove the data
            from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={deleteLoading}
            className='bg-red-500 hover:bg-red-600'
            onClick={event => {
              event.preventDefault()
              deleteShot(shotID)
            }}
          >
            {deleteLoading && <IconSpinner className="mr-2 animate-spin" />}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
