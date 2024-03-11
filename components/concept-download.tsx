import { Button } from '@/components/ui/button'
import { IconDownload } from '@/components/ui/icons'

export default function ConceptDownload() {
  return (
    <>
      <div className="p-4 flex flex-col border-t bg-white dark:bg-neutral-950 sticky bottom-0">
        <div className="flex flex-col space-y-2">
          <span className="font-bold text-2xl">Download Outputs</span>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Download the storyboard, image stills, and all generated videos in a
            .zip file.
          </p>
        </div>
        <Button className="ml-auto space-x-2">
          <IconDownload />
          <span>Download All</span>
        </Button>
      </div>
    </>
  )
}
