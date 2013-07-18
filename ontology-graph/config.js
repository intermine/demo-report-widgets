// Will be converted to plain JS Object.
module.exports = {
    "author": "Alex Kalderimis",
    "classExpr": "require('ontology-widget')",
    "description": "The super spaghetti monster",
    "title": "Gene Ontology Annotations for a given Gene",
    "version": "0.0.1",
    "dependencies": {
        "css": {
            "font-awesome": {
                "path": "http://cdn.intermine.org/css/font-awesome/3.0.2/css/font-awesome.css"
            },
            "foundation": {
                "path": "http://cdn.intermine.org/css/foundation/4.0-prefixed/css/foundation.min.css"
            }
        },
        "js": {
            "jQuery": {
                "path": "http://cdn.intermine.org/js/jquery/1.9.1/jquery-1.9.1.min.js"
            },
            "d3": {
                "path": "http://cdn.intermine.org/js/d3/3.0.8/d3.js"
            },
            "_": {
                "path": "http://cdn.intermine.org/js/underscore.js/1.3.3/underscore-min.js"
            },
            "intermine.imjs": {
                "path": "http://cdn.intermine.org/js/intermine/imjs/latest/im.js",
                "depends": [
                    "jQuery",
                    "_"
                ]
            },
            "Backbone": {
                "path": "http://cdn.intermine.org/js/backbone.js/0.9.9/backbone-min.js",
                "depends": [
                    "jQuery",
                    "_"
                ]
            },
            "jquery-tablesorter": {
                "path": "http://cdn.intermine.org/js/jquery.tablesorter.js/latest/jquery.tablesorter.js",
                "depends": [
                    "jQuery"
                ]
            },
            "foundation-4": {
                "path": "http://cdn.intermine.org/css/foundation/4.0/js/foundation/foundation.js",
                "depends": [
                    "jQuery"
                ]
            },
            "foundation-forms-4": {
                "path": "http://cdn.intermine.org/css/foundation/4.0/js/foundation/foundation.forms.js",
                "depends": [
                    "foundation-4"
                ]
            },
            "foundation-section-4": {
                "path": "http://cdn.intermine.org/css/foundation/4.0/js/foundation/foundation.section.js",
                "depends": [
                    "foundation-4"
                ]
            }
        }
    }
};