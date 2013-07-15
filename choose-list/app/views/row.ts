/// <reference path="../defs/lib.d.ts" />
/// <reference path="../defs/jquery.d.ts" />

import d = module("./disposable");

// A single row with our list.
export class RowView extends d.DisposableView {

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

    render(): RowView {
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