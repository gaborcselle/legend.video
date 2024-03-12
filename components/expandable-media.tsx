import { IconClose, IconExternalLink, IconZoom } from '@/components/ui/icons'

export default function ExpandableMedia({ children, close, expand, open }) {
  return (
    <>
      {expand && (
        <button
          className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-80 z-50"
          aria-label="Close"
          onClick={() => close()}
        ></button>
      )}

      <div
        className={
          expand
            ? 'fixed top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 z-50 w-full 2xl:w-auto flex items-center justify-center'
            : undefined
        }
      >
        <div className="relative">
          <div className="flex space-x-3 absolute top-3 right-3 pointer-events-none">
            <button
              className="bg-black/50 flex hover:bg-black/75 duration-150 p-3 rounded-full text-white pointer-events-auto"
              aria-label="Open in new tab"
              onClick={() => window.open(children.props.src)}
            >
              <IconExternalLink className="w-5 h-5" />
            </button>
            {expand ? (
              <button
                className="bg-black/50 flex hover:bg-black/75 duration-150 p-3 rounded-full text-white pointer-events-auto"
                aria-label="Close"
                onClick={() => close()}
              >
                <IconClose className="w-5 h-5" />
              </button>
            ) : (
              <button
                className="bg-black/50 flex hover:bg-black/75 duration-150 p-3 rounded-full text-white pointer-events-auto"
                aria-label="Open"
                onClick={open}
              >
                <IconZoom className="w-5 h-5" />
              </button>
            )}
          </div>
          {children}
        </div>
      </div>
    </>
  )
}
