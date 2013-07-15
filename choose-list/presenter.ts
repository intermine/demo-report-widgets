/// <reference path="defs/jquery.d.ts" />
/// <reference path="defs/underscore.d.ts" />
/// <reference path="defs/lib.d.ts" />

// Paginator triggering events and hiding its implementation.
class Paginator extends Backbone.Model {

    // Max of how many do we want to see per page?
    get perPage(): number          { return this.get('perPage'); }
    set perPage(value: number) {
        if (this.get('perPage') !== value) {
            this.reset();
            // This will trigger change.
            this.set('perPage', value);
        }
    }

    // The current erm page.
    get currentPage(): number      { return this.get('currentPage'); }
    set currentPage(value: number) {
        if (this.get('currentPage') !== value) {
            this.reset();
            // This will trigger change.
            this.set('currentPage', value);
        }
    }

    // A function accessed as a property :).
    get pages(): number {
        return this.size / this.get('perPage');
    }

    // The size of the whole collection, not just the current page.
    get size(): number      { return this._size; }
    set size(value: number) { this._size = value; }

    // Number of items matching the current page.
    get returned(): number      { return this._returned; }
    set returned(value: number) { this._returned = value; }

    private _size: number;
    private _returned: number;

    constructor(opts: {
        perPage: number;
    }) {
        // Some defaults that can be overriden from higher up.
        super(_.extend({
            currentPage: 1, // always start on the first page
            perPage: 10 // have 10 results per page
        }, opts));
    }

    // Reset when we change our size or page. Does not trigger change as not saved as a Model attribute.
    public reset(): void {
        this.returned = 0;
        this.size = 0;
    }

}

// Sort on column key providing direction (asc, desc).
interface SortInterface {
    key: string;
    direction: number;
}

interface ForEachCallback {
    (value: Backbone.Model, index: number, array: any)
}

class SortedCollection extends Backbone.Collection {

    get sortOrder(): SortInterface      { return this._sortOrder; }
    set sortOrder(value: SortInterface) {
        // Init?
        this._sortOrder = (this._sortOrder) ? this._sortOrder : <SortInterface> {};

        // Is it different from the previous one?
        if (!_(this._sortOrder).isEqual(<any> value)) {
            // Set it, not by reference!
            for (var key in value) {
                if (typeof(value[key]) == 'object') throw 'Not cool!';
                this._sortOrder[key] = value[key];
            }
            // Discard each cache.
            this.eachCache = null;
        }
    }

    private eachCache: Backbone.Model[]; // caches the results of a sort for this sort order
    private _sortOrder: SortInterface; // privately stored here

