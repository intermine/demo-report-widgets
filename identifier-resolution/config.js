// Will be converted to plain JS Object.
module.exports = {
    "author": "Radek <rs676@cam.ac.uk>",
    "title": "Resolve Identifiers",
    "description": "Resolve a bunch of identifiers in InterMine and return a PathQuery",
    "version": "0.0.1",
    "dependencies": {
        "css": {
            "FoundationCSS": {
                "path": "http://cdn.intermine.org/css/foundation/4.2.2/foundation.min.css"
            }
        },
        "js": {
            "jQuery": {
                "path": "http://cdn.intermine.org/js/jquery/1.10.1/jquery.min.js"
            },
            "_": {
                "path": "http://cdn.intermine.org/js/underscore.js/1.3.3/underscore-min.js"
            },
            "Backbone": {
                "path": "http://cdn.intermine.org/js/backbone.js/0.9.2/backbone-min.js",
                "depends": [
                    "jQuery",
                    "_"
                ]
            },
            "intermine.imjs": {
                "path": "http://cdn.intermine.org/js/intermine/imjs/latest/im.js",
                "depends": [
                    "jQuery",
                    "_"
                ]
            },
            "async": {
                "path": "http://cdn.intermine.org/js/async/0.2.6/async.min.js",
                "depends": [ "setImmediate" ]
            },
            "setImmediate": {
                "path": "http://cdn.intermine.org/js/setImmediate/1.0.1/setImmediate.min.js"
            },
            "Foundation": {
                "path": "http://cdn.intermine.org/css/foundation/4.2.2/foundation.min.js",
                "depends": [ "jQuery" ]
            },
            "buckets": {
                "path": "http://cdn.intermine.org/js/buckets/latest/buckets.min.js"
            }
        }
    },
    // Example config.
    "config": {
        // Pass the following to the App from the client.
        'mine': 'http://beta.flymine.org/beta', // which mine to connect to
        'type': 'many', // one OR many
        // Defaults in the forms.
        'defaults': {
            'identifiers': [ 'PPARG', 'ZEN', 'MAD', 'ftz', 'Adh' ], // one identifier taken from the head
            'type': 'Gene',
            'organism': 'D. melanogaster'
        },
        // Provided input, if any.
        'provided': {
            'identifiers': [ 'MAD' ],
            'type': 'Gene',
            'organism': 'C. elegans'
        },
        // A callback called at least once.
        cb: function(err, working, query) {
            // Has error happened?
            if (err) throw err;
            // Are you working?
            console.log('working:', working);
            // Are you done? Dump the query then.
            console.log('query:', query);
        },
        
        // Pass this from your middleware that knows about the mine it connects to.
        "pathQueries": {
            "organisms": {
                "select": [
                    "Organism.shortName",
                    "Organism.name"
                ]
            }
        }
    }
}