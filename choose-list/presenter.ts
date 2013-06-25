///<reference path="lib.d.ts" />

// A single row with our list.
class Row extends Backbone.View {

}

// Complete table of all lists.
class Table extends Backbone.View {

    constructor(private opts: any) {
        super();

        var self: any = this;

        // Pass these opts onward.
        var imjs: any = {
            root: this.opts.config.mine,
            token: this.opts.config.token,
            errorHandler: this.opts.config.cb
        };

        // Create a new Service connection.
        var service: Object = new intermine.Service(imjs);

        // Get the user's lists.
        async.waterfall([ function(cb: Function) {
            cb('trouble');

        }], function(err: string) {
            if (err) {
                self.opts.config.cb(new Error(err), false, null);
                return;
            }
        });
    }

    render(): Backbone.View {
        // Chain.
        return this;
    }

}

class App {

    // Enforce callback and templates.
    constructor(
        private config: {
            cb(err: Error, working: bool, list: any): void
        },
        private templates: Object
    ) {
        // Make sure we have something to call to.
        if (this.config.cb == null || typeof(this.config.cb) !== 'function') {
            // Throw up the first chance we get.
            this.config.cb = function(err: Error, working: bool, list: any) {
                throw 'Provide your own `cb` function';
            }
        }
        
    }

    render(target: string): void {
        // Work starts here.
        this.config.cb(null, true, null);

        // Construct a new View and dump it to the target.
        var table: Backbone.View = new Table({ config: this.config, templates: this.templates });
        $(target).html(table.render().el);
    }

}