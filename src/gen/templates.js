var Handlebars = require("handlebars/runtime");  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['about'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing, alias3=container.escapeExpression, alias4="function";

  return "<div>\n<h1>\n  <i class=\"material-icons\">&#xE88E;</i> - "
    + alias3((helpers.__ || (depth0 && depth0.__) || alias2).call(alias1,"pageTitle",{"name":"__","hash":{},"data":data}))
    + "\n</h1>\n<br />\n<div>\n  Version: <pre style=\"display: inline-block\">"
    + alias3(((helper = (helper = helpers.version || (depth0 != null ? depth0.version : depth0)) != null ? helper : alias2),(typeof helper === alias4 ? helper.call(alias1,{"name":"version","hash":{},"data":data}) : helper)))
    + "</pre><br />\n  <br />\n  This project uses software.<br />\n  <a href=\""
    + alias3(((helper = (helper = helpers.url || (depth0 != null ? depth0.url : depth0)) != null ? helper : alias2),(typeof helper === alias4 ? helper.call(alias1,{"name":"url","hash":{},"data":data}) : helper)))
    + "\">"
    + alias3(((helper = (helper = helpers.url || (depth0 != null ? depth0.url : depth0)) != null ? helper : alias2),(typeof helper === alias4 ? helper.call(alias1,{"name":"url","hash":{},"data":data}) : helper)))
    + "</a>\n</div>\n</div>\n";
},"useData":true});
templates['lang-button'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<a href=\"javascript:void(0)\" data-hc-bind=\"click:$selectLocale\" data-hc-locale=\""
    + alias4(((helper = (helper = helpers.locale || (depth0 != null ? depth0.locale : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"locale","hash":{},"data":data}) : helper)))
    + "\">\n  <i class=\"material-icons\">&#xE894;</i><span>"
    + alias4(((helper = (helper = helpers.langName || (depth0 != null ? depth0.langName : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"langName","hash":{},"data":data}) : helper)))
    + "</span>\n</a>\n";
},"useData":true});
templates['menu'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<div class=\"menu-bg\" data-hc-bind=\"click:$dismiss\" data-hc-id=\""
    + alias4(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\">\n  <div class=\"menu-container\">\n    <a href=\"javascript:void(0)\" data-hc-bind=\"click:$languageMenu\" data-hc-id=\""
    + alias4(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\">\n      <i class=\"material-icons\">&#xE894;</i><span>"
    + alias4((helpers.__ || (depth0 && depth0.__) || alias2).call(alias1,"button-language",{"name":"__","hash":{},"data":data}))
    + "</span>\n    </a>\n    <a href=\"javascript:void(0)\" data-hc-bind=\"click:$newDocument\" data-hc-id=\""
    + alias4(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\">\n      <i class=\"material-icons\">&#xE148;</i><span>"
    + alias4((helpers.__ || (depth0 && depth0.__) || alias2).call(alias1,"button-newDocument",{"name":"__","hash":{},"data":data}))
    + "</span>\n    </a>\n    <a href=\"javascript:void(0)\" data-hc-bind=\"click:$upload\" data-hc-id=\""
    + alias4(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\">\n      <i class=\"material-icons\">&#xE2C6;</i><span>"
    + alias4((helpers.__ || (depth0 && depth0.__) || alias2).call(alias1,"button-upload",{"name":"__","hash":{},"data":data}))
    + "</span>\n    </a>\n    <a href=\"javascript:void(0)\" data-hc-bind=\"click:$downloadYaml\">\n      <i class=\"material-icons\">&#xE2C4;</i><span>"
    + alias4((helpers.__ || (depth0 && depth0.__) || alias2).call(alias1,"button-downloadScaffoldYaml",{"name":"__","hash":{},"data":data}))
    + "</span>\n    </a>\n    <a href=\"javascript:void(0)\" data-hc-bind=\"click:$about\" data-hc-id=\""
    + alias4(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\">\n      <i class=\"material-icons\">&#xE88E;</i><span>"
    + alias4((helpers.__ || (depth0 && depth0.__) || alias2).call(alias1,"button-about",{"name":"__","hash":{},"data":data}))
    + "</span>\n    </a>\n  </div>\n</div>\n";
},"useData":true});
templates['modal'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<div class=\"modal-bg\" data-hc-bind=\"click:$dismiss\" data-hc-id=\""
    + alias4(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\">\n  <div class=\"modal-wrap\" data-hc-bind=\"click:$intercept\">\n    <div class=\"modal-container\">\n    </div>\n    <div class=\"modal-button\">\n      <a href=\"javascript:void(0)\" data-hc-bind=\"click:$dismiss\" data-hc-id=\""
    + alias4(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\">\n        <i class=\"material-icons\">&#xE5C4;</i><span>"
    + alias4((helpers.__ || (depth0 && depth0.__) || alias2).call(alias1,"button-back",{"name":"__","hash":{},"data":data}))
    + "</span>\n      </a>\n    </div>\n  </div>\n</div>\n";
},"useData":true});
templates['page'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing, alias3=container.escapeExpression;

  return "<div class=\"page\">\n  <form>\n    <h1>"
    + alias3((helpers.__ || (depth0 && depth0.__) || alias2).call(alias1,"pageTitle",{"name":"__","hash":{},"data":data}))
    + "</h1>\n    <div class=\"instructions\">"
    + alias3((helpers.__ || (depth0 && depth0.__) || alias2).call(alias1,"pageInstructions",{"name":"__","hash":{},"data":data}))
    + "</div>\n    <fieldset>\n      <legend>"
    + alias3((helpers.__ || (depth0 && depth0.__) || alias2).call(alias1,"field-name-Name",{"name":"__","hash":{},"data":data}))
    + "</legend>\n      <label for=\"appname\">"
    + alias3((helpers.__ || (depth0 && depth0.__) || alias2).call(alias1,"field-desc-Name",{"name":"__","hash":{},"data":data}))
    + "</label>\n      <input type=\"text\" data-hc-bind=\"change:$render keyup:$render\" id=\"appname\" />\n    </fieldset>\n    <fieldset>\n      <legend>"
    + alias3((helpers.__ || (depth0 && depth0.__) || alias2).call(alias1,"field-name-Properties.description",{"name":"__","hash":{},"data":data}))
    + "</legend>\n      <label for=\"appdesc\">"
    + alias3((helpers.__ || (depth0 && depth0.__) || alias2).call(alias1,"field-desc-Properties.description",{"name":"__","hash":{},"data":data}))
    + "</label>\n      <input type=\"text\" data-hc-bind=\"change:$render keyup:$render\" id=\"appdesc\" />\n    </fieldset>\n\n    <div class=\"instructions\">\n      "
    + alias3((helpers.__ || (depth0 && depth0.__) || alias2).call(alias1,"field-desc-Zomes",{"name":"__","hash":{},"data":data}))
    + "\n    </div>\n    <div id=\"zomes\"></div>\n    <a href=\"javascript:void(0)\" data-hc-bind=\"click:$addZome\">\n      <i class=\"material-icons\">&#xE147;</i><span>"
    + alias3((helpers.__ || (depth0 && depth0.__) || alias2).call(alias1,"button-addZome",{"name":"__","hash":{},"data":data}))
    + "</span>\n    </a>\n  </form>\n  <div class=\"sidebar\">\n    <a href=\"javascript:void(0)\" data-hc-bind=\"click:$toggleYaml\" class=\"when-shown\">\n      <i class=\"material-icons\">&#xE315;</i><span>"
    + alias3((helpers.__ || (depth0 && depth0.__) || alias2).call(alias1,"button-showHideYaml",{"name":"__","hash":{},"data":data}))
    + "</span>\n    </a>\n    <a href=\"javascript:void(0)\" data-hc-bind=\"click:$menu\" class=\"when-shown\">\n      <i class=\"material-icons\">&#xE5D2;</i><span>"
    + alias3((helpers.__ || (depth0 && depth0.__) || alias2).call(alias1,"button-menu",{"name":"__","hash":{},"data":data}))
    + "</span>\n    </a>\n    <a title=\""
    + alias3((helpers.__ || (depth0 && depth0.__) || alias2).call(alias1,"button-showHideYaml",{"name":"__","hash":{},"data":data}))
    + "\" href=\"javascript:void(0)\" data-hc-bind=\"click:$toggleYaml\" class=\"no-text when-hidden\">\n      <i class=\"material-icons\">&#xE314;</i>\n    </a>\n    <a title=\""
    + alias3((helpers.__ || (depth0 && depth0.__) || alias2).call(alias1,"button-menu",{"name":"__","hash":{},"data":data}))
    + "\" href=\"javascript:void(0)\" data-hc-bind=\"click:$menu\" class=\"no-text when-hidden\">\n      <i class=\"material-icons\">&#xE5D2;</i>\n    </a>\n    <div class=\"yaml-wrapper\">\n      <div class=\"yaml-display\"></div>\n    </div>\n  </div>\n</div>\n";
},"useData":true});
templates['zome-code'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    return "<div class=\"javascript-wrap\">\n  <div class=\"javascript-display\"></div>\n</div>\n";
},"useData":true});
templates['zome-entry-advanced'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing;

  return "<div class=\"entry-advanced-wrap\">\n  <div class=\"entry-advanced-top\">\n    <h1>"
    + container.escapeExpression((helpers.__ || (depth0 && depth0.__) || alias2).call(alias1,"zomeAdvancedOptions",(depth0 != null ? depth0.zomeName : depth0),(depth0 != null ? depth0.entryName : depth0),{"name":"__","hash":{},"data":data}))
    + "</h1>\n    <div class=\"instructions\">"
    + ((stack1 = (helpers.__ || (depth0 && depth0.__) || alias2).call(alias1,"zomeEntrySchemaInstructions",{"name":"__","hash":{},"data":data})) != null ? stack1 : "")
    + "</div>\n    <div class=\"instructions results\">changes saved</div>\n  </div>\n  <div class=\"entry-advanced-bottom\">\n    <div class=\"json-schema-wrap\">\n      <div class=\"json-schema-display\"></div>\n    </div>\n  </div>\n</div>\n";
},"useData":true});
templates['zome-entry'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<tr class=\"zome-entry-row\" id=\""
    + alias4(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\">\n  <td>\n    <a href=\"javascript:void(0)\" data-hc-bind=\"click:$deleteZomeEntry\" data-hc-id=\""
    + alias4(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\">\n      <i class=\"material-icons\">&#xE92B;</i><span>"
    + alias4((helpers.__ || (depth0 && depth0.__) || alias2).call(alias1,"button-deleteZomeEntry",{"name":"__","hash":{},"data":data}))
    + "</span>\n    </a>\n  </td>\n  <td>\n    <input type=\"text\" data-hc-bind=\"change:$reloadLater keyup:$reloadLater\" id=\"name-"
    + alias4(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\" class=\"zome-entry-name\" />\n  </td>\n  <td>\n    <select data-hc-bind=\"change:$render change:$entryRowType\" data-hc-id=\""
    + alias4(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\" class=\"zome-entry-data-format\">\n      <option value=\"json\" selected=\"selected\">Json</option>\n      <option value=\"links\">Links</option>\n      <option value=\"string\">String</option>\n    </select>\n  </td>\n  <td>\n    <select data-hc-bind=\"change:$render\" class=\"zome-entry-sharing\">\n      <option value=\"public\" selected=\"selected\">Public</option>\n      <option value=\"private\">Private</option>\n    </select>\n  </td>\n  <td>\n    <input type=\"checkbox\" data-hc-bind=\"change:$render\" name=\"create-"
    + alias4(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\" checked=\"checked\" class=\"zome-entry-create\" />\n  </td>\n  <td>\n    <input type=\"checkbox\" data-hc-bind=\"change:$render\" name=\"read-"
    + alias4(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\" checked=\"checked\" class=\"zome-entry-read\" />\n  </td>\n  <td>\n    <input type=\"checkbox\" data-hc-bind=\"change:$render\" name=\"update-"
    + alias4(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\" class=\"zome-entry-update\" />\n  </td>\n  <td>\n    <input type=\"checkbox\" data-hc-bind=\"change:$render\" name=\"delete-"
    + alias4(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\" class=\"zome-entry-delete\" />\n  </td>\n  <td>\n    <a title=\""
    + alias4((helpers.__ || (depth0 && depth0.__) || alias2).call(alias1,"button-zomeEntryMore",{"name":"__","hash":{},"data":data}))
    + "\" href=\"javascript:void(0)\" data-hc-bind=\"click:$zomeEntryMore\" data-hc-id=\""
    + alias4(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\" data-hc-zome-id=\""
    + alias4(((helper = (helper = helpers["zome-id"] || (depth0 != null ? depth0["zome-id"] : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"zome-id","hash":{},"data":data}) : helper)))
    + "\" class=\"no-text entry-more\">\n      <i class=\"material-icons\">&#xE5D3;</i>\n    </a>\n  </td>\n</tr>\n";
},"useData":true});
templates['zome-function'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<tr class=\"zome-function-row\" id=\""
    + alias4(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\">\n  <td>\n    <a href=\"javascript:void(0)\" data-hc-bind=\"click:$deleteZomeFunction\" data-hc-id=\""
    + alias4(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\">\n      <i class=\"material-icons\">&#xE92B;</i><span>"
    + alias4((helpers.__ || (depth0 && depth0.__) || alias2).call(alias1,"button-deleteZomeFunction",{"name":"__","hash":{},"data":data}))
    + "</span>\n    </a>\n  </td>\n  <td>\n    <input type=\"text\" data-hc-bind=\"change:$render keyup:$render\" id=\"name-"
    + alias4(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\" class=\"zome-function-name\" />\n  </td>\n  <td>\n    <select data-hc-bind=\"change:$render\" class=\"zome-function-calling-type\">\n      <option value=\"json\" selected=\"selected\">Json</option>\n      <option value=\"string\">String</option>\n    </select>\n  </td>\n  <td>\n    <select data-hc-bind=\"change:$render\" class=\"zome-function-exposure\">\n      <option value=\"\" selected=\"selected\">Zome</option>\n      <option value=\"public\">Public</option>\n    </select>\n  </td>\n</tr>\n";
},"useData":true});
templates['zome-options'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<a href=\"javascript:void(0)\" data-hc-bind=\"click:$deleteZome\" data-hc-id=\""
    + alias4(((helper = (helper = helpers["zome-id"] || (depth0 != null ? depth0["zome-id"] : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"zome-id","hash":{},"data":data}) : helper)))
    + "\" data-hc-menu-id=\""
    + alias4(((helper = (helper = helpers["menu-id"] || (depth0 != null ? depth0["menu-id"] : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"menu-id","hash":{},"data":data}) : helper)))
    + "\">\n  <i class=\"material-icons\">&#xE92B;</i><span>"
    + alias4((helpers.__ || (depth0 && depth0.__) || alias2).call(alias1,"button-deleteZome",{"name":"__","hash":{},"data":data}))
    + "</span>\n</a>\n<a href=\"javascript:void(0)\" data-hc-bind=\"click:$viewZomeCode\" data-hc-id=\""
    + alias4(((helper = (helper = helpers["zome-id"] || (depth0 != null ? depth0["zome-id"] : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"zome-id","hash":{},"data":data}) : helper)))
    + "\" data-hc-menu-id=\""
    + alias4(((helper = (helper = helpers["menu-id"] || (depth0 != null ? depth0["menu-id"] : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"menu-id","hash":{},"data":data}) : helper)))
    + "\">\n  <i class=\"material-icons\">&#xE8A0;</i><span>"
    + alias4((helpers.__ || (depth0 && depth0.__) || alias2).call(alias1,"button-viewZomeCode",{"name":"__","hash":{},"data":data}))
    + "</span>\n</a>\n";
},"useData":true});
templates['zome'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<fieldset class=\"zome\" id=\""
    + alias4(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\">\n  <a href=\"javascript:void(0)\" data-hc-bind=\"click:$zomeOptions\" data-hc-id=\""
    + alias4(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\">\n    <i class=\"material-icons\">&#xE5D2;</i><span>"
    + alias4((helpers.__ || (depth0 && depth0.__) || alias2).call(alias1,"button-zomeOptions",{"name":"__","hash":{},"data":data}))
    + "</span>\n  </a>\n  <fieldset>\n    <legend>"
    + alias4((helpers.__ || (depth0 && depth0.__) || alias2).call(alias1,"field-name-Zomes.Name",{"name":"__","hash":{},"data":data}))
    + "</legend>\n    <label for=\"zomename-"
    + alias4(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\">"
    + alias4((helpers.__ || (depth0 && depth0.__) || alias2).call(alias1,"field-desc-Zomes.Name",{"name":"__","hash":{},"data":data}))
    + "</label>\n    <input type=\"text\" data-hc-bind=\"change:$render keyup:$render\" id=\"zomename-"
    + alias4(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\" class=\"zomename\" />\n  </fieldset>\n  <fieldset>\n    <legend>"
    + alias4((helpers.__ || (depth0 && depth0.__) || alias2).call(alias1,"field-name-Zomes.Description",{"name":"__","hash":{},"data":data}))
    + "</legend>\n    <label for=\"zomename-"
    + alias4(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\">"
    + alias4((helpers.__ || (depth0 && depth0.__) || alias2).call(alias1,"field-desc-Zomes.Description",{"name":"__","hash":{},"data":data}))
    + "</label>\n    <input type=\"text\" data-hc-bind=\"change:$render keyup:$render\" id=\"zomedesc-"
    + alias4(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\" class=\"zomedesc\" />\n  </fieldset>\n  <fieldset>\n    <legend>"
    + alias4((helpers.__ || (depth0 && depth0.__) || alias2).call(alias1,"field-name-Zomes.Entries",{"name":"__","hash":{},"data":data}))
    + "</legend>\n    <label>"
    + alias4((helpers.__ || (depth0 && depth0.__) || alias2).call(alias1,"field-desc-Zomes.Entries",{"name":"__","hash":{},"data":data}))
    + "</label>\n    <table id=\"zomeentries-"
    + alias4(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\">\n      <tr>\n        <td></td>\n        <th>"
    + alias4((helpers.__ || (depth0 && depth0.__) || alias2).call(alias1,"field-name-Zomes.Entries.Name",{"name":"__","hash":{},"data":data}))
    + "</th>\n        <th>"
    + alias4((helpers.__ || (depth0 && depth0.__) || alias2).call(alias1,"field-name-Zomes.Entries.DataFormat",{"name":"__","hash":{},"data":data}))
    + "</th>\n        <th>"
    + alias4((helpers.__ || (depth0 && depth0.__) || alias2).call(alias1,"field-name-Zomes.Entries.Sharing",{"name":"__","hash":{},"data":data}))
    + "</th>\n        <th>"
    + alias4((helpers.__ || (depth0 && depth0.__) || alias2).call(alias1,"field-name-Zomes.Entries.Create",{"name":"__","hash":{},"data":data}))
    + "</th>\n        <th>"
    + alias4((helpers.__ || (depth0 && depth0.__) || alias2).call(alias1,"field-name-Zomes.Entries.Read",{"name":"__","hash":{},"data":data}))
    + "</th>\n        <th>"
    + alias4((helpers.__ || (depth0 && depth0.__) || alias2).call(alias1,"field-name-Zomes.Entries.Update",{"name":"__","hash":{},"data":data}))
    + "</th>\n        <th>"
    + alias4((helpers.__ || (depth0 && depth0.__) || alias2).call(alias1,"field-name-Zomes.Entries.Delete",{"name":"__","hash":{},"data":data}))
    + "</th>\n        <td></td>\n      </tr>\n    </table>\n    <a href=\"javascript:void(0)\" data-hc-bind=\"click:$addZomeEntry\" data-hc-id=\""
    + alias4(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\">\n      <i class=\"material-icons\">&#xE147;</i><span>"
    + alias4((helpers.__ || (depth0 && depth0.__) || alias2).call(alias1,"button-addZomeEntry",{"name":"__","hash":{},"data":data}))
    + "</span>\n    </a>\n  </fieldset>\n  <fieldset>\n    <legend>"
    + alias4((helpers.__ || (depth0 && depth0.__) || alias2).call(alias1,"field-name-Zomes.Functions",{"name":"__","hash":{},"data":data}))
    + "</legend>\n    <label>"
    + alias4((helpers.__ || (depth0 && depth0.__) || alias2).call(alias1,"field-desc-Zomes.Functions",{"name":"__","hash":{},"data":data}))
    + "</label>\n    <table id=\"zomefunctions-"
    + alias4(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\">\n      <tr>\n        <td></td>\n        <th>"
    + alias4((helpers.__ || (depth0 && depth0.__) || alias2).call(alias1,"field-name-Zomes.Functions.Name",{"name":"__","hash":{},"data":data}))
    + "</th>\n        <th>"
    + alias4((helpers.__ || (depth0 && depth0.__) || alias2).call(alias1,"field-name-Zomes.Functions.CallingType",{"name":"__","hash":{},"data":data}))
    + "</th>\n        <th>"
    + alias4((helpers.__ || (depth0 && depth0.__) || alias2).call(alias1,"field-name-Zomes.Functions.Exposure",{"name":"__","hash":{},"data":data}))
    + "</th>\n      </tr>\n    </table>\n    <a href=\"javascript:void(0)\" data-hc-bind=\"click:$addZomeFunction\" data-hc-id=\""
    + alias4(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\">\n      <i class=\"material-icons\">&#xE147;</i><span>"
    + alias4((helpers.__ || (depth0 && depth0.__) || alias2).call(alias1,"button-addZomeFunction",{"name":"__","hash":{},"data":data}))
    + "</span>\n    </a>\n  </fieldset>\n</fieldset>\n";
},"useData":true});
