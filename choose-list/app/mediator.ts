/// <reference path="defs/lib.d.ts" />
/// <reference path="defs/underscore.d.ts" />

// All modules can communicate through us using the Publish/Subscribe pattern.
export var mediator = _.extend({}, Backbone.Events);