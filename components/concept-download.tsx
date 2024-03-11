import { Button } from '@/components/ui/button'
import { IconDownload } from '@/components/ui/icons'
import { useProjects } from '@/lib/hooks/use-projects'

export default function ConceptDownload() {
  const { scenes, project } = useProjects()

  const exportProject = async () => {
    const res = await fetch('/api/export_project/' + project?.id)
    console.log(res)
  }

  return (
    <>
      {scenes && scenes.length > 0 && (
        <>
          <div className="p-4 flex flex-col shadow-sm border rounded-lg mt-10 bg-white dark:bg-neutral-950">
            <div className="flex flex-col space-y-2">
              <span className="font-medium text-lg">Download Outputs</span>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Download the storyboard, image stills, and all generated videos
                in a .zip file.
              </p>
            </div>
            <Button
              className="ml-auto space-x-2"
              onClick={() => exportProject()}
            >
              <IconDownload />
              <span>Download All</span>
            </Button>
          </div>
        </>
      )}
    </>
  )
}
