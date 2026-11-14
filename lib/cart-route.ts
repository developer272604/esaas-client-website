/** Set just before /cart replaces itself with the home page, so the drawer stays open across that hop. */
let skipClose = false;

export function armCartRoute(): void {
  skipClose = true;
}

export function consumeCartRoute(): boolean {
  const value = skipClose;
  skipClose = false;
  return value;
}
