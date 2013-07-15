/// <reference path="defs/lib.d.ts" />
/// <reference path="defs/jquery.d.ts" />

import l = module("./models/lists");
import t = module("./views/table");

export class App {

    public config: any;
    private service: intermine.Service;
    private cb: Function;

    // Enforce callback and templates.
    constructor(
        config: {
            mine: string
            token: string
            cb(err: Error, working: bool, list: any): void
        },
        private templates: {
            table: string // the whole shebang
            row: string // individual list row
            tags: string // all them tags
        }
    ) {
        // Make sure we have something to call to. Something throw-y.
        this.cb = (config.cb == null || typeof(config.cb) !== 'function') ? function(
            err: Error, working: bool, list: any
        ) {
            throw 'Provide your own `cb` function';
        } : config.cb;

        if (!config.mine) { this.cb('Missing `mine` value in config', null, null); return; }
        if (!config.token) { this.cb('Missing `token` value in config', null, null); return; }

        // Save it.
        this.config = config;

        // Create a new Service connection.
        this.service = new intermine.Service({
            root: config.mine,
            token: config.token,
            errorHandler: this.cb
        });

        // Have some Hogan in you.
        for (var key in this.templates) {
            this.templates[key] = new Hogan.Template(templates[key]);
        }
    }

    render(target: string): void {
        // Work starts here.
        this.cb(null, true, null);

        // Get the user's lists.
        this.service.fetchLists((data: intermine.List[]) => {
            // For each list...
            data.forEach(function(item: intermine.List) {
                // Modelify.
                var list: l.List = new l.List(item);

                // Add to the collection. Will add to tags behind the scenes too
                l.lists.add(list);
            });

            // Construct a new View and dump it to the target.
            var table: Backbone.View = new t.TableView({
                collection: l.lists,
                config: this.config,
                templates: this.templates
            });
            $(target).html(table.render().el);

            // No more work.
            this.cb(null, false, null);
        });
    }

}