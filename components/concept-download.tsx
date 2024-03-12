import { Button } from '@/components/ui/button'
import { IconDownload, IconSpinner } from '@/components/ui/icons'
import { useExecTimeCounter } from '@/lib/hooks/use-exec-time-counter'
import { useProjects } from '@/lib/hooks/use-projects'

export default function ConceptDownload() {
  const { scenes, project } = useProjects()

  const { execTime, pending, setPending } = useExecTimeCounter()

  const downloadFile = async (readableStream: ReadableStream) => {
    const blob = await readableStreamToBlob(readableStream)
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `project_assets_${project?.id}.zip`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const readableStreamToBlob = async (
    readableStream: ReadableStream
  ): Promise<Blob> => {
    const reader = readableStream.getReader()
    const chunks: Uint8Array[] = []
    let length = 0
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      if (value) {
        chunks.push(value)
        length += value.length
      }
    }
    return new Blob(chunks, { type: 'application/zip' }) // Adjust the MIME type as needed
  }

  const exportProject = async () => {
    setPending(true)
    await fetch('/api/export_project/' + project?.id)
      .then(res => {
        if (!res.ok) {
          throw new Error('Network response was not ok')
        }
        return res.body
      })
      .then(readableStream => {
        if (!readableStream) {
          throw new Error('No readable stream')
        }
        setPending(false)
        return downloadFile(readableStream)
      })
      .catch(error => {
        console.error(error)
        alert('An error occurred')
      })
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
              disabled={pending}
            >
              {pending ? (
                <>
                  <IconSpinner className="mr-1" />
                  {`${execTime}s`}
                </>
              ) : (
                <>
                  <IconDownload />
                  <span>Download All</span>
                </>
              )}
            </Button>
          </div>
        </>
      )}
    </>
  )
}
