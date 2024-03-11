export default function ExpandableMedia({ children, ...props }) {
  return (
    <>
      {props.expand && (
        <div
          className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-80 backdrop-blur z-50"
          onClick={() => props.close()}
        ></div>
      )}

      <div
        className={
          props.expand &&
          'absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 z-50'
        }
      >
        {children}
      </div>
    </>
  )
}
