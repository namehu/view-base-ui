export function off(evt: string, element: any, fnc: (e: Event) => void) {
  return element.removeEventListener ?
    element.removeEventListener(evt, fnc, false) : element.detachEvent('on' + evt, fnc);
}

export function on(evt: string, element: any, fnc: (e: Event) => void) {
  return element.addEventListener ? element.addEventListener(evt, fnc, false) : element.attachEvent('on' + evt, fnc);
}