///<reference path="lib.d.ts" />

// A single row with our list.
class Row extends Backbone.View {

}

// Complete table of all lists.
class Table extends Backbone.View {

}

class App {

    // Enforce callback function.
    constructor(
        private config: {
            cb(err: Error, working: bool, list: any): void
        },
        private templates: Object
    ) {
        // Make sure we have something to call to.
        if (this.config.cb == null || typeof(this.config.cb) !== 'function') {
            // Throw up the first chance we get.
            this.config.cb = function() {
                throw 'Provide your own `cb` function';
            }
        }
        
    }

    render(target: string): void {
        // Work starts here.
        this.config.cb(null, true, null);

        // Construct a new View and dump it to the target.
        var table: Backbone.View = new Table();
        $(target).html(table.el);
    }

}