/// <reference path="../defs/lib.d.ts" />
/// <reference path="../defs/jquery.d.ts" />
/// <reference path="../defs/underscore.d.ts" />

import l = module("../models/lists");
import p = module("../models/paginator");

// The paginator component. Called from TableView.
export class PaginatorView extends Backbone.View {

    private collection:l.Lists;
    private template: Hogan.Template;
    private events: any;

    // Save some things on us.
    constructor(opts: {
        collection: l.Lists // this collection has the paginator interface within
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
        var paginator:p.Paginator = this.collection.paginator;

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
        var paginator:p.Paginator = this.collection.paginator;

        // Which page have we requested.
        var page: number;
        // Do nothing if we are on this page.
        if ((page = $(evt.target).closest('li').data('page')) == paginator.currentPage) return;

        // Change the internal object, will trigger an event which will bubble to lists which changes the table (and us).
        paginator.currentPage = page;
    }

}