/// <reference path="../defs/lib.d.ts" />
/// <reference path="../defs/jquery.d.ts" />
/// <reference path="./disposable.ts" />
/// <reference path="../models/tags.ts" />

import d = module("./disposable");
import t = module("../models/tags");

// A single row with our list.
export class RowView extends d.DisposableView {

    private model: Backbone.Model;
    private templates: { row: Hogan.Template; tooltip: Hogan.Template };
    private tooltip: { id: string; el: JQuery }; // tooltip rendered on us

    private events: any; // Backbone events on DOM

    constructor(opts: any) {
        this.tagName = "tr";

        // Expand on us.
        for (var key in opts) {
            this[key] = opts[key];
        }

        // Onhover show tooltip with name of the tag.
        this.events = {
            'mouseover ul.tags li': 'showTooltip',
            'mouseout ul.tags li': 'hideTooltip'
        };

        super();
    }

    render(): RowView {
        // Get them data.
        var data: any = this.model.toJSON(),
            date: Date = new Date(data.dateCreated);
        // Boost with time ago.
        data.timeAgo = moment(date).fromNow();

        // Render our template.
        $(this.el).html(this.templates.row.render(data));

        // Chain.
        return this;
    }

    // Show a tooltip.
    private showTooltip(ev: Event): void {
        var target: JQuery;
        // Get the Tag model id.
        var id: string = (target = $(ev.target).closest('li')).data('model');
        // Get the Tag in question.
        var tag: t.Tag;
        if (tag = <t.Tag> t.tags.get(id)) {
            // No tooltip yet?
            if (!this.tooltip || this.tooltip.id !== id) {
                if (this.tooltip && this.tooltip.el) this.tooltip.el.remove(); // go away you?
                // Render.
                var tooltip: JQuery;
                target.append(tooltip = $(this.templates.tooltip.render({ text: tag.name })));
                // Save.
                this.tooltip = {
                    id: id,
                    el: tooltip
                };
            }
            // JSONify and render our tooltip with it.
            console.log(tag.toJSON());
        }
    }

    // Take a guess.
    private hideTooltip(): void {
        if (this.tooltip && this.tooltip.el) {
            this.tooltip.el.remove();
            delete this.tooltip.id;
        }
    }

}