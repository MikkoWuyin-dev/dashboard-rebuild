import * as React from "react"

const MOBILE_BREAKPOINT = 768
const QUERY = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`

function subscribe(callback: () => void) {
  const mql = window.matchMedia(QUERY)
  mql.addEventListener("change", callback)
  return () => mql.removeEventListener("change", callback)
}

export function useIsMobile() {
  // Same behaviour as the stock "setState in an effect" version: renders
  // `false` during SSR/hydration, then tracks the media query. The store form
  // is what the react-hooks/set-state-in-effect rule wants, and unlike the
  // effect version it cannot miss a resize that lands between mount and the
  // first change event.
  return React.useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  )
}
