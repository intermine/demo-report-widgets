/// <reference path="../defs/jquery.d.ts" />
/// <reference path="../defs/underscore.d.ts" />
/// <reference path="../index" />
/// <reference path="./disposable" />
/// <reference path="./row" />
/// <reference path="./tags" />
/// <reference path="../models/tags" />
/// <reference path="../models/lists" />
/// <reference path="../models/sort" />
/// <reference path="./paginator" />
/// <reference path="../mediator" />

import a = module("../index");
import d = module("./disposable");
import r = module("./row");
import tv = module("./tags");
import tm = module("../models/tags");
import l = module("../models/lists");
import s = module("../models/sort");
import p = module("./paginator");
import m = module("../mediator");

// Complete table of all lists.
export class TableView extends d.DisposableView {

    private rows: r.RowView[]; // List Row views
    private tags: tv.TagsView; // a View of Tags
    private collection: l.Lists; // all them lists, nicely attached here
    private events: any; // Backbone events on DOM
    private opts: any; // not saving them straight from constructor as we need to attach events first
    private sortOrder: s.SortInterface; // keep track of previous sort order to do direction
    private paginator: p.PaginatorView;

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
        this.tags = new tv.TagsView({
            collection: tm.tags,
            template: this.opts.templates.tags
        });

        // Listen for all events here (like a boss).
        m.mediator.on('change:page change:sort change:tags', this.renderTable, this); // will get page number passed in
    }

    // Construct initially everything.
    render(): TableView {
        // The wrapping template.
        $(this.el).html(this.opts.templates.table.render({}));

        // Render tags.
        $(this.el).find('div[data-view="tags"]').html(this.tags.render().el);

        // Table & paginator always go together.
        this.renderTable();

        // Chain.
        return this;
    }

    // Just re-render lists, properly.
    private renderTable(page?: number): void {
        // First page?
        page = page || 1;

        // Set the current page on the collection's pagin.
        this.collection.paginator.currentPage = page;

        // Create a fragment for rendering all lists.
        var fragment = document.createDocumentFragment();

        // Dispose of any previous rows.
        this.disposeOf(this.rows);

        // For each paginated active list...
        (<Backbone.Collection> this.collection).forEach((list: l.List) => {
            // New View.
            var row: r.RowView = new r.RowView({
                model: list,
                templates: {
                    row: this.opts.templates.row,
                    tooltip: this.opts.templates.tooltip
                }
            });
            // Push to stack.
            this.rows.push(row);
            // Append the child.
            fragment.appendChild(row.render().el);
        });

        // Render all them lists into table body.
        $(this.el).find('tbody[data-view="rows"]').html(fragment);

        // Clean up.
        if (this.paginator) this.paginator.dispose();

        // New pagin.
        this.paginator = new p.PaginatorView({
            collection: <l.Lists> this.collection,
            template: this.opts.templates.pagination
        });

        // Render the paginator below.
        $(this.el).find('div[data-view="pagination"]').html(this.paginator.render().el);
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

        // Magic setter will change our internal each cache.
        (<s.SortedCollection> this.collection).sortOrder = this.sortOrder;

        // Trigger an event change (we are listening) which will re-render the table and paginator.
        m.mediator.trigger('change:sort');
    }

}