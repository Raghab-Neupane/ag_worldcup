import { navigateTo } from '#app'


// Named exports for routes to allow easy name/path updates later on
export const ROUTES = {
  CHOOSE: '/choose',
  WINNER: '/winner',
}

/**
 * Navigates to the Winner page.
 */
export function goToWinner() {
  return navigateTo(ROUTES.WINNER)
}

/**
 * Navigates to the Choose page.
 */
export function goToChoose() {
  return navigateTo(ROUTES.CHOOSE)
}
