import { RouteLocationNormalized, RouteLocation } from './types'

export class NoRouteMatchError extends Error {
  constructor(currentLocation: any, location: any) {
    super('No match for ' + JSON.stringify({ ...currentLocation, ...location }))
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

/**
 * Error used when the matcher fails to resolve a location
 */
export class InvalidRouteMatch extends Error {
  constructor(location: any) {
    // TODO: improve the error to include currentLocation and use it for more cases
    super(
      `Cannot redirect using a relative location:\n${stringifyRoute(
        location
      )}\nUse the function redirect and explicitely provide a name`
    )
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

/**
 * Error used when rejecting a navigation because of a redirection. Contains
 * information about where we where trying to go and where we are going instead
 */
export class NavigationGuardRedirect extends Error {
  to: RouteLocation
  from: RouteLocationNormalized
  // TODO: refactor order of argumnets
  // TODO: refactor into parent class NavigationError
  constructor(from: RouteLocationNormalized, to: RouteLocation) {
    super(
      `Redirected from "${from.fullPath}" to "${stringifyRoute(
        to
      )}" via a navigation guard`
    )
    Object.setPrototypeOf(this, new.target.prototype)

    this.from = from
    this.to = to
  }
}

/**
 * Navigation aborted by next(false)
 */
export class NavigationAborted extends Error {
  to: RouteLocationNormalized
  from: RouteLocationNormalized
  constructor(to: RouteLocationNormalized, from: RouteLocationNormalized) {
    super(
      `Navigation aborted from "${from.fullPath}" to "${
        to.fullPath
      }" via a navigation guard`
    )
    Object.setPrototypeOf(this, new.target.prototype)

    this.from = from
    this.to = to
  }
}

/**
 * Navigation canceled by the user by pushing/replacing a new location
 * TODO: is the name good?
 */
export class NavigationCancelled extends Error {
  to: RouteLocationNormalized
  from: RouteLocationNormalized
  constructor(to: RouteLocationNormalized, from: RouteLocationNormalized) {
    super(
      `Navigation cancelled from "${from.fullPath}" to "${
        to.fullPath
      }" with a new \`push\` or \`replace\``
    )
    Object.setPrototypeOf(this, new.target.prototype)

    this.from = from
    this.to = to
  }
}

function stringifyRoute(to: RouteLocation): string {
  if (typeof to === 'string') return to
  if ('path' in to) return to.path
  return JSON.stringify(to, null, 2)
}
