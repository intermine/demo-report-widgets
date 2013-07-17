/// <reference path="../defs/lib.d.ts" />
/// <reference path="../defs/jquery.d.ts" />
/// <reference path="../defs/underscore.d.ts" />
/// <reference path="../models/lists.ts" />
/// <reference path="../models/paginator.ts" />
/// <reference path="./disposable.ts" />

import l = module("../models/lists");
import p = module("../models/paginator");
import d = module("./disposable");

// The paginator component. Called from TableView.
export class PaginatorView extends d.DisposableView {

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
    }

    // Render the paginator, triggered from TableView.
    render(): PaginatorView {
        var paginator: p.Paginator = this.collection.paginator;

        // Render the whole collection in one template.
        $(this.el).html(this.template.render(_.extend(paginator.toJSON(), {
            // Generate an array of "pages" because Hogan is good like that.
            pages: _.range(1, paginator.pages + 1), // 1 indexed
            // Is this the current page we are on?
            isCurrent: function(): bool {
                return parseInt(this) == paginator.currentPage;
            }
        })));

        // Chain.
        return this;
    }

    // When we click on one of the pagin links or manually on our request.
    private changePage(evt: Event): void {
        var paginator: p.Paginator = this.collection.paginator;

        // Which page have we requested?
        var page: number = parseInt($(evt.target).closest('li').data('page'));
        // Do nothing if we are on this page (handled on Paginator Model now).
        // if (page == paginator.currentPage) return;

        // Change the internal object?
        paginator.currentPage = page;
    }

}