/** Set just before /wishlist replaces itself with the home page, so the drawer stays open across that hop. */
let skipClose = false;

export function armWishlistRoute(): void {
  skipClose = true;
}

export function consumeWishlistRoute(): boolean {
  const value = skipClose;
  skipClose = false;
  return value;
}
