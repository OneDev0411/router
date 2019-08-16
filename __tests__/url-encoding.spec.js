// @ts-check
require('./helper')
const expect = require('expect')
const { Router } = require('../src/router')
const { createDom, components, tick, HistoryMock } = require('./utils')

/** @type {import('../src/types').RouteRecord[]} */
const routes = [
  { path: '/', name: 'home', component: components.Home },
  { path: '/%25', name: 'percent', component: components.Home },
  { path: '/to-p/:p', redirect: to => `/p/${to.params.p}` },
  { path: '/p/:p', component: components.Bar, name: 'params' },
]

function createHistory(initialUrl) {
  return new HistoryMock(initialUrl)
}

describe('URL Encoding', () => {
  beforeAll(() => {
    createDom()
  })

  describe('initial navigation', () => {
    it('decodes path', async () => {
      const history = createHistory('/%25')
      const router = new Router({ history, routes })
      await router.doInitialNavigation()
      expect(router.currentRoute).toEqual(
        expect.objectContaining({
          name: 'percent',
          fullPath: '/%25',
          path: '/%25',
        })
      )
    })

    it('decodes params in path', async () => {
      // /p/€
      const history = createHistory('/p/%E2%82%AC')
      const router = new Router({ history, routes })
      await router.doInitialNavigation()
      expect(router.currentRoute).toEqual(
        expect.objectContaining({
          name: 'params',
          fullPath: encodeURI('/p/€'),
          params: { p: '€' },
          path: encodeURI('/p/€'),
        })
      )
    })

    it('allows navigating to valid unencoded params (IE and Edge)', async () => {
      const history = createHistory('/p/€')
      const router = new Router({ history, routes })
      await router.doInitialNavigation()
      expect(router.currentRoute).toEqual(
        expect.objectContaining({
          name: 'params',
          // unfortunately, we cannot encode the path as we cannot know if it already encoded
          // so comparing fullPath and path here is pointless
          // fullPath: '/p/€',
          // only the params matter
          params: { p: '€' },
        })
      )
    })

    it('allows navigating to invalid unencoded params (IE and Edge)', async () => {
      const spy = jest.spyOn(console, 'warn').mockImplementation(() => {})
      const history = createHistory('/p/%notvalid')
      const router = new Router({ history, routes })
      await router.doInitialNavigation()
      expect(spy).toHaveBeenCalledTimes(1)
      spy.mockRestore()
      expect(router.currentRoute).toEqual(
        expect.objectContaining({
          name: 'params',
          // unfortunately, we cannot encode the path as we cannot know if it already encoded
          // so comparing fullPath and path here is pointless
          // fullPath: '/p/€',
          // only the params matter
          params: { p: '%notvalid' },
        })
      )
    })

    it('decodes params in query', async () => {
      const history = createHistory('/?q=%25%E2%82%AC')
      const router = new Router({ history, routes })
      await router.doInitialNavigation()
      expect(router.currentRoute).toEqual(
        expect.objectContaining({
          name: 'home',
          fullPath: '/?q=' + encodeURIComponent('%€'),
          query: {
            q: '%€',
          },
          path: '/',
        })
      )
    })

    it('allow unencoded params in query (IE Edge)', async () => {
      const spy = jest.spyOn(console, 'warn').mockImplementation(() => {})
      const history = createHistory('/?q=€%notvalid')
      const router = new Router({ history, routes })
      await router.doInitialNavigation()
      expect(spy).toHaveBeenCalledTimes(1)
      spy.mockRestore()
      expect(router.currentRoute).toEqual(
        expect.objectContaining({
          name: 'home',
          fullPath: '/?q=' + encodeURIComponent('€%notvalid'),
          query: {
            q: '€%notvalid',
          },
          path: '/',
        })
      )
    })

    // TODO: we don't do this in current version of vue-router
    // should we do it? it seems to be a bit different as it allows using % without
    // encoding it. To be safe we would have to encode everything
    it.skip('decodes hash', async () => {
      const history = createHistory('/#%25%E2%82%AC')
      const router = new Router({ history, routes })
      await router.doInitialNavigation()
      expect(router.currentRoute).toEqual(
        expect.objectContaining({
          name: 'home',
          fullPath: '/#' + encodeURIComponent('%€'),
          hash: '#%€',
          path: '/',
        })
      )
    })

    it('allow unencoded params in query (IE Edge)', async () => {
      const spy = jest.spyOn(console, 'warn').mockImplementation(() => {})
      const history = createHistory('/?q=€%notvalid')
      const router = new Router({ history, routes })
      await router.doInitialNavigation()
      expect(spy).toHaveBeenCalledTimes(1)
      spy.mockRestore()
      expect(router.currentRoute).toEqual(
        expect.objectContaining({
          name: 'home',
          fullPath: '/?q=' + encodeURIComponent('€%notvalid'),
          query: {
            q: '€%notvalid',
          },
          path: '/',
        })
      )
    })
  })

  describe('resolving locations', () => {
    it('encodes params when resolving', async () => {
      const history = createHistory('/')
      const router = new Router({ history, routes })
      await router.doInitialNavigation()
      await router.push({ name: 'params', params: { p: '%€' } })
      expect(router.currentRoute).toEqual(
        expect.objectContaining({
          name: 'params',
          fullPath: encodeURI('/p/%€'),
          params: { p: '%€' },
          path: encodeURI('/p/%€'),
        })
      )
    })
  })
})
