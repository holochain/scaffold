'use strict'

/* i18n translation handler helper
 * This works as a singleton.
 * Load up your strings with `loadStrings`
 * Set your locale with `setLocale('ja')`
 * get a string with `getText('stringid', 'param1', 4, 32.4, 'etc..')`
 */

const vsprintf = require('sprintf-js').vsprintf

let map = {}
let curLang = 'en'

/**
 * load up a map of language ids to string ids
 */
exports.loadStrings = function loadStrings (strings) {
  for (let langId in strings) {
    if (!(langId in map)) {
      map[langId] = {}
    }
    for (let stringId in strings[langId]) {
      if (stringId in map[langId]) {
        throw new Error('duplicate stringId: "' + stringId +
          '" for langId: "' + langId + '"')
      }
      map[langId][stringId] = strings[langId][stringId]
    }
  }
}

/**
 * what is the current language id
 */
exports.getLocale = function getLocale () {
  return curLang
}

/**
 * set the current language id
 */
exports.setLocale = function setLocale (langId) {
  curLang = langId
}

/**
 * list the available language ids
 */
exports.listLocales = function listLocales () {
  return Object.keys(map)
}

/**
 * get the translated text given a string id and parameters
 */
exports.getText = function getText (stringId /* args */) {
  let args = [].slice.call(arguments, 0)
  stringId = args.shift()

  let out = null
  if (stringId in map[curLang]) {
    out = map[curLang][stringId]
  } else if (stringId in map['en']) {
    out = map['en'][stringId]
  }
  if (typeof out !== 'string') {
    throw new Error(stringId + ' not found')
  }
  return vsprintf(out, args)
}
