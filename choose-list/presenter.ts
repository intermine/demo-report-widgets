///<reference path="lib.d.ts" />

// Single row Model.
class List extends Backbone.Model {

    // Convert InterMine List into Backbone List.
    public static convert(list: intermine.List): List {
        // Store em here.
        var obj: any = {};
        // We want these.
        [ 'dateCreated', 'description', 'name', 'size', 'status', 'tags', 'type' ].forEach(function(key: string) {
            switch (key) {
                case "dateCreated":
                    list[key] = +new Date(list[key]);
                default:
                    obj[key] = list[key];
            }
        });
        // Init.
        return new List(obj);
    }

}

// A single row with our list.
class Row extends Backbone.View {

    private template: EcoTemplate;
    private model: Backbone.Model;

    constructor(opts: any) {
        this.tagName = "tr";

        // Expand on us.
        for (var key in opts) {
            this[key] = opts[key];
        }

        super();
    }

    render(): Row {
        // Render our template.
        $(this.el).html(this.template(this.model.toJSON()));

        // Chain.
        return this;
    }

}

// Complete table of all lists.
class Table extends Backbone.View {

    private rows: Row[] = [];
    private service: any;

    constructor(private opts: any) {
        super();

        // Pass these opts onward.
        var imjs: any = {
            root: this.opts.config.mine,
            token: this.opts.config.token,
            errorHandler: this.opts.config.cb
        };

        // Create a new Service connection.
        this.service = new intermine.Service(imjs);
    }

    render(): Table {
        var self: any = this;

        // Render the template with data.
        $(this.el).html((<EcoTemplate> this.opts.templates['table'])());

        // Get the user's lists.
        async.waterfall([ function(cb: Function) {
            self.service.fetchLists(function(lists: intermine.List[]) {
                cb(null, lists);
            });

            // Render a row per our list.
        }, function(lists: any[], cb: Function) {
            var tbody: JQuery = $(self.el).find('tbody');
            lists.forEach(function(list: intermine.List) {
                // new View.
                var row: Row = new Row({
                    // Lose the fns.
                    model: List.convert(list),
                    // Pass in our template.
                    template: <EcoTemplate> self.opts.templates['row']
                });
                // Render into table.
                tbody.append(row.render().el);
                // Push to stack.
                self.rows.push(row);
            });

        }], function(err: string) {
            if (err) {
                self.opts.config.cb(new Error(err), false, null);
                return;
            }
        });

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
        private templates: {
            table: EcoTemplate
        }
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