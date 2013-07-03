/// <reference path="defs/jquery.d.ts" />
/// <reference path="defs/underscore.d.ts" />
/// <reference path="defs/lib.d.ts" />

// Sort on column key providing direction (asc, desc).
interface SortInterface {
    key: string;
    direction: number
}

interface ForEachCallback {
    (value: Backbone.Model, index: number, array: Backbone.Model[])
}

class SortedCollection extends Backbone.Collection {

    get sortOrder(): SortInterface      { return this._sortOrder; }
    set sortOrder(value: SortInterface) {
        // Is it different from the previous one?
        if (!_(this.sortOrder).isEqual(<any> value)) {
            // Set it.
            this._sortOrder = value;
            // Discard each cache.
            this.eachCache = null;
        }
    }

    private eachCache: Backbone.Model[]; // caches the results of a sort for this sort order
    private _sortOrder: SortInterface; // privately stored here

    // Use custom sort column and order on standard `each`.
    forEach(cb: ForEachCallback): void {
        var self: SortedCollection = this;

        // No cache?
        if (!this.eachCache) {
            // Sort & save then.
            this.eachCache = (<List[]> this.models).sort(function(a: List, b: List): number {
                // Get the keys.
                var keyA = a[self.sortOrder.key],
                    keyB = b[self.sortOrder.key];

                if (typeof(keyA) !== typeof(keyB)) {
                    throw 'Key value types do not match'
                }

                // Based on the type of the object...
                switch (typeof(keyA)) {
                    case 'string':
                        return self.sortOrder.direction * keyA.localeCompare(keyB);
                        break;
                    case 'number':
                        return self.sortOrder.direction * (keyA - keyB);
                        break;
                    case 'object':
                        // Hope it is a Date.
                        if (keyA instanceof Date) {
                            return self.sortOrder.direction * (+keyA - +keyB)
                            break;
                        }
                    default:
                        throw 'Do not know how to sort on key `' + self.sortOrder.key + '`';
                }
            });
        }

        // The callback is the same.
        this.eachCache.forEach(function(model: Backbone.Model, index: number, array: Backbone.Model[]) {
            cb(model, index, array);
        });
    }

    // Make sure we do not sort.
    add(obj: any, opts?: any): void {
        if (!opts) {
            opts = { sort: false };
        } else {
            opts.sort = false;
        }
        // noinspection JSUnresolvedVariable
        Backbone.Collection.prototype.add.call(this, obj, opts);
    }

}

// All the tags, coming from Lists.
class Tags extends SortedCollection {

    model: Tag;

    initialize() {
        // By default sort on the count of lists with our tag.
        this.sortOrder = { key: 'count', direction: 1 };
    }

    // Add a new tag or increase count.
    add(obj: any): void {
        // Do we have it?
        var tag: Tag;
        if (tag = <Tag> this.find(function(item: Tag) {
            return item.name == obj.name;
        })) {
            tag.count += 1;
        } else {
            tag = new Tag(obj);
            // noinspection JSUnresolvedVariable
            SortedCollection.prototype.add.call(this, tag);
            // Backbone.Collection.prototype.add.call(this, tag, { sort: false });
        }
    }

    // Filter the Models down to a list of names where Model is active.
    getActiveNames(): string[] {
        return _(this.filter(function(tag: Tag) {
            return tag.active;
        })).pluck('name');
    }

}

interface TagInterface {
    name: string; // tag name, not using internal id!
    count: number; // how many times used
    active: bool; // actively selected in UI?
    rgb: number[]; // colorized string
}

// One tag.
class Tag extends Backbone.Model implements TagInterface {

    get name(): string       { return this.get('name'); }
    set name(value: string)  { this.set('name', value); }
    set count(value: number) { this.set('count', value); }
    get count(): number      { return this.get('count'); }
    set active(value: bool)  { this.set('active', value); }
    get active(): bool       { return this.get('active'); }
    set rgb(value: number[]) { this.set('rgb', value); }
    get rgb(): number[]      { return this.get('rgb'); }

    constructor(obj: TagInterface) {
        super();

        // Set the name from the incoming object.
        this.name = obj.name;

        // Say you are active.
        this.active = true;

        // Init count.
        this.count = 1;

        // Colorize.
        this.rgb = Tag.colorize(obj.name);
    }

    // Boost JSONification with our internal id.
    public toJSON(): any {
        return _.extend(Backbone.Model.prototype.toJSON.call(this), { id: this.cid });
    }

    // Return a color for a string.
    private static colorize(text: string): number[] {
        var hash = md5(text);
        return [
            parseInt(hash.slice(0, 2), 16),
            parseInt(hash.slice(1, 3), 16),
            parseInt(hash.slice(2, 4), 16)
        ];
    }

}

// All the lists.
class Lists extends SortedCollection {

    model: List;

    initialize() {
        // By default sort on the date key.
        this.sortOrder = { key: 'dateCreated', direction: -1 };
    }

}

interface ListInterface {
    dateCreated: number;
    description: string;
    name: string;
    size: number;
    status: string;
    tags: string[];
    type: string;
}

// Single row Model.
class List extends Backbone.Model implements ListInterface {

    get dateCreated(): number      { return this.get('dateCreated'); }
    set dateCreated(value: number) { this.set('dateCreated', value); }
    get description(): string      { return this.get('description'); }
    set description(value: string) { this.set('description', value); }
    get name(): string             { return this.get('name'); }
    set name(value: string)        { this.set('name', value); }
    get size(): number             { return this.get('size'); }
    set size(value: number)        { this.set('size', value); }
    get status(): string           { return this.get('status'); }
    set status(value: string)      { this.set('status', value); }
    get tags(): string[]           { return this.get('tags'); }
    set tags(value: string[])      { this.set('tags', value); }
    get type(): string             { return this.get('type'); }
    set type(value: string)        { this.set('type', value); }

    // Convert an intermine.List into a proper Model.
    constructor(list: intermine.List) {
        super();

        // Save them all, but only some will make it to our Model proper.
        for (var key in list) {
            if (key) {
                this[key] = list[key];
            }
        }
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
    private events: any;

    // Save some things on us.
    constructor(opts: {
        collection: Tags
        template: Hogan.Template
    }) {
        // The DOM events.
        this.events = {
            'click li': 'toggleTag'
        };

        super(opts);

        this.template = opts.template;
    }

    render(): TagsView {
        // Render the whole collection in one template.
        $(this.el).html(this.template.render({ tags: this.collection.toJSON() }));

        // Chain.
        return this;
    }

    // Toggle the state of one tag.
    toggleTag(evt: Event) {
        // Get the id of the Model in question.
        var id: string = $(evt.target).closest('li').data('model');

        // Toggle it.
        this.collection.find(function(tag: Tag): bool {
            if (tag.cid == id) {
                tag.active = !tag.active;
                return true; // do not search further
            }
            return false;
        });

        // Re-render.
        this.render();
    }

}

// Complete table of all lists.
class TableView extends Backbone.View {

    private rows: Row[]; // List Row views
    private tags: TagsView; // a View of Tags
    private collection: Lists; // all them lists, nicely attached here

    constructor(private opts: any) {
        super(opts);

        this.rows = [];
    }

    render(): TableView {
        // Render the template.
        $(this.el).html(this.opts.templates['table'].render({}));

        // Render the table body.
        this.renderTbody();

        // Render them tags.
        this.tags = new TagsView({
            collection: tags,
            template: this.opts.templates['tags']
        });
        $(this.el).find('div[data-view="tags"]').html(this.tags.render().el);

        // Now listen to tag collection active attr changes..
        tags.bind('change', this.renderTbody, this);

        // Chain.
        return this;
    }

    // Just re-render lists, properly.
    private renderTbody(): void {
        var self: TableView = this;

        // Get active tags.
        var active: string[] = tags.getActiveNames();

        // Create a fragment for rendering all lists.
        var fragment = document.createDocumentFragment();

        // For each list...
        this.collection.forEach(function(list: List) {
            // Do not create View if our tags do not match the active ones.
            // noinspection JSUnresolvedFunction
            if (list.tags.length !== 0 && _(list.tags).difference(active).length == list.tags.length) return;

            // New View.
            var row: Row = new Row({
                model: list,
                template: self.opts.templates['row']
            });
            // Push to stack.
            self.rows.push(row);
            // Append the child.
            fragment.appendChild(row.render().el);
        });

        // Render all them lists into table body.
        $(this.el).find('tbody[data-view="rows"]').html(fragment);
    }

}

class App {

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
        var self: App = this;

        // Work starts here.
        this.cb(null, true, null);

        // Get the user's lists.
        this.service.fetchLists(function(data: intermine.List[]) {
            // For each list...
            data.forEach(function(item: intermine.List) {
                // Modelify.
                var list: List = new List(item);

                // Add to the collection.
                lists.add(list);

                // Any new tags?
                list.tags.forEach(function(tag: string) {
                    // Add them to their collection.
                    tags.add({ name: tag });
                });
            });

            // Construct a new View and dump it to the target.
            var table: Backbone.View = new TableView({
                collection: lists,
                config: self.config,
                templates: self.templates
            });
            $(target).html(table.render().el);

            // No more work.
            self.cb(null, false, null);
        });
    }

}