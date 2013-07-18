/// <reference path="defs/lib.d.ts" />
/// <reference path="defs/jquery.d.ts" />
/// <reference path="./models/lists.ts" />
/// <reference path="./views/table.ts" />

import l = module("./models/lists");
import t = module("./views/table");

// All the config passed in.
export interface AppConfig {
    mine: string
    token: string
    // User provided input.
    provided?: {
        list?: string
        hidden?: string[]
    }
    cb(err: Error, working: bool, list: any): void
}

// We expect these templates.
export interface AppTemplates {
    pagination: Hogan.Template
    row: Hogan.Template
    table: Hogan.Template
    tags: Hogan.Template
    tooltip: Hogan.Template
}

export class App {

    private service: intermine.Service;
    private cb: Function;

    // Enforce callback and templates.
    constructor(
        private config: AppConfig,
        private templates: AppTemplates
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

        // Have some Hogan in you (under nice keys).
        for (var key in this.templates) {
            this.templates[key.split('/').pop().replace('.hogan', '')] = new Hogan.Template(templates[key]);
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
            var table = new t.TableView({
                collection: l.lists,
                config: this.config,
                templates: this.templates
            });
            $(target).html((<Backbone.View> table.render()).el);

            // No more work.
            this.cb(null, false, null);
        });
    }

}