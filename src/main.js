'use strict'

/* global ace */

const constants = require('../constants')
const version = require('./gen/version')

const i18n = require('./hc-i18n')
i18n.loadStrings(require('./gen/strings'))
const __ = i18n.getText

const toYaml = require('./scaffold-json-to-yaml').toYaml
const YAML = require('yaml-js')

const handlebars = require('handlebars/runtime')
require('./gen/templates')

const JSZip = require('jszip')
const openApiGen = require('@holochain/dna-to-openapi')

const SAVE_JSON_KEY = 'hc-scaffold-save-json'

const CODE_GEN = {
  js: require('./code/js')
}

const schema = require('./gen/schema')
const JSON_SCHEMA_EXAMPLE = schema.example
const JSON_SCHEMA_META = schema.schema

const Ajv = require('ajv')
const ajv = new Ajv()
const jsonSchemaValidate = ajv.compile(JSON_SCHEMA_META)

let EntrySchemas = {}
/**
 * Generates a holochain dna scaffold file.
 */
class HcScaffold {
  /**
   * Set up some default class vars
   */
  constructor () {
    this.nextTemplateId = Math.random()
    this.templates = {}
    this.uuid = this._genUuid()

    this.ROOT = document.querySelector('#hc-scaffold')

    handlebars.registerHelper('__', function tr (/* args */) {
      return __.apply(this, arguments)
    })
  }

  /**
   * If wehave a `lang` query string, just render with that language.
   * Otherwise, start off with a list of language buttons.
   */
  run () {
    const match = location.search.match(/lang=([^&]+)/)
    let lang
    if (match && match[1]) {
      lang = decodeURIComponent(match[1]).trim()
    }

    if (i18n.listLocales().indexOf(lang) > -1) {
      i18n.setLocale(lang)

      this._genTemplates(this.ROOT, 'page', {})
      this.page = this.ROOT.querySelector('.page')
      this.yamlDisplay = this.ROOT.querySelector('.yaml-display')
      this.appName = this.ROOT.querySelector('#appname')
      this.appDesc = this.ROOT.querySelector('#appdesc')
      this.zomesDiv = this.ROOT.querySelector('#zomes')

      const editor = this.yamlDisplayEditor = ace.edit(this.yamlDisplay)
      editor.$blockScrolling = Infinity
      editor.setTheme('ace/theme/github')
      editor.getSession().setMode('ace/mode/yaml')
      editor.setReadOnly(true)

      window.__hcScaffoldYamlDisplayEditor = editor

      let json
      try {
        json = JSON.parse(localStorage.getItem(SAVE_JSON_KEY))
      } catch (e) { /* pass */ }

      // If we have json saved, render the ui based off of that
      if (json) {
        this._loadJson(json)
      } else {
        this.json = {DNA: {}}

        // otherwise show an empty ui
        this._displayYaml()
      }
    } else {
      for (let locale of i18n.listLocales()) {
        i18n.setLocale(locale)
        this._genTemplates(this.ROOT, 'lang-button', {
          locale: locale,
          langName: __('langName')
        })
      }
    }
  }

  // -- access from template binding -- //

  /**
   * On language button click, re-render using that language
   */
  $selectLocale (params, evtData) {
    evtData.evt.stopPropagation()

    location.search = 'lang=' + encodeURIComponent(params.locale)
  }

  /**
   * Since we save the state in localstorage... we need a way
   * to start over.
   */
  $newDocument (params, evtData) {
    localStorage.removeItem(SAVE_JSON_KEY)
    location.reload()
  }

  /**
   * Allow users to upload json or yaml scaffold files.
   * Re-render based off their upload if it parses.
   */
  $upload (params, evtData) {
    const i = document.createElement('input')
    i.type = 'file'
    i.style.display = 'none'
    const listener = (evt) => {
      i.removeEventListener('change', listener, false)
      this.ROOT.removeChild(i)

      const reader = new FileReader()
      reader.onerror = () => {
        throw new Error('Error Reading File: ' + i.files[0].name)
      }
      reader.onload = () => {
        let json
        console.log('loaded json string', json)
        try {
          json = JSON.parse(reader.result)
        } catch (e) { /* pass */ }
        try {
          json = YAML.load(reader.result)
        } catch (e) { /* pass */ }
        if (!json) {
          throw new Error('Error Parsing File: ' + i.files[0].name)
        }

        localStorage.setItem(SAVE_JSON_KEY, JSON.stringify(json))
        location.reload()
      }
      reader.readAsText(i.files[0])
    }
    i.addEventListener('change', listener, false)
    this.ROOT.appendChild(i)
    i.click()
  }

  /**
   * They clicked the 'hamburger' - display the pop-up menu
   */
  $menu (params, evtData) {
    this._genTemplates(this.ROOT, 'menu', {})
  }

  /**
   * They clicked outside the pop-up menu, dismiss it
   */
  $dismiss (params, evtData) {
    this._rmTemplate(params.id)
  }

  /**
   * Prevent dismiss by stopping propagation
   */
  $intercept (params, evtData) {
    evtData.evt.stopPropagation()
  }

  /**
   * Re-render the popup menu with languages
   * TODO - if we get more than screen size here... i think it won't
   * scroll correctly...
   */
  $languageMenu (params, evtData) {
    evtData.evt.stopPropagation()

    const cont = this.templates[params.id].parent
      .querySelector('.menu-container')
    while (cont.childNodes.length) {
      cont.removeChild(cont.childNodes[0])
    }
    for (let locale of i18n.listLocales()) {
      i18n.setLocale(locale)
      this._genTemplates(cont, 'lang-button', {
        locale: locale,
        langName: __('langName')
      })
    }
  }

  /**
   * show the "about" menu
   */
  $about (params, evtData) {
    evtData.evt.stopPropagation()

    const cont = this.templates[params.id].parent
      .querySelector('.menu-container')
    while (cont.childNodes.length) {
      cont.removeChild(cont.childNodes[0])
    }
    this._genTemplates(cont, 'about', {
      version: version.version,
      url: version.url
    })
  }

  /**
   * Squish / Unsquish the sidebar
   */
  $toggleYaml (params, evtData) {
    if (this.page.classList.contains('sidebar-hidden')) {
      this.page.classList.remove('sidebar-hidden')
    } else {
      this.page.classList.add('sidebar-hidden')
    }
  }

  /**
   * Trigger download of the dna yaml
   */
  $downloadYaml (params, evtData) {
    let data = this._genYaml()
    data = new Blob([data], {type: 'application/yaml'})
    this._triggerDownload(data, 'hc-scaffold.yml')
  }

  /**
   * Trigger download of zip archive folder structure for app
   */
  $downloadArchive (params, evtData) {
    const yaml = this._genYaml()
    const json = YAML.load(yaml)

    const zip = new JSZip()
    const project = zip.folder(json.DNA.Name)

    project.file('hc-scaffold.yml', yaml)

    const dnaDir = project.folder('dna')

    dnaDir.file('properties_schema.json', JSON.stringify({
      title: 'Properties Schema',
      type: 'object',
      properties: {
        description: {
          type: 'string'
        },
        language: {
          type: 'string'
        }
      }
    }, null, '  '))

    const schemas = {}

    for (let zome of json.DNA.Zomes) {
      const zomeDir = dnaDir.folder(zome.Name)
      const code = zome.Code
      delete zome.Code
      zomeDir.file(zome.CodeFile, code)

      for (let entry of zome.Entries) {
        delete entry._

        if ('Schema' in entry) {
          if (!(zome.Name in schemas)) {
            schemas[zome.Name] = {}
          }
          const zomeDef = schemas[zome.Name]
          entry.SchemaFile = entry.Name.replace(' ', '_') + '.json'
          zomeDef[entry.SchemaFile] = JSON.parse(entry.Schema)

          zomeDir.file(entry.SchemaFile, entry.Schema)
          delete entry.Schema
        }
      }

      for (let fn of zome.Functions) {
        delete fn._
      }
    }

    const testDir = project.folder('test')

    for (let test of json.TestSets) {
      testDir.file(test.Name.toLowerCase() + '.json', JSON.stringify(
        test.TestSet, null, '  '))
    }

    delete json.TestSets

    const openApiOpts = {
      schemas: schemas
    }

    const lintResults = openApiGen.lint(json.DNA, openApiOpts)

    if (lintResults.errors.length > 0) {
      throw new Error(JSON.stringify(lintResults, null, '  '))
    }

    const specJson = openApiGen.convert(json.DNA, openApiOpts).result
    const swaggerHtml = openApiGen.genDocs(specJson)

    const uiDir = project.folder('ui')
    uiDir.file('open-api-spec.json', JSON.stringify(specJson, null, '  '))
    uiDir.file('open-api-docs.html', swaggerHtml)

    dnaDir.file('dna.json', JSON.stringify(json.DNA, null, '  '))

    zip.generateAsync({type: 'blob'}).then((content) => {
      this._triggerDownload(content, 'hc-scaffold.zip')
    })
  }

  /**
   * UI elements should call this to trigger re-display of yaml
   */
  $render (params, evtData) {
    // debounce this
    let timer
    setTimeout(() => {
      clearTimeout(timer)
      this._displayYaml()
    }, 300)
  }

  /**
   * Debounce for reloading
   */
  $reloadLater (params, evtData) {
    let timer
    setTimeout(() => {
      clearTimeout(timer)
      this._displayYaml()
      location.reload()
    }, 1500)
  }

  /**
   * View code, delete, etc
   */
  $zomeOptions (params, evtData) {
    const wrap = this._genTemplates(this.ROOT, 'modal', {})
    const cont = wrap.elems[0].querySelector('.modal-container')
    this._genTemplates(cont, 'zome-options', {
      'zome-id': params.id,
      'menu-id': wrap.id
    })
  }

  /**
   * Show the code that was generated for this zome
   */
  $viewZomeCode (params, evtData) {
    this._rmTemplate(params['menu-id'])
    const wrap = this._genTemplates(this.ROOT, 'modal', {})
    const cont = wrap.elems[0].querySelector('.modal-container')
    const js = this._genTemplates(cont, 'zome-code', {}).parent
      .querySelector('.javascript-display')

    let code = ''
    for (let zome of this.json.DNA.Zomes) {
      if (zome.__tplId === params.id) {
        code = zome.Code
      }
    }

    const editor = ace.edit(js)
    editor.$blockScrolling = Infinity
    editor.setTheme('ace/theme/github')
    editor.getSession().setMode('ace/mode/javascript')
    editor.setReadOnly(true)
    editor.setValue(code)
    editor.clearSelection()
  }

  /**
   * Add a zome
   */
  $addZome (params, evtData) {
    const jsonZome = {}
    this._addZome(jsonZome)
    if (!this.json.DNA.Zomes) {
      this.json.DNA.Zomes = []
    }
    this.json.DNA.Zomes.push(jsonZome)
    this._displayYaml()
  }

  /**
   * Remove a zome (params.id)
   */
  $deleteZome (params, evtData) {
    this._rmTemplate(params.id)
    this._rmTemplate(params['menu-id'])
    this._displayYaml()
  }

  /**
   * Add an entry to the zome defined by (params.id)
   */
  $addZomeEntry (params, evtData) {
    const jsonEntry = {}
    this._addZomeEntry(params.id, jsonEntry)
    for (let zome of this.json.DNA.Zomes) {
      if (zome.__tplId === params.id) {
        if (!zome.Entries) {
          zome.Entries = []
        }
        zome.Entries.push(jsonEntry)
        break
      }
    }
    this._displayYaml()
  }

  /**
   * Delete a zome entry defined by (params.id)
   */
  $deleteZomeEntry (params, evtData) {
    this._rmTemplate(params.id)
    this._displayYaml()
  }

  /**
   * when the type changes, we need to show/hide the "more" button
   */
  $entryRowType (params, evtData) {
    const row = this.templates[params.id].elems[0]
    row.classList.remove('type-json')
    row.classList.remove('type-links')
    row.classList.remove('type-string')
    row.classList.add('type-' + evtData.elem.value)
  }

  /**
   * For "json" entry types, allow editing of the schema
   */
  $zomeEntryMore (params, evtData) {
    let zomeRef
    for (let zome of this.json.DNA.Zomes) {
      if (zome.__tplId === params['zome-id']) {
        zomeRef = zome
        break
      }
    }
    let entryRef = {}
    for (let entry of zomeRef.Entries) {
      if (entry.__tplId === params.id) {
        entryRef = entry
        break
      }
    }
    const wrap = this._genTemplates(this.ROOT, 'modal', {})
    const cont = wrap.elems[0].querySelector('.modal-container')
    const tpl = this._genTemplates(cont, 'zome-entry-advanced', {
      zomeName: zomeRef.Name || '',
      entryName: entryRef.Name || '',
      'zome-id': params['zome-id'],
      'entry-id': params.id
    })

    let schema = entryRef.Schema
    if (!schema) {
      schema = JSON.parse(JSON.stringify(JSON_SCHEMA_EXAMPLE))
      schema.id = 'http://example.com/' +
        (zomeRef.Name || 'zome').replace(/\s/g, '').toLowerCase() + '/' +
        (entryRef.Name || 'entry').replace(/\s/g, '').toLowerCase() +
        '.json'
      entryRef.Schema = schema
      this._displayYaml()
    }
    EntrySchemas[entryRef.Name] = schema

    const results = tpl.parent.querySelector('.results')

    const json = tpl.parent.querySelector('.json-schema-display')
    const editor = ace.edit(json)
    editor.$blockScrolling = Infinity
    editor.setTheme('ace/theme/github')
    editor.getSession().setMode('ace/mode/json')
    editor.setValue(JSON.stringify(schema, null, '  '))
    editor.clearSelection()
    editor.getSession().on('change', () => {
      let newSchema
      while (results.childNodes.length) {
        results.removeChild(results.childNodes[0])
      }
      try {
        newSchema = JSON.parse(editor.getValue())

        const res = jsonSchemaValidate(newSchema)
        if (!res) {
          throw new Error(ajv.errorsText(jsonSchemaValidate.errors))
        }
      } catch (e) {
        results.appendChild(document.createTextNode(e.toString()))
        return
      }

      results.appendChild(document.createTextNode(__('notice-changesSaved')))
      entryRef.Schema = newSchema
      EntrySchemas[entryRef.Name] = newSchema
      this._displayYaml()
    })
  }

  /**
   * Add a function to the zome defined by (params.id)
   */
  $addZomeFunction (params, evtData) {
    const jsonFunc = {}
    this._addZomeFunction(params.id, jsonFunc)
    for (let zome of this.json.DNA.Zomes) {
      if (zome.__tplId === params.id) {
        if (!zome.Functions) {
          zome.Functions = []
        }
        zome.Functions.push(jsonFunc)
        break
      }
    }
    this._displayYaml()
  }

  /**
   * Delete a zome function defined by (params.id)
   */
  $deleteZomeFunction (params, evtData) {
    this._rmTemplate(params.id)
    this._displayYaml()
  }

  // -- private -- //

  /**
   * Given a blob and a filename, trigger a client-side download
   */
  _triggerDownload (blob, filename) {
    const data = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.style.display = 'none'
    a.href = data
    a.download = filename
    this.ROOT.appendChild(a)
    a.click()
    this.ROOT.removeChild(a)
    URL.revokeObjectURL(data)
  }

  /**
   * Generate yaml from the UI (dom) nodes, and display it in the sidebar
   */
  _displayYaml () {
    this.yamlDisplayEditor.setValue(this._genYaml())
    this.yamlDisplayEditor.clearSelection()
  }

  /**
   * Generates a v4 compatible uuid
   */
  _genUuid () {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      let r = (Math.random() * 16) | 0
      return (c === 'x'
        ? r
        : (r & 0x3 | 0x8)).toString(16)
    })
  }

  /**
   * Render an additional zome to our list
   */
  _addZome (zome) {
    const tpl = this._genTemplates(this.zomesDiv, 'zome', {})
    zome.__tplId = tpl.id
    return tpl
  }

  /**
   * Render an additional entry into a zome by template id
   */
  _addZomeEntry (zomeTemplateId, jsonEntry) {
    const parentTemplate = this.templates[zomeTemplateId]
    const tpl = this._genTemplates(parentTemplate.parent.querySelector(
      '#zomeentries-' + zomeTemplateId), 'zome-entry', {
      'zome-id': zomeTemplateId
    }
    )
    tpl.elems[0].classList.add('type-json')
    jsonEntry.__tplId = tpl.id
    if (typeof jsonEntry.Required !== 'boolean') {
      jsonEntry.Required = true
    }
    return tpl
  }

  /**
   * Render an additional function into a zome by template id
   */
  _addZomeFunction (zomeTemplateId, jsonFunc) {
    const parentTemplate = this.templates[zomeTemplateId]
    const tpl = this._genTemplates(parentTemplate.parent.querySelector(
      '#zomefunctions-' + zomeTemplateId), 'zome-function', {})
    jsonFunc.__tplId = tpl.id
    return tpl
  }

  /**
   * ONLY INVOKE ON STARTUP
   * Loads a json blob into UI (dom) elements
   */
  _loadJson (json) {
    try {
      this.json = json

      this.uuid = json.DNA.UUID

      this.appName.value = json.DNA.Name || ''

      if (json.DNA.Properties) {
        this.appDesc.value = json.DNA.Properties.description
      }

      for (let zome of json.DNA.Zomes) {
        let tpl = this._addZome(zome)

        tpl.elems[0].querySelector('.zomename').value = zome.Name
        tpl.elems[0].querySelector('.zomedesc').value = zome.Description

        this._loadJsonEntries(zome, tpl.id)
        this._loadJsonFunctions(zome, tpl.id)
      }

      this._displayYaml()
    } catch (e) {
      // some loading error... clear, alert and reload
      localStorage.removeItem(SAVE_JSON_KEY)

      alert('error loading json: ' + e.toString())

      location.reload()
    }
  }

  /**
   * Used by _loadJson to add entries to a zome
   */
  _loadJsonEntries (json, zomeTemplateId) {
    for (let entry of json.Entries) {
      const tpl = this._addZomeEntry(zomeTemplateId, entry)

      const row = tpl.elems[0]
      row.classList.add('type-' + (entry.DataFormat || 'json'))
      row.querySelector('.zome-entry-name').value = entry.Name || ''
      row.querySelector('.zome-entry-data-format').value =
        entry.DataFormat || 'json'
      row.querySelector('.zome-entry-sharing').value =
        entry.Sharing || 'public'

      if (typeof entry._ === 'string') {
        row.querySelector('.zome-entry-create').checked =
          (entry._.indexOf('c') > -1)
        row.querySelector('.zome-entry-read').checked =
          (entry._.indexOf('r') > -1)
        row.querySelector('.zome-entry-update').checked =
          (entry._.indexOf('u') > -1)
        row.querySelector('.zome-entry-delete').checked =
          (entry._.indexOf('d') > -1)
      }
    }
  }

  /**
   * Used by _loadJson to add functions to a zome
   */
  _loadJsonFunctions (json, zomeTemplateId) {
    for (let func of json.Functions) {
      if (typeof func._ === 'string' && func._.indexOf(':') === 1) {
        continue
      }

      const tpl = this._addZomeFunction(zomeTemplateId, func)

      const row = tpl.elems[0]

      row.querySelector('.zome-function-name').value = func.Name
      row.querySelector('.zome-function-calling-type').value = func.CallingType
      row.querySelector('.zome-function-exposure').value = func.Exposure
    }
  }

  /**
   * Generates a JSON blob based off the current UI (dom) elements
   * Then passes that through `toYaml` to append the annotation comments
   */
  _genYaml () {
    const json = this.json

    if (!json.DNA) {
      json.DNA = {}
    }

    json.DNA.UUID = this.uuid

    json.DNA.Name = this.appName.value
    if (!json.DNA.Properties) {
      json.DNA.Properties = {}
    }
    const props = json.DNA.Properties

    props.description = this.appDesc.value

    props.language = i18n.getLocale()

    this._genZomesJson()

    this._genTestJson()

    localStorage.setItem(SAVE_JSON_KEY, JSON.stringify(json))

    return toYaml(json)
  }

  /**
   * Used by _genYaml to add zomes
   */
  _genZomesJson () {
    const zomes = this.zomesDiv.querySelectorAll('.zome')
    const data = []

    const currentOrNew = (id) => {
      for (let zome of this.json.DNA.Zomes) {
        if (zome.__tplId === id) {
          return zome
        }
      }
      return {}
    }

    for (let zome of zomes) {
      const obj = currentOrNew(zome.id)

      obj.Name = zome.querySelector('.zomename').value
      obj.Description = zome.querySelector('.zomedesc').value

      this._genZomeEntryJson(obj, zome)

      this._genZomeFunctionJson(obj, zome)

      obj.Code = CODE_GEN[obj.RibosomeType || 'js'].generate({
        entryNames: obj.Entries.map((e) => { return e.Name }),
        functions: obj.Functions
      })

      data.push(obj)
    }

    this.json.DNA.Zomes = data
  }

  /**
   * Used by _genYaml to add entries to a zome
   */
  _genZomeEntryJson (jsonZome, parent) {
    const rows = parent.querySelectorAll('.zome-entry-row')
    const data = []

    const currentOrNew = (id) => {
      for (let entry of jsonZome.Entries) {
        if (entry.__tplId === id) {
          return entry
        }
      }
      return {}
    }

    for (let row of rows) {
      const obj = currentOrNew(row.id)

      const name = row.querySelector('.zome-entry-name').value
      if (!name.trim().length) {
        continue
      }

      obj.Name = name
      obj.DataFormat = row.querySelector('.zome-entry-data-format').value
      obj.Sharing = row.querySelector('.zome-entry-sharing').value
      if (obj.DataFormat === 'json' && EntrySchemas[name]) {
        obj.Schema = EntrySchemas[name]
      }

      if (typeof obj.Schema !== 'object') {
        try {
          obj.Schema = JSON.parse(obj.Schema)
        } catch (e) {
        }
      }

      let hint = ''
      row.querySelector('.zome-entry-create').checked && (hint += 'c')
      row.querySelector('.zome-entry-read').checked && (hint += 'r')
      row.querySelector('.zome-entry-update').checked && (hint += 'u')
      row.querySelector('.zome-entry-delete').checked && (hint += 'd')

      if (!hint.length) {
        hint = '-'
      }

      obj._ = hint

      data.push(obj)
    }

    jsonZome.Entries = data
  }

  /**
   * Used by _genYaml to add functions to a zome
   */
  _genZomeFunctionJson (jsonZome, parent) {
    const data = []

    const addFunction = (name, callingType, exposure, hint) => {
      const obj = {
        Name: name,
        CallingType: callingType,
        Exposure: exposure
      }

      if (hint) {
        obj._ = hint
      }

      data.push(obj)
    }

    // first go through the entries and add CRUD functions
    const entryRows = parent.querySelectorAll('.zome-entry-row')
    for (let row of entryRows) {
      const name = row.querySelector('.zome-entry-name').value
      if (!name.trim().length) {
        continue
      }

      if (row.querySelector('.zome-entry-create').checked) {
        addFunction(name + 'Create',
          row.querySelector('.zome-entry-data-format').value,
          row.querySelector('.zome-entry-sharing').value,
          'c:' + name
        )
      }

      if (row.querySelector('.zome-entry-read').checked) {
        addFunction(name + 'Read',
          row.querySelector('.zome-entry-data-format').value,
          row.querySelector('.zome-entry-sharing').value,
          'r:' + name
        )
      }

      if (row.querySelector('.zome-entry-update').checked) {
        addFunction(name + 'Update',
          row.querySelector('.zome-entry-data-format').value,
          row.querySelector('.zome-entry-sharing').value,
          'u:' + name
        )
      }

      if (row.querySelector('.zome-entry-delete').checked) {
        addFunction(name + 'Delete',
          row.querySelector('.zome-entry-data-format').value,
          row.querySelector('.zome-entry-sharing').value,
          'd:' + name
        )
      }
    }

    // next go through the manually defined functions
    const rows = parent.querySelectorAll('.zome-function-row')
    for (let row of rows) {
      const name = row.querySelector('.zome-function-name').value
      if (!name.trim().length) {
        continue
      }
      addFunction(
        name,
        row.querySelector('.zome-function-calling-type').value,
        row.querySelector('.zome-function-exposure').value
      )
    }

    jsonZome.Functions = data
  }

  /**
   * Generate tests for auto-generated crud functions
   * and test placeholders for custom functions
   */
  _genTestJson () {
    const sets = this.json.TestSets = []

    for (let zome of this.json.DNA.Zomes) {
      const set = {
        Name: zome.Name,
        TestSet: {
          Tests: []
        }
      }

      for (let fn of zome.Functions) {
        const testObj = {
          Convey: 'auto-generated test for ' + fn.Name,
          Zome: zome.Name,
          FnName: fn.Name
        }

        const crudVal = fn.CallingType === 'json' ? constants.TEST_JSON_PAYLOAD : constants.TEST_STRING_PAYLOAD
        const fnVal = fn.CallingType === 'json' ? constants.TEST_FN_OUTPUT_JSON : constants.TEST_FN_OUTPUT_STRING

        switch ((fn._ || '')[0]) {
          case 'c':
            testObj.Input = crudVal
            testObj.Output = '%h%'
            break
          case 'r':
            testObj.Input = '%h%'
            testObj.Output = crudVal
            break
          case 'u':
            testObj.Input = '%h%'
            testObj.Output = '%h%'
            break
          case 'd':
            testObj.Input = '%h%'
            testObj.Output = '%h%'
            break
          default:
            testObj.Input = ''
            testObj.Output = fnVal
            break
        }

        set.TestSet.Tests.push(testObj)
      }

      if (set.TestSet.Tests.length > 0) {
        sets.push(set)
      }
    }
  }

  /**
   * See if we have a binding data attribute... if we do,
   * bind it. Then recurse into child nodes.
   */
  _recBind (elem) {
    for (let child of elem.childNodes) {
      this._recBind(child)
    }
    if (!elem.getAttribute) {
      return
    }
    let events = elem.getAttribute('data-hc-bind')
    if (!events) {
      return
    }
    events = events.split(/\s+/)

    let params = {}
    let attrs = Object.keys(elem.attributes)
    for (let aidx = 0; aidx < attrs.length; ++aidx) {
      let attr = elem.attributes[attrs[aidx]]
      if (attr.name && attr.name.startsWith('data-hc-')) {
        params[attr.name.substr(8)] =
          attr.value || attr.nodeValue || attr.textContent
      }
    }

    for (let event of events) {
      let evtName = event.split(':')
      let fnName = evtName[1]
      evtName = evtName[0]
      elem.addEventListener(evtName, (evt) => {
        if (typeof this[fnName] !== 'function') {
          throw new Error('bad bind ' + fnName)
        }
        return this[fnName](JSON.parse(JSON.stringify(params)), {
          elem: elem,
          evtName: evtName,
          evt: evt
        })
      }, false)
    }
  }

  /**
   * I don't know why we care, but generate ids that are hard to guess
   * what the next one will be
   */
  _genId () {
    const out = this.nextTemplateId.toString(36).replace(/\./g, '-')
    this.nextTemplateId += Math.random()
    return out
  }

  /**
   * Given a parent dom node, instantiate a template into dom elements
   * and append those elements. Make sure any nodes with binding attributes
   * are bound (_recBind). Includes special handling for tables.
   */
  _genTemplates (parent, name, data) {
    const template = {
      __: __,
      elems: [],
      parent: parent,
      id: name + '-' + this._genId()
    }
    for (let key in data) {
      template[key] = data[key]
    }

    let d
    if (parent.nodeName === 'TABLE') {
      d = document.createElement('table')
    } else {
      d = document.createElement('div')
    }
    d.innerHTML = handlebars.templates[name](template)
    this._recBind(d)

    if (parent.nodeName === 'TABLE') {
      while (d.rows.length) {
        let r = d.rows[0]
        d.deleteRow(0)
        template.elems.push(r)
        parent.querySelector('tbody').appendChild(r)
      }
    } else {
      for (let c of d.childNodes) {
        d.removeChild(c)
        template.elems.push(c)
        parent.appendChild(c)
      }
    }

    this.templates[template.id] = template
    return template
  }

  /**
   * Delete a template from the dom tree, and clean up our refs.
   */
  _rmTemplate (id) {
    let template = this.templates[id]
    if (template.parent.nodeName === 'TABLE') {
      for (let row of template.elems) {
        template.parent.querySelector('tbody').removeChild(row)
      }
    } else {
      for (let elem of template.elems) {
        template.parent.removeChild(elem)
      }
    }
    delete this.templates[template.id]
    template.parent = null
    template.elems = null
  }
}

// entrypoint
;(function main () {
  const instance = new HcScaffold()
  instance.run()
})()
