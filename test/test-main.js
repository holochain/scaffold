'use strict'

const YAML = require('yaml-js')

const SAVE_JSON_KEY = 'hc-scaffold-save-json'

const FIXTURE_1 = {
  Version: '0.0.1',
  Generator: 'xxx',
  DNA: {
    Version: 1,
    UUID: 'test-uuid',
    Name: 'test-name',
    Properties: {
      description: 'test-description',
      language: 'en'
    },
    PropertiesSchemaFile: 'properties_schema.json',
    DHTConfig: {
      HashType: 'sha2-256'
    },
    Zomes: [
      {
        Name: 'test-zome-name',
        Description: 'test-zome-description',
        RibosomeType: 'js',
        CodeFile: 'test-zome-name.js',
        Entries: [
          {
            Name: 'test-entry',
            Required: true,
            DataFormat: 'json',
            Sharing: 'public',
            _: 'cr'
          }
        ],
        Functions: [
          {
            Name: 'test-entryCreate',
            CallingType: 'json',
            Exposure: 'public',
            _: 'c:test-entry'
          },
          {
            Name: 'test-entryRead',
            CallingType: 'json',
            Exposure: 'public',
            _: 'r:test-entry'
          },
          {
            Name: 'test-function',
            CallingType: 'json',
            Exposure: 'public'
          }
        ],
        Code: 'xxx'
      }
    ]
  },
  'TestSets': [
    {
      'Name': 'test-zome-name',
      'TestSet': {
        'Tests': [
          {
            'Convey': 'auto-generated test for test-entryCreate',
            'Zome': 'test-zome-name',
            'FnName': 'test-entryCreate',
            'Input': {
              'test': 'test'
            },
            'Output': '%h%'
          },
          {
            'Convey': 'auto-generated test for test-entryRead',
            'Zome': 'test-zome-name',
            'FnName': 'test-entryRead',
            'Input': '%h%',
            'Output': {
              'test': 'test'
            }
          },
          {
            'Convey': 'auto-generated test for test-function',
            'Zome': 'test-zome-name',
            'FnName': 'test-function',
            'Input': '',
            'Output': ''
          }
        ]
      }
    }
  ]
}

/* global callPhantom */

exports.phantomMochaReporter = function phantomMochaReporter (runner) {
  runner.on('start', function start () {
    callPhantom(['start', runner.grepTotal(runner.suite)])
  })
  runner.on('suite', function suite (suite) {
    callPhantom(['suite', suite.title])
  })
  runner.on('suite end', function suiteEnd (suite) {
    callPhantom(['suiteEnd'])
  })
  runner.on('pass', function pass (test) {
    callPhantom(['pass', test.title])
  })
  runner.on('fail', function fail (test, err) {
    let strerr = err.toString()
    if (err.stack) {
      strerr += '\n' + err.stack
    }
    callPhantom(['fail', test.title, strerr])
  })
  runner.on('end', function end () {
    callPhantom(['end'])
  })
}

const expect = require('chai').expect

const i18n = require('../src/hc-i18n')
i18n.loadStrings(require('../src/gen/strings.js'))
const __ = i18n.getText

/**
 * Wait until a querySelector returns results
 */
function waitExists (path) {
  return new Promise((resolve, reject) => {
    const start = Date.now()
    let id = setInterval(() => {
      if (Date.now() - start >= 3000) {
        clearInterval(id)
        reject(new Error('timeout'))
      }
      let frame = document.getElementById('test-frame')

      if (!frame || !frame.contentDocument) {
        return
      }

      let res = frame.contentDocument.querySelectorAll(path)
      if (res.length) {
        clearInterval(id)
        resolve(res)
      }
    }, 10)
  })
}

function reload (query) {
  let frame = document.getElementById('test-frame')
  if (frame.contentDocument && frame.contentDocument.body) {
    let b = frame.contentDocument.body
    while (b.childNodes.length) {
      b.removeChild(b.childNodes[0])
    }
  }
  let url = '/index.html'
  if (query) {
    url += '?' + query
  }
  frame.src = url
  return waitExists('#hc-scaffold')
}

describe('HC Scaffold Quick Start', () => {
  beforeEach(() => {
    i18n.setLocale('en')
  })

  describe('translation check', () => {
    for (let lang of i18n.listLocales()) {
      it('"' + lang + '"', (done) => {
        i18n.setLocale(lang)

        reload('lang=' + lang).then(() => {
          waitExists('.page form h1').then((res) => {
            try {
              let title = res[0].innerText
              expect(title).equals(__('pageTitle'))
              done()
            } catch (e) {
              done(e)
            }
          }, done)
        }, done)
      })
    }
  })

  // This is a pretty good end-to-end test, because it loads json
  // from localstorage, generates all the ui (dom) based off it,
  // re-generates json->yaml from the ui, then parses the yaml
  // and compares it against the original json from localstorage.
  describe('loads from localstorage', () => {
    it('full', (done) => {
      localStorage.setItem(SAVE_JSON_KEY, JSON.stringify(FIXTURE_1))

      reload('lang=en').then(() => {
        waitExists('.yaml-display').then((res) => {
          let yaml
          try {
            const editor = document.getElementById('test-frame')
              .contentWindow.__hcScaffoldYamlDisplayEditor

            yaml = YAML.load(editor.getValue())

            // ignore generator diffs
            yaml.Generator = 'xxx'

            for (let zome of yaml.DNA.Zomes) {
              // ignore zome code for now
              zome.Code = 'xxx'
            }

            expect(yaml).deep.equals(FIXTURE_1)
            done()
          } catch (e) {
            console.log('fixture', JSON.stringify(FIXTURE_1, null, '  '))
            console.log('result', JSON.stringify(yaml, null, '  '))
            done(e)
          }
        }, done)
      }, done)
    })
  })
})
