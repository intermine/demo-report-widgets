// Will be converted to plain JS Object.
module.exports = {
    "author": "Radek <rs676@cam.ac.uk>",
    "title": "Mouse Phenotype Dendrogram Clustering",
    "description": "Replaces a tag cloud of phenotypes associated with alleles and their scores",
    "version": "0.3.4",
    "dependencies": {
        "js": {
            "d3": {
                "path": "http://d3js.org/d3.v2.min.js"
            },
            "jQuery": {
                "path": "http://cdn.intermine.org/js/jquery/1.9.1/jquery-1.9.1.min.js"
            },
            "_": {
                "path": "http://cdn.intermine.org/js/underscore.js/1.3.3/underscore-min.js"
            },
            "intermine.imjs": {
                "path": "http://cdn.intermine.org/js/intermine/imjs/latest/imjs.js",
                "depends": [ "jQuery", "_" ]
            }
        }
    }
}