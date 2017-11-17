'use strict'

const i18n = require('./hc-i18n')
const __ = i18n.getText
const version = require('./gen/version')

/**
 * Given a json dna blob, render yaml with comment annotations.
 * We do this by adding bizarrely named properties to the objects,
 * then swapping them out with regular expressions.
 *
 * {
 *   "# this is a comment": true,
 *   "value": true
 * }
 *
 * becomes:
 *
 * {
 *   # this is a comment
 *   "value": true
 * }
 */
exports.toYaml = function toYaml (json) {
  let out = _addCommentsToJson(json)

  out = JSON.stringify(out, null, '  ')

  // first - convert the comments that add newlines
  out = out.replace(
    /(\s*)"! ([^"]+)": true,?/g, '\n$1# $2')

  // second - convert the previous line comments
  out = out.replace(
    /\n(\s*)"< ([^"]+)": true,?/g, ' # $2')

  // finally - convert the single-line comments
  out = out.replace(
    /(\s*)"# ([^"]+)": true,?/g, '$1# $2')

  return out
}

/**
 * Add top-level scaffold and dna properties
 */
function _addCommentsToJson (json) {
  // make sure not to corrupt the input
  json = JSON.parse(JSON.stringify(json))

  const root = {}

  _c(root, '#', 'yaml-header')

  _f(root, 'scaffoldVersion')
  root.scaffoldVersion = '0.0.2'
  root.generator = 'hc-scaffold:' + version.version

  _f(root, 'DNA')
  const dna = root.DNA = {}

  if (!json.DNA) {
    json.DNA = {}
  }

  _f(dna, 'Version')
  dna.Version = json.DNA.Version || 1

  _f(dna, 'UUID')
  dna.UUID = json.DNA.UUID || null

  _f(dna, 'Name')
  dna.Name = json.DNA.Name || ''

  _f(dna, 'Properties')
  const props = dna.Properties = {}

  if (!json.DNA.Properties) {
    json.DNA.Properties = {}
  }

  _f(props, 'Properties.description')
  props.description = json.DNA.Properties.description || ''

  _f(props, 'Properties.language')
  props.language = json.DNA.Properties.language || 'en'

  _f(dna, 'PropertiesSchemaFile')
  dna.PropertiesSchemaFile = json.DNA.PropertiesSchemaFile ||
    'properties_schema.json'

  _f(dna, 'DHTConfig')

  if (!json.DNA.DHTConfig) {
    json.DNA.DHTConfig = {}
  }

  dna.DHTConfig = {
    HashType: json.DNA.DHTConfig.HashType || 'sha2-256'
  }

  if (!json.DNA.Zomes) {
    json.DNA.Zomes = []
  }

  _f(dna, 'Zomes')
  dna.Zomes = _addCommentsToZomes(json.DNA.Zomes)

  _f(root, 'Tests')
  root.Tests =
  [ { 'Name': 'sample',
    'Tests': [{'Convey': 'This is an empty test that will break. Holochain is test driven, please see: https://github.com/metacurrency/holochain/wiki/App-Testing', 'FnName': 'sampleEntryCreate', 'Input': {'body': 'this is the entry body', 'stamp': 12345}, 'Output': '"%h1%"', 'Exposure': 'public'}]
  }
  ]

  return root
}

/**
 * add zome properties
 */
function _addCommentsToZomes (json) {
  const out = []

  for (let zome of json) {
    const obj = {}

    _f(obj, 'Zomes.Name')
    obj.Name = zome.Name || ''

    _f(obj, 'Zomes.Description')
    obj.Description = zome.Description || ''

    _f(obj, 'Zomes.RibosomeType')
    obj.RibosomeType = zome.RibosomeType || 'js'

    _f(obj, 'Zomes.CodeFile')
    obj.CodeFile = zome.CodeFile || obj.Name.toLowerCase() + '.js'

    if (!zome.Entries) {
      zome.Entries = []
    }

    _f(obj, 'Zomes.Entries')
    obj.Entries = _addCommentsToZomeEntries(zome.Entries)

    if (!zome.Functions) {
      zome.Functions = []
    }

    _f(obj, 'Zomes.Functions')
    obj.Functions = _addCommentsToZomeFunctions(zome.Functions)

    _f(obj, 'Zomes.Code')
    obj.Code = zome.Code || ''

    out.push(obj)
  }

  return out
}

/**
 * add zome entry properties
 */
function _addCommentsToZomeEntries (json) {
  const out = []

  for (let entry of json) {
    const name = (entry.Name || '').trim()
    if (!name.length) {
      continue
    }

    const obj = {}

    obj.Name = name
    _c(obj, '<', 'field-desc-Zomes.Entries.Name')

    obj.Required = (typeof entry.Required === 'boolean')
      ? entry.Required
      : true
    _c(obj, '<', 'field-desc-Zomes.Entries.Required')

    const format = entry.DataFormat || 'json'
    obj.DataFormat = format
    _c(obj, '<', 'field-desc-Zomes.Entries.DataFormat')

    obj.Sharing = entry.Sharing || 'public'
    _c(obj, '<', 'field-desc-Zomes.Entries.Sharing')

    if (format === 'json') {
      // obj.SchemaFile = entry.SchemaFile || name + '.json'
      obj.Schema = JSON.stringify(entry.Schema, null, 2)
    }

    if (entry._) {
      obj._ = entry._
    }

    out.push(obj)
  }

  return out
}

/**
 * add zome function properties
 */
function _addCommentsToZomeFunctions (json) {
  const out = []

  for (let func of json) {
    const name = (func.Name || '').trim()
    if (!name.length) {
      continue
    }

    const obj = {}

    obj.Name = name
    _c(obj, '<', 'field-desc-Zomes.Functions.Name')

    obj.CallingType = func.CallingType || 'json'
    _c(obj, '<', 'field-desc-Zomes.Functions.CallingType')

    obj.Exposure = func.Exposure || ''
    _c(obj, '<', 'field-desc-Zomes.Functions.Exposure')

    if (func._) {
      obj._ = func._
    }

    out.push(obj)
  }

  return out
}

/**
 * comment helper
 * @param {object} obj - the object to add a comment to
 * @param {string} t - the type of the comment [#!<]
 * @param {string} id - the id to find the string in i18n
 */
function _c (obj, t, id) {
  obj[t + ' ' + __(id)] = true
}

/**
 * comment helper
 * the most common comment type needs a newline (!)
 */
function _f (obj, name, value) {
  _c(obj, '!', 'field-name-' + name)
  _c(obj, '#', 'field-desc-' + name)
}
