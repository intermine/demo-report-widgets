// Will be converted to plain JS Object.
module.exports = {
    "author": "Radek <rs676@cam.ac.uk>",
    "title": "Pathways from other mines",
    "description": "Shows for each pathway which mines carry it",
    "version": "0.5.0",
    "dependencies": {
        "js": {
            "Modernizr": {
                "path": "http://cdn.intermine.org/js/modernizr/2.5.3/modernizr.min.js"
            },
            "jQuery": {
                "path": "http://cdn.intermine.org/js/jquery/1.9.1/jquery-1.9.1.min.js"
            },
            "_": {
                "path": "http://cdn.intermine.org/js/underscore.js/1.3.3/underscore-min.js"
            },
            "Backbone": {
                "path": "http://cdn.intermine.org/js/backbone.js/0.9.2/backbone-min.js",
                "depends": [ "jQuery", "_" ]
            },
            "intermine.imjs": {
                "path": "http://cdn.intermine.org/js/intermine/imjs/2.9.2/im.js",
                "depends": [ "jQuery", "_" ]
            },
            "jQueryFoundationTooltips": {
                "path": "http://cdn.intermine.org/css/foundation/3.1.1-prefixed/javascripts/jquery.foundation.tooltips.js",
                "depends": [ "jQuery" ]
            }
        }
    },
    // Example config. Pass this from your middleware that knows about the mine it connects to.
    "config": {
        "mines": {
            "FlyMine": "http://www.flymine.org/query",
            "metabolicMine": "http://metabolicmine.org/beta"
        },
        "organisms": [
            "fruit fly",
            "house mouse",
            "human"
        ],
        "pathQueries": {
            "homologues": {
                "select": [
                    "Gene.homologues.homologue.primaryIdentifier"
                ]
            },
            "pathways": {
                "select": [
                    "Gene.pathways.name",
                    "Gene.pathways.curated",
                    "Gene.organism.commonName"
                ]
            }
        }
    }
};