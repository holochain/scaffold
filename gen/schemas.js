'use strict'
module.exports = exports = {
  "schema-hc-scaffold-default-values": {
    "#1": "clone this file to generate a default blank scaffold",
    "scaffoldVersion": "0.0.1",
    "name": ""
  },
  "schema-hc-scaffold-dummy-values": {
    "#1": "this file lets us replace one property for validation",
    "#2": "without worrying about other fields getting in the way.",
    "scaffoldVersion": "0.0.1",
    "name": "dummy"
  },
  "schema-hc-scaffold": {
    "$schema": "http://json-schema.org/schema#",
    "id": "http://ceptr.org/projects/holochain/schemas/schema-hc-scaffold.json",
    "definitions": {},
    "type": "object",
    "required": [
      "scaffoldVersion",
      "name"
    ],
    "properties": {
      "scaffoldVersion": {
        "type": "string",
        "pattern": "^\\d+\\.\\d+\\.\\d+$"
      },
      "name": {
        "type": "string",
        "pattern": "^.+$"
      }
    }
  }
}