'use strict'

const SrcWizard = require('../lib/wizard').Wizard
const MinWizard = require('../dist/js/hc_scaffold_wizard').Wizard

const testWizard = require('./test-wizard')

describe('HC-Scaffold Test Suite', () => {
  testWizard.specify('Source Wizard Tests', SrcWizard)
  testWizard.specify('Minified Wizard Tests', MinWizard)
})
