import BaseHistory from './history/base'
import pathToRegexp from 'path-to-regexp'
import { Location, RouteRecord, ParamsType, START_RECORD } from './types/index'

interface RouterOptions {
  history: BaseHistory
  routes: RouteRecord[]
}

interface RouteMatcher {
  re: RegExp
  resolve: (params: ParamsType) => string
  record: RouteRecord
  keys: string[]
}

function generateMatcher(record: RouteRecord) {
  const keys: pathToRegexp.Key[] = []
  // TODO: if children use option end: false ?
  const re = pathToRegexp(record.path, keys)
  return {
    re,
    resolve: pathToRegexp.compile(record.path),
    keys: keys.map(k => '' + k.name),
    record,
  }
}

const START_MATCHER = generateMatcher(START_RECORD)

export class Router {
  protected history: BaseHistory
  private routes: RouteMatcher[]
  currentRoute: RouteRecord = START_RECORD
  currentMatcher: RouteMatcher = START_MATCHER

  constructor(options: RouterOptions) {
    this.history = options.history
    this.history.ensureLocation()

    this.routes = options.routes.map(generateMatcher)
  }

  /**
   * Trigger a navigation, should resolve all guards first
   * @param to Where to go
   */
  push(to: Location) {
    // TODO: resolve URL
    const path = this.resolve(to)
    // TODO: call hooks, guards
    this.history.push(
      path +
        // TODO: test purposes only
        '?value=' +
        Math.round(Math.random() * 10) +
        '#e' +
        Math.round(Math.random() * 10)
    )
  }

  getRouteRecord(location: Location) {}

  /**
   * Transforms a Location object into a URL string. If a string is
   * passed, it returns the string itself
   * @param location Location to resolve to a url
   */
  resolve(location: Readonly<Location>): string {
    if (typeof location === 'string') return location
    if ('path' in location) {
      // TODO: convert query, hash, warn params
      return location.path
    }

    let matcher: RouteMatcher | void
    if (!('name' in location)) {
      // TODO: use current location
      // location = {...location, name: this.}
      matcher = this.routes.find(r => r.record.name === this.currentRoute.name)
      // return '/using current location'
    } else {
      matcher = this.routes.find(r => r.record.name === location.name)
    }

    if (!matcher) {
      // TODO: error
      throw new Error('No match for' + location)
    }

    return matcher.resolve(location.params || {})
  }
}
