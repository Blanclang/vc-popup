var Components = require('../components.json')
var fs = require('fs')
var render = require('json-templater/string')
var uppercamelcase = require('uppercamelcase')
var path = require('path')

var OUTPUT_PATH = path.join(__dirname, '../src/index.js')
var IMPORT_TEMPLATE = 'import {{name}} from \'./components/{{package}}/index\''
var ISNTALL_COMPONENT_TEMPLATE = '  Vue.component({{name}}.name, {{name}})'
var MAIN_TEMPLATE = `{{include}}

const version = '{{version}}'
const install = function (Vue, config = {}) {
  if (install.installed) return
{{install}}
  Vue.prototype.$popup = PopupBase
  Vue.prototype.$bottomMenu = PopupBottomMenu
  Vue.prototype.$centerMenu = PopupCenterMenu
  Vue.prototype.$pressMenu = PopupPressMenu
  Vue.prototype.$dialog = PopupDialog
  Vue.prototype.$imgViewer = PopupImgViewer
  Vue.prototype.$picker = PopupPicker
  Vue.prototype.$calendar = PopupCalendar
  Vue.prototype.$popupOver = PopupOver
  Vue.prototype.$datetimePicker = PopupDatetimePicker
}

// auto install
if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue)
}

export default {
  install,
  version,
{{list}}
}
`

var ComponentNames = Object.keys(Components)

var includeComponentTemplate = []
var installTemplate = []
var listTemplate = []

ComponentNames.forEach(name => {
  var componentName = uppercamelcase(name)

  includeComponentTemplate.push(render(IMPORT_TEMPLATE, {
    name: componentName,
    package: name
  }))

  if ([
    // services
    'PopupBase',
    'PopupBottomMenu',
    'PopupCenterMenu',
    'PopupPressMenu',
    'PopupDialog',
    'PopupDialogCustom',
    'PopupImgViewer',
    'PopupPicker',
    'PopupCalendar',
    'PopupOver',
    'PopupDatetimePicker'
  ].indexOf(componentName) === -1) {
    installTemplate.push(render(ISNTALL_COMPONENT_TEMPLATE, {
      name: componentName,
      component: name
    }))
  }

  listTemplate.push(`  ${componentName}`)
})

var template = render(MAIN_TEMPLATE, {
  include: includeComponentTemplate.join('\n'),
  install: installTemplate.join('\n'),
  version: process.env.VERSION || require('../package.json').version,
  list: listTemplate.join(',\n')
})

fs.writeFileSync(OUTPUT_PATH, template)
console.log('[build entry] DONE:', OUTPUT_PATH)
