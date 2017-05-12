'use strict'

const Vue = require('vue')
const FieldBasic = require('./fieldBasic.vue')
const App = require('./app.vue')

Vue.component('fieldBasic', FieldBasic)

let app = new Vue({
  el: '#app',
  render: function (createElement) {
    return createElement(App)
  }
})
if (typeof app !== 'object') {
  console.log('wha?')
}
