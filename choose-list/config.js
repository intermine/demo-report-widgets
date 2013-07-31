// Will be converted to plain JS Object.
module.exports = {
    "author": "Radek <rs676@cam.ac.uk>",
    "title": "Choose a list",
    "description": "Choose from among InterMine lists user has access to",
    "version": "0.1.3",
    "appRoot": "app/index",
    "dependencies": {
        "css": {
            "FoundationCSS": {
                "path": "http://cdn.intermine.org/css/foundation/4.2.2/foundation.min.css"
            },
            "Entypo": {
                "path": "http://cdn.intermine.org/css/entypo/original/style.css"
            }
        },
        "js": {
            "jQuery": {
                "path": "http://cdn.intermine.org/js/jquery/1.10.1/jquery.min.js"
            },
            "_": {
                "path": "http://cdn.intermine.org/js/underscore.js/1.4.4/underscore-min.js"
            },
            "Backbone": {
                "path": "http://cdn.intermine.org/js/backbone.js/1.0.0/backbone-min.js",
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
            "Hogan": {
                "path": "http://cdn.intermine.org/js/hogan.js/2.0.0/hogan.min.js"
            },
            "moment": {
                "path": "http://cdn.intermine.org/js/moment.js/2.0.0/moment.min.js"
            },
            "md5": {
                "path": "http://cdn.intermine.org/js/md5/2.2/md5.min.js"
            },
            "_.slugify": {
                "path": "http://cdn.intermine.org/js/underscore.string/2.3.0/underscore.string.min.js",
                "depends": [ "_" ]
            },
            "Chaplin": {
                "path": "http://cdn.intermine.org/js/chaplin/0.10.0/chaplin.js",
                "depends": [ "Backbone", "require" ]
            },
            "require": {
                "path": "http://cdn.intermine.org/js/brunch/1.7.0-pre/require.js"
            }
        }
    },
    // Example config.
    "config": {
        // Pass the following to the App from the client.
        'mine': 'http://beta.flymine.org/beta', // which mine to connect to
        'token': 'X133AbT7J0Z0HfV316Q4', // token so we can access private lists
        // Provided input, if any.
        'provided': {
            'selected': 'demo-list', // a name of the list that is to be "highlighted"
            'hidden': [ 'temp' ] // hide lists tagged with this label
        },
        // A callback called at least once.
        cb: function(err, working, list) {
            // Has error happened?
            if (err) throw err;
            // Are you working?
            console.log('working:', working);
            // Are you done? Dump the list then.
            console.log('list:', list);
        }
    }
};