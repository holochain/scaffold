'use strict'
module.exports = exports = {
  "hc-scaffold-meta-schema": {
    "$schema": "http://json-schema.org/draft-06/schema#",
    "$id": "http://ceptr.org/projects/holochain/schemas/hc-scaffold-meta-schema.json",
    "title": "Core schema meta-schema + hc scaffold specific additions",
    "definitions": {
      "schemaArray": {
        "type": "array",
        "minItems": 1,
        "items": {
          "$ref": "#"
        }
      },
      "nonNegativeInteger": {
        "type": "integer",
        "minimum": 0
      },
      "nonNegativeIntegerDefault0": {
        "allOf": [
          {
            "$ref": "#/definitions/nonNegativeInteger"
          },
          {
            "default": 0
          }
        ]
      },
      "simpleTypes": {
        "enum": [
          "array",
          "boolean",
          "integer",
          "null",
          "number",
          "object",
          "string"
        ]
      },
      "hcHintTypes": {
        "enum": [
          "category",
          "checkbox",
          "hidden",
          "loop",
          "table",
          "text"
        ]
      },
      "stringArray": {
        "type": "array",
        "items": {
          "type": "string"
        },
        "uniqueItems": true,
        "default": []
      }
    },
    "type": [
      "object",
      "boolean"
    ],
    "required": [
      "hc-hint-type"
    ],
    "properties": {
      "$id": {
        "type": "string",
        "format": "uri-reference"
      },
      "$schema": {
        "type": "string",
        "format": "uri"
      },
      "$ref": {
        "type": "string",
        "format": "uri-reference"
      },
      "title": {
        "type": "string"
      },
      "description": {
        "type": "string"
      },
      "default": {},
      "multipleOf": {
        "type": "number",
        "exclusiveMinimum": 0
      },
      "maximum": {
        "type": "number"
      },
      "exclusiveMaximum": {
        "type": "number"
      },
      "minimum": {
        "type": "number"
      },
      "exclusiveMinimum": {
        "type": "number"
      },
      "maxLength": {
        "$ref": "#/definitions/nonNegativeInteger"
      },
      "minLength": {
        "$ref": "#/definitions/nonNegativeIntegerDefault0"
      },
      "pattern": {
        "type": "string",
        "format": "regex"
      },
      "additionalItems": {
        "$ref": "#"
      },
      "items": {
        "anyOf": [
          {
            "$ref": "#"
          },
          {
            "$ref": "#/definitions/schemaArray"
          }
        ],
        "default": {}
      },
      "maxItems": {
        "$ref": "#/definitions/nonNegativeInteger"
      },
      "minItems": {
        "$ref": "#/definitions/nonNegativeIntegerDefault0"
      },
      "uniqueItems": {
        "type": "boolean",
        "default": false
      },
      "contains": {
        "$ref": "#"
      },
      "maxProperties": {
        "$ref": "#/definitions/nonNegativeInteger"
      },
      "minProperties": {
        "$ref": "#/definitions/nonNegativeIntegerDefault0"
      },
      "required": {
        "$ref": "#/definitions/stringArray"
      },
      "additionalProperties": {
        "$ref": "#"
      },
      "definitions": {
        "type": "object",
        "additionalProperties": {
          "$ref": "#"
        },
        "default": {}
      },
      "properties": {
        "type": "object",
        "additionalProperties": {
          "$ref": "#"
        },
        "default": {}
      },
      "patternProperties": {
        "type": "object",
        "additionalProperties": {
          "$ref": "#"
        },
        "default": {}
      },
      "dependencies": {
        "type": "object",
        "additionalProperties": {
          "anyOf": [
            {
              "$ref": "#"
            },
            {
              "$ref": "#/definitions/stringArray"
            }
          ]
        }
      },
      "propertyNames": {
        "$ref": "#"
      },
      "const": {},
      "enum": {
        "type": "array",
        "minItems": 1,
        "uniqueItems": true
      },
      "type": {
        "anyOf": [
          {
            "$ref": "#/definitions/simpleTypes"
          },
          {
            "type": "array",
            "items": {
              "$ref": "#/definitions/simpleTypes"
            },
            "minItems": 1,
            "uniqueItems": true
          }
        ]
      },
      "hc-hint-type": {
        "$ref": "#/definitions/hcHintTypes"
      },
      "format": {
        "type": "string"
      },
      "allOf": {
        "$ref": "#/definitions/schemaArray"
      },
      "anyOf": {
        "$ref": "#/definitions/schemaArray"
      },
      "oneOf": {
        "$ref": "#/definitions/schemaArray"
      },
      "not": {
        "$ref": "#"
      }
    },
    "default": {}
  },
  "hc-scaffold-schema": {
    "$schema": "http://json-schema.org/draft-06/schema#",
    "id": "http://ceptr.org/projects/holochain/schemas/hc-scaffold-schema.json",
    "definitions": {},
    "type": "object",
    "hc-hint-type": "category",
    "required": [
      "scaffoldVersion",
      "name",
      "properties",
      "holochainDirectory",
      "zomes"
    ],
    "properties": {
      "scaffoldVersion": {
        "type": "string",
        "hc-hint-type": "hidden",
        "pattern": "^\\d+\\.\\d+\\.\\d+$",
        "default": "0.0.1"
      },
      "name": {
        "type": "string",
        "hc-hint-type": "text",
        "hc-hint-dummy": "dummy",
        "pattern": "^.+$",
        "default": ""
      },
      "properties": {
        "type": "object",
        "hc-hint-type": "category",
        "required": [
          "humanLanguages"
        ],
        "properties": {
          "humanLanguages": {
            "type": "array",
            "hc-hint-type": "table",
            "default": [
              {
                "name": "en"
              }
            ],
            "items": {
              "type": "object",
              "hc-hint-type": "category",
              "required": [
                "name"
              ],
              "properties": {
                "name": {
                  "type": "string",
                  "hc-hint-type": "text",
                  "hc-hint-dummy": "en",
                  "pattern": "^\\S\\S$",
                  "default": ""
                }
              }
            }
          }
        }
      },
      "holochainDirectory": {
        "type": "object",
        "hc-hint-type": "category",
        "required": [
          "list",
          "publishDna",
          "searchable"
        ],
        "properties": {
          "list": {
            "type": "boolean",
            "hc-hint-type": "checkbox",
            "default": true
          },
          "publishDna": {
            "type": "boolean",
            "hc-hint-type": "checkbox",
            "default": true
          },
          "searchable": {
            "type": "boolean",
            "hc-hint-type": "checkbox",
            "default": true
          }
        }
      },
      "zomes": {
        "type": "array",
        "hc-hint-type": "loop",
        "default": [],
        "items": {
          "type": "object",
          "hc-hint-type": "category",
          "required": [
            "name",
            "entryTypes"
          ],
          "properties": {
            "name": {
              "type": "string",
              "hc-hint-type": "text",
              "hc-hint-dummy": "dummy",
              "pattern": "^.+$",
              "default": ""
            },
            "entryTypes": {
              "type": "array",
              "hc-hint-type": "table",
              "default": [],
              "items": {
                "type": "object",
                "hc-hint-type": "category",
                "required": [
                  "label",
                  "type"
                ],
                "properties": {
                  "label": {
                    "type": "string",
                    "hc-hint-type": "text",
                    "hc-hint-dummy": "dummy",
                    "pattern": "^.+$",
                    "default": ""
                  },
                  "type": {
                    "type": "string",
                    "hc-hint-type": "text",
                    "pattern": "(string|int64|float64)",
                    "default": "string"
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "json-meta-schema": {
    "$schema": "http://json-schema.org/draft-06/schema#",
    "$id": "http://json-schema.org/draft-06/schema#",
    "title": "Core schema meta-schema",
    "definitions": {
      "schemaArray": {
        "type": "array",
        "minItems": 1,
        "items": {
          "$ref": "#"
        }
      },
      "nonNegativeInteger": {
        "type": "integer",
        "minimum": 0
      },
      "nonNegativeIntegerDefault0": {
        "allOf": [
          {
            "$ref": "#/definitions/nonNegativeInteger"
          },
          {
            "default": 0
          }
        ]
      },
      "simpleTypes": {
        "enum": [
          "array",
          "boolean",
          "integer",
          "null",
          "number",
          "object",
          "string"
        ]
      },
      "stringArray": {
        "type": "array",
        "items": {
          "type": "string"
        },
        "uniqueItems": true,
        "default": []
      }
    },
    "type": [
      "object",
      "boolean"
    ],
    "properties": {
      "$id": {
        "type": "string",
        "format": "uri-reference"
      },
      "$schema": {
        "type": "string",
        "format": "uri"
      },
      "$ref": {
        "type": "string",
        "format": "uri-reference"
      },
      "title": {
        "type": "string"
      },
      "description": {
        "type": "string"
      },
      "default": {},
      "multipleOf": {
        "type": "number",
        "exclusiveMinimum": 0
      },
      "maximum": {
        "type": "number"
      },
      "exclusiveMaximum": {
        "type": "number"
      },
      "minimum": {
        "type": "number"
      },
      "exclusiveMinimum": {
        "type": "number"
      },
      "maxLength": {
        "$ref": "#/definitions/nonNegativeInteger"
      },
      "minLength": {
        "$ref": "#/definitions/nonNegativeIntegerDefault0"
      },
      "pattern": {
        "type": "string",
        "format": "regex"
      },
      "additionalItems": {
        "$ref": "#"
      },
      "items": {
        "anyOf": [
          {
            "$ref": "#"
          },
          {
            "$ref": "#/definitions/schemaArray"
          }
        ],
        "default": {}
      },
      "maxItems": {
        "$ref": "#/definitions/nonNegativeInteger"
      },
      "minItems": {
        "$ref": "#/definitions/nonNegativeIntegerDefault0"
      },
      "uniqueItems": {
        "type": "boolean",
        "default": false
      },
      "contains": {
        "$ref": "#"
      },
      "maxProperties": {
        "$ref": "#/definitions/nonNegativeInteger"
      },
      "minProperties": {
        "$ref": "#/definitions/nonNegativeIntegerDefault0"
      },
      "required": {
        "$ref": "#/definitions/stringArray"
      },
      "additionalProperties": {
        "$ref": "#"
      },
      "definitions": {
        "type": "object",
        "additionalProperties": {
          "$ref": "#"
        },
        "default": {}
      },
      "properties": {
        "type": "object",
        "additionalProperties": {
          "$ref": "#"
        },
        "default": {}
      },
      "patternProperties": {
        "type": "object",
        "additionalProperties": {
          "$ref": "#"
        },
        "default": {}
      },
      "dependencies": {
        "type": "object",
        "additionalProperties": {
          "anyOf": [
            {
              "$ref": "#"
            },
            {
              "$ref": "#/definitions/stringArray"
            }
          ]
        }
      },
      "propertyNames": {
        "$ref": "#"
      },
      "const": {},
      "enum": {
        "type": "array",
        "minItems": 1,
        "uniqueItems": true
      },
      "type": {
        "anyOf": [
          {
            "$ref": "#/definitions/simpleTypes"
          },
          {
            "type": "array",
            "items": {
              "$ref": "#/definitions/simpleTypes"
            },
            "minItems": 1,
            "uniqueItems": true
          }
        ]
      },
      "format": {
        "type": "string"
      },
      "allOf": {
        "$ref": "#/definitions/schemaArray"
      },
      "anyOf": {
        "$ref": "#/definitions/schemaArray"
      },
      "oneOf": {
        "$ref": "#/definitions/schemaArray"
      },
      "not": {
        "$ref": "#"
      }
    },
    "default": {}
  }
}