    // Use custom sort column and order on standard `each`.
    forEach(cb: ForEachCallback): void {
        // No cache?
        if (!this.eachCache) {
            // Sort & save then.
            this.eachCache = (<List[]> this.models).sort((a: List, b: List) => {
                // Get the keys.
                var keyA = a[this.sortOrder.key],
                    keyB = b[this.sortOrder.key];

                if (typeof(keyA) !== typeof(keyB)) {
                    throw 'Key value types do not match'
                }

                // Based on the type of the object...
                switch (typeof(keyA)) {
                    case 'string':
                        return this.sortOrder.direction * keyA.localeCompare(keyB);
                    case 'number':
                        return this.sortOrder.direction * (keyA - keyB);
                    case 'object':
                        // Hope it is a Date.
                        if (keyA instanceof Date) {
                            return this.sortOrder.direction * (+keyA - +keyB);
                        }
                    default:
                        throw 'Do not know how to sort on key `' + this.sortOrder.key + '`';
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

    // Sort and return JSONified.
    toJSON(): any[] {
        var out = [];
        this.forEach(function(model: Backbone.Model) {
            out.push(model.toJSON());
        });
        return out;
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
    add(obj: any): Tag {
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

        return tag;
    }

    // Filter the Models to active ones.
    getActive(): any {
        return _(this.filter(function(tag: Tag): bool {
            return tag.active;
        }));
    }

    // Quick access for _.every on a property.
    every(property: string, all: bool): bool {
        return <bool> _(this.models).every(function(tag: Tag): bool {
            return tag[property] === all;
        });
    }

    // Set all properties in our models to a particular value (silently).
    setAll(property: string, value: any): void {
        // The new.
        var obj: any = {};
        obj[property] = value;
        // Change switch.
        var changed: bool = false;
        // For all.
        this.forEach(function(tag: Tag) {
            if (changed || tag[property] !== value) {
                changed = true;
                tag.set(obj, { silent: true });
            }
        });
        // Trigger the event once?
        if (changed) this.trigger('change');
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
        // noinspection JSUnresolvedVariable
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
    paginator: Paginator;

    initialize() {
        // By default sort on the date key.
        this.sortOrder = { key: 'dateCreated', direction: -1 };

        // Init paginator (disregard the fn name).
        this.paginator = new Paginator({ perPage: 10 });

        // Listen for changes on the paginator.
        this.paginator.bind('change', () => {
            // And then trigger our change...
            this.trigger('change');
        }, this);
    }

    // Will return a particular "page" of a collection of only active lists.
    public forEach(cb: ForEachCallback): void {
        // Number of lists skipped because they do not match our criteria.
        var skipped: number = 0;

        // Need to rest the internal paginator counters..
        this.paginator.reset();

        // Work out the subset I need to grab.
        var start: number = this.paginator.perPage * (this.paginator.currentPage - 1);

        // Call the custom dad.
        SortedCollection.prototype.forEach.call(this, (list: List, i: number) => {
            // Do we want you?
            if (!list.isActive()) {
                skipped += 1;
            } else {
                // Need to have the total count.
                this.paginator.size += 1;

                // Index sans rubbish.
                i -= skipped;

                // Fill it up to the number on the page starting with offset.
                if (i >= start && this.paginator.returned != this.paginator.perPage) {
                    // Call back.
                    cb(list, this.paginator.returned, this);
                    // One less to do.
                    this.paginator.returned += 1;
                }
            }
        });

        // Now we know how big we are and can render the paginator.
        this.trigger('paginated');
    }

}

interface ListInterface {
    dateCreated: number;
    description: string;
    name: string;
    size: number;
    status: string;
    tags: Tag[];
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
    get type(): string             { return this.get('type'); }
    set type(value: string)        { this.set('type', value); }

    // Tags are a relation where we pass/get Tag objects but internally store only their ids.
    get tags(): Tag[] {
        // Convert internal list of strings into actual objects...
        return <Tag[]> _.map(this.get('tags'), function(cid: string) {
            // By calling the global collection.
            return <Tag> (<Tags> tags).get(cid);
        });
    }
    set tags(value: Tag[]) {
        // Actually save the Model ids only.
        // Take care not to save the ref to Tag objects!
        this.set('tags', _.map(value, function(tag: Tag): string {
            return <string> tag.cid;
        }));
    }

    // Convert an intermine.List into a proper Model.
    constructor(list: intermine.List) {
        super();

        // Save them all, but only some will make it to our Model proper.
        for (var key in list) {
            switch (key) {
                case 'tags':
                    // Make into nice refs.
                    this.tags = _.map(list.tags, (name: string) => {
                        // Add or increase count, returns the Tag in question.
                        return <Tag> tags.add({ name: name });
                    });
                    break;
                default:
                    this[key] = list[key];
            }
        }

    }

    // Boost JSONification with JSONified tags.
    public toJSON(): any {
        // noinspection JSUnresolvedVariable
        return _.extend(Backbone.Model.prototype.toJSON.call(this), (() => {
            // Make use of Backbone.Collection to nicely JSONify.
            return { tags: new Backbone.Collection(this.tags).toJSON() };
        })());
    }

    // Check if all of this list's tags are active.
    public isActive(): bool {
        if (!this.tags.length) return true;

        // At least one needs to be active.
        for (var i = 0; i < this.tags.length; i++) {
            if (this.tags[i].active) return true;
        }

        return false;
    }

}

// Globally accessible collections.
var tags: Tags = new Tags();
var lists: Lists = new Lists();

// Just like Chaplin, be able to properly kill views.
class DisposableView extends Backbone.View {

    // Are we dead?
    public disposed: bool;

    constructor(opts?: any) {
        super(opts);

        // It is alive!
        this.disposed = false;
    }

    // Call this with a list of Views.
    public disposeOf(obj: any): void {
        // Iterable? Pass each of this to us.
        if (obj instanceof Array) {
            obj.forEach(this.disposeOf);
        } else {
            // We better be able to dispose.
            if ('dispose' in obj && typeof(<DisposableView> obj.dispose) == 'function') {
                obj.dispose();
            } else {
                throw 'Cannot dispose of this object';
            }
        }
    }

    // Dispose of properly.
    public dispose(): void {
        // Not needed?
        if (this.disposed) return;

        // Use Backbone internal remove.
        // this.undelegateEvents();
        // this.stopListening();
        this.remove();

        // Delete properties on us.
        [ 'el', '$el', 'options', 'opts', 'model', 'collection' ].forEach((property: string) => {
            delete this[property];
        });

        // Say we are dead.
        this.disposed = true;

        // You are frozen when your heart is not open.
        if (Object.freeze && typeof Object.freeze === 'function') {
            Object.freeze(this);
        }
    }

}

// A single row with our list.
class Row extends DisposableView {

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
            'click ul.side-nav li': 'toggleTag',
            'click dl.sub-nav dd': 'toggleFilter'
        };

        super(opts);

        this.template = opts.template;

        // Re-render us when out collection changes.
        this.collection.bind('change', this.render, this);
    }

    render(): TagsView {
        // Render the whole collection in one template.
        $(this.el).html(this.template.render({
            tags: this.collection.toJSON(),
            // Are all tags active?
            allActive: () => {
                return this.collection.every('active', true);
            },
            // Are all tags inactive?
            allInactive: () => {
                return this.collection.every('active', false);
            }
        }));

        // Chain.
        return this;
    }

    // Toggle the state of one tag.
    toggleTag(evt: Event) {
        // Get the id of the Model in question.
        var cid: string = $(evt.target).closest('li').data('model');

        // Toggle it.
        this.collection.find(function(tag: Tag): bool {
            if (tag.cid == cid) {
                tag.active = !tag.active;
                return true; // do not search further
            }
            return false;
        });
    }

    // Filter all of the tags either flipping them all active or not.
    toggleFilter(evt: Event) {
        // Which filter?
        switch ($(evt.target).closest('dd').data('filter')) {
            case 'all':
                this.collection.setAll('active', true);
                break;
            case 'none':
                this.collection.setAll('active', false);
                break;
            default:
                throw 'Unknown filter';
        }
    }

}

// The paginator component. Called from TableView.
class PaginatorView extends Backbone.View {

    private collection: Lists;
    private template: Hogan.Template;
    private events: any;

    // Save some things on us.
    constructor(opts: {
        collection: Lists // this collection has the paginator interface within
        template: Hogan.Template
    }) {
        // The DOM events.
        this.events = {
            'click li': 'changePage'
        };

        super(opts);

        this.template = opts.template;

        // Re-render us when our collection (lists) have finished paginating (faster).
        this.collection.bind('paginated', this.render, this);
    }

    // Render the paginator, triggered from TableView.
    render(): PaginatorView {
        var paginator: Paginator = this.collection.paginator;

        // Render the whole collection in one template.
        $(this.el).html(this.template.render(_.extend(paginator.toJSON(), {
            // Generate an array of "pages" because Hogan is good like that.
            pages: _.range(1, paginator.pages),
            // Is this the current page we are on?
            isCurrent: function(): bool {
                return parseInt(this) == paginator.currentPage;
            }
        })));

        // Chain.
        return this;
    }

    // When we click on one of the pagin links.
    private changePage(evt: Event): void {
        var paginator: Paginator = this.collection.paginator;

        // Which page have we requested.
        var page: number;
        // Do nothing if we are on this page.
        if ((page = $(evt.target).closest('li').data('page')) == paginator.currentPage) return;

        // Change the internal object, will trigger an event which will bubble to lists which changes the table (and us).
        paginator.currentPage = page;
    }

}

// Complete table of all lists.
class TableView extends DisposableView {

    private rows: Row[]; // List Row views
    private tags: TagsView; // a View of Tags
    private collection: Lists; // all them lists, nicely attached here
    private events: any; // Backbone events on DOM
    private opts: any; // not saving them straight from constructor as we need to attach events first
    private sortOrder: SortInterface; // keep track of previous sort order to do direction
    private paginator: PaginatorView;

    constructor(opts?: any) {
        // The DOM events.
        this.events = {
            'click thead th[data-sort]': 'sortTable'
        };

        super(opts);

        // Now save 'em.
        this.opts = opts;

        // All row views.
        this.rows = [];

        // Tags.
        this.tags = new TagsView({
            collection: tags,
            template: this.opts.templates['tags.hogan']
        });

        // Paginator.
        this.paginator = new PaginatorView({
            collection: this.collection, // also `lists`
            template: this.opts.templates['pagination.hogan']
        });

        // Listen for tag de-/activation.
        tags.bind('change', this.renderTable, this);

        // Listen for list changes (sorting & pagination).
        this.collection.bind('change', this.renderTable, this);
    }

    // Construct initially everything.
    render(): TableView {
        // The wrapping template.
        $(this.el).html(this.opts.templates['table.hogan'].render({}));

        // Render tags.
        $(this.el).find('div[data-view="tags"]').html(this.tags.render().el);

        // Table & paginator always go together.
        this.renderTable();

        // Render the paginator below.
        $(this.el).find('div[data-view="pagination"]').html(this.paginator.render().el);

        // Chain.
        return this;
    }

    // Just re-render lists, properly.
    private renderTable(): void {
        // Create a fragment for rendering all lists.
        var fragment = document.createDocumentFragment();

        // Dispose of any previous rows.
        this.disposeOf(this.rows);

        // For each paginated active list...
        this.collection.forEach((list: List) => {
            // New View.
            var row: Row = new Row({
                model: list,
                template: this.opts.templates['row.hogan']
            });
            // Push to stack.
            this.rows.push(row);
            // Append the child.
            fragment.appendChild(row.render().el);
        });

        // Render all them lists into table body.
        $(this.el).find('tbody[data-view="rows"]').html(fragment);
    }

    // When we click on table heads.
    private sortTable(ev: Event): void {
        // Get the column key to sort on.
        var key: string = $(ev.target).closest('th').data('sort');
        // Have we sorted before on the same key?
        if (this.sortOrder && this.sortOrder.key == key) {
            // Just flip the order.
            this.sortOrder.direction *= -1;
        } else {
            // Save new.
            this.sortOrder = {
                key: key,
                direction: 1
            };
        }

        // Magic setter.
        this.collection.sortOrder = this.sortOrder;

        // Trigger lists change.
        this.collection.trigger('change');
    }

}

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
                var list: List = new List(item);

                // Add to the collection. Will add to tags behind the scenes too
                lists.add(list);
            });

            // Construct a new View and dump it to the target.
            var table: Backbone.View = new TableView({
                collection: lists,
                config: this.config,
                templates: this.templates
            });
            $(target).html(table.render().el);

            // No more work.
            this.cb(null, false, null);
        });
    }

}