import { JSDOM, ConstructorOptions } from 'jsdom'
import { NavigationGuard, RouteRecord, MatchedRouteRecord } from '../src/types'

export { HistoryMock } from './HistoryMock'

export const tick = () => new Promise(resolve => process.nextTick(resolve))

export const NAVIGATION_TYPES = ['push', 'replace']

declare global {
  namespace NodeJS {
    interface Global {
      window: JSDOM['window']
      location: JSDOM['window']['location']
      document: JSDOM['window']['document']
      before?: Function
    }
  }
}

export function createDom(options?: ConstructorOptions) {
  const dom = new JSDOM(
    `<!DOCTYPE html><html><head></head><body></body></html>`,
    {
      url: 'https://example.org/',
      referrer: 'https://example.com/',
      contentType: 'text/html',
      ...options,
    }
  )

  global.window = dom.window
  global.location = dom.window.location
  global.document = dom.window.document

  return dom
}

export const noGuard: NavigationGuard = (to, from, next) => {
  next()
}

export const components = {
  Home: { render: (h: Function) => h('div', {}, 'Home') },
  Foo: { render: (h: Function) => h('div', {}, 'Foo') },
  Bar: { render: (h: Function) => h('div', {}, 'Bar') },
}

// allow using a .jest modifider to skip some tests on mocha
// specifically, skip component tests as they are a pain to correctly
// adapt to mocha
export const isMocha = () => typeof global.before === 'function'

/**
 * Copies and normalizes the record so it always contains an object of `components`
 *
 * @param record
 * @returns a normalized copy
 */
export function normalizeRouteRecord(
  record: Exclude<RouteRecord, { redirect: any }>
): MatchedRouteRecord {
  if ('components' in record) return { ...record }
  const { component, ...rest } = record

  return {
    ...rest,
    components: { default: component },
  }
}
