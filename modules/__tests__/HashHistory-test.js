import createHistory from '../createHashHistory'
import { canUseDOM } from '../ExecutionEnvironment'
import { supportsGoWithoutReloadUsingHash } from '../DOMUtils'
import * as TestSequences from './TestSequences'

const describeHistory = canUseDOM ? describe : describe.skip

const canGoWithoutReload = canUseDOM && supportsGoWithoutReloadUsingHash()
const describeGo = canGoWithoutReload ? describe : describe.skip

describeHistory('a hash history', () => {
  beforeEach(() => {
    if (window.location.hash !== '')
      window.location.hash = ''
  })

  describe('by default', () => {
    let history
    beforeEach(() => {
      history = createHistory()
    })

    describe('listen', () => {
      it('does not immediately call listeners', (done) => {
        TestSequences.Listen(history, done)
      })
    })

    describe('the initial location', () => {
      it('does not have a key', (done) => {
        TestSequences.InitialLocationNoKey(history, done)
      })
    })

    describe('push', () => {
      it('calls change listeners with the new location', (done) => {
        TestSequences.PushNewLocation(history, done)
      })
    })

    describe('replace', () => {
      it('calls change listeners with the new location', (done) => {
        TestSequences.ReplaceNewLocation(history, done)
      })
    })

    describeGo('goBack', () => {
      it('calls change listeners with the previous location', (done) => {
        TestSequences.GoBack(history, done)
      })
    })

    describeGo('goForward', () => {
      it('calls change listeners with the next location', (done) => {
        TestSequences.GoForward(history, done)
      })
    })
  })

  describe('that denies all transitions', () => {
    const getUserConfirmation = (_, callback) => callback(false)

    let history
    beforeEach(() => {
      history = createHistory({
        getUserConfirmation
      })
    })

    describe('clicking on a link (push)', () => {
      it('does not update the location', (done) => {
        TestSequences.DenyPush(history, done)
      })
    })

    describeGo('clicking the back button (goBack)', () => {
      it('does not update the location', (done) => {
        TestSequences.DenyGoBack(history, done)
      })
    })

    describeGo('clicking the forward button (goForward)', () => {
      it('does not update the location', (done) => {
        TestSequences.DenyGoForward(history, done)
      })
    })
  })

  describe('a transition hook', () => {
    const getUserConfirmation = (_, callback) => callback(true)

    let history
    beforeEach(() => {
      history = createHistory({
        getUserConfirmation
      })
    })

    it('receives the next location and action as arguments', (done) => {
      TestSequences.TransitionHookArgs(history, done)
    })

    const itBackButton = canGoWithoutReload ? it : it.skip

    itBackButton('is called when the back button is clicked', (done) => {
      TestSequences.BackButtonTransitionHook(history, done)
    })

    it('cancels the transition when it returns false', (done) => {
      TestSequences.ReturnFalseTransitionHook(history, done)
    })
  })

  describe('"hashbang" hash path coding', () => {
    let history
    beforeEach(() => {
      history = createHistory({
        hashType: 'hashbang'
      })
    })

    it('properly encodes and decodes window.location.hash', (done) => {
      TestSequences.HashbangHashPathCoding(history, done)
    })
  })

  describe('"noslash" hash path coding', () => {
    let history
    beforeEach(() => {
      history = createHistory({
        hashType: 'noslash'
      })
    })

    it('properly encodes and decodes window.location.hash', (done) => {
      TestSequences.NoslashHashPathCoding(history, done)
    })
  })

  describe('"slash" hash path coding', () => {
    let history
    beforeEach(() => {
      history = createHistory({
        hashType: 'slash'
      })
    })

    it('properly encodes and decodes window.location.hash', (done) => {
      TestSequences.SlashHashPathCoding(history, done)
    })
  })
})
