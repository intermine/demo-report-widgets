///<reference path="lib.d.ts" />

// return a color for a string.
var colorize = function(text: string) {
    var hash = md5(text);
    return [
        parseInt(hash.slice(0, 2), 16),
        parseInt(hash.slice(1, 3), 16),
        parseInt(hash.slice(2, 4), 16)
    ];
};

// All the tags, coming from Lists.
class Tags extends Backbone.Collection {

    model: Tag;

    // Sort tags on their usage count.
    // Comparator for sort function on custom column/key.
    comparator(collection: Tags) {
        return collection.get('count');
    }

    // Find if we have new tags and add them if so.
    boost(tags: string[]): void {
        var self: Tags = this;
        // For all the possibly new tags.
        tags.forEach(function(tag: string) {
            var existing: Tag;
            // Do we have it?
            if (existing = <Tag> self.get(tag)) {
                // +1.
                existing.set('count', existing.get('count'));
            } else {
                // Create a new one then. With color.
                self.add({ id: tag, rgb: colorize(tag) });
            }
        });
    }

}

// One tag.
class Tag extends Backbone.Model {

    defaults() {
        return {
            count: 1, // well there is us
            active: true // and by default we are selected
        }
    }

    // Increment the count (frequency of usage).
    public increment(): void {
        this.set('count', this.get('count') + 1);
    }

}

// All the lists.
class Lists extends Backbone.Collection {

    model: List;
    public sortColumn: string; // sort on a string key

    initialize() {
        // By default sort on the date key.
        this.sortColumn = 'dateCreated';
    }

    // Comparator for sort function on custom column/key.
    comparator(collection: Lists) {
        return collection.get(this.sortColumn);
    }

}

// Single row Model.
class List extends Backbone.Model {

    constructor(list: intermine.List) {
        // Store em here.
        var obj: any = {};
        // We want these.
        [ 'dateCreated', 'description', 'name', 'size', 'status', 'tags', 'type' ].forEach(function(key: string) {
            obj[key] = list[key];
        });

        super(obj);

    }

}

// Globally accessible collections.
var tags: Tags = new Tags();
var lists: Lists = new Lists();

// A single row with our list.
class Row extends Backbone.View {

    private model: Backbone.Model;
    private template: Hogan.Template;

    constructor(opts: any) {
        this.tagName = "tr";

        // Expand on us.
        for (var key in opts) {
            this[key] = opts[key];
        }

        super();
    }

    render(): Row {
        // Get them data.
        var data: any = this.model.toJSON(),
            date: Date = new Date(data.dateCreated);
        // Boost with time ago.
        data.timeAgo = moment(date).fromNow();

        // Render our template.
        $(this.el).html(this.template.render(data));

        // Chain.
        return this;
    }

}

// Encapsulates all tags in a sidebar.
class TagsView extends Backbone.View {

    private collection: Tags;
    private template: Hogan.Template;

    // Save some things on us.
    constructor(opts: {
        collection: Tags
        template: Hogan.Template
    }) {
        super(opts);

        this.template = opts.template;
    }

    render(): TagsView {
        console.log(JSON.stringify(this.collection.toJSON()));

        // Render the whole collection in one template.
        $(this.el).html(this.template.render({ tags: this.collection.toJSON() }));

        // Chain.
        return this;
    }

}

// Complete table of all lists.
class TableView extends Backbone.View {

    private rows: Row[]; // List Row views
    private tags: Tags; // a View of Tags
    private service: any; // imjs thing

    constructor(private opts: any) {
        super();

        this.rows = [];

        // Pass these opts onward.
        var imjs: any = {
            root: this.opts.config.mine,
            token: this.opts.config.token,
            errorHandler: this.opts.config.cb
        };

        // Create a new Service connection.
        this.service = new intermine.Service(imjs);
    }

    render(): TableView {
        var self: any = this;

        // Render the template.
        $(this.el).html(this.opts.templates['table'].render({}));

        // Get the user's lists.
        async.waterfall([ function(cb: Function) {
            self.service.fetchLists(function(lists: intermine.List[]) {
                cb(null, lists);
            });

            // Render a row per our list.
        }, function(data: any[], cb: Function) {
            // Create a fragment for rendering all lists.
            var fragment = document.createDocumentFragment();

            // For each list...
            data.forEach(function(item: intermine.List) {
                // Modelify.
                var list: List = new List(item);

                // Push to the stack.
                lists.push(list);

                // Any new tags? Boost them.
                tags.boost(list.get('tags'));

                // New View.
                var row: Row = new Row({
                    // Lose the fns.
                    model: list,
                    // Pass in our template.
                    template: self.opts.templates['row']
                });
                // Push to stack.
                self.rows.push(row);
                // Append the child.
                fragment.appendChild(row.render().el);
            });

            // Render all them lists into table body.
            $(self.el).find('tbody[data-view="rows"]').html(fragment);

            // Render them tags.
            self.tags = new TagsView({ collection: tags, template: self.opts.templates['tags'] });
            $(self.el).find('div[data-view="tags"]').html(self.tags.render().el);

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
            table: string // the whole shebang
            row: string // individual list row
            tags: string // all them tags
        }
    ) {
        // Make sure we have something to call to.
        if (this.config.cb == null || typeof(this.config.cb) !== 'function') {
            // Throw up the first chance we get.
            this.config.cb = function(err: Error, working: bool, list: any) {
                throw 'Provide your own `cb` function';
            }
        }

        // Hoganize.
        for (var key in this.templates) {
            this.templates[key] = new Hogan.Template(templates[key]);
        }
        
    }

    render(target: string): void {
        // Work starts here.
        this.config.cb(null, true, null);

        // Construct a new View and dump it to the target.
        var table: Backbone.View = new TableView({ config: this.config, templates: this.templates });
        $(target).html(table.render().el);
    }

}