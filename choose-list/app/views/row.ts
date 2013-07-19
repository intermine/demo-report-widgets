/// <reference path="../defs/lib.d.ts" />
/// <reference path="../defs/jquery.d.ts" />
/// <reference path="./disposable.ts" />
/// <reference path="../models/tags.ts" />
/// <reference path="../models/lists" />

import d = module("./disposable");
import t = module("../models/tags");
import l = module("../models/lists");

export interface Templates {
    row: Hogan.Template
    tooltip: Hogan.Template
}

// A single row with our list.
export class RowView extends Chaplin.View {

    private model: Backbone.Model;
    private templates: Templates;
    private tooltip: { id: string; el: JQuery }; // tooltip rendered on us

    private events: any; // Backbone events on DOM

    constructor(opts: {
        model: l.List
        templates: Templates
        tagName?: string // not really provided just need a type
    }) {
        // Is a row...
        opts.tagName = 'tr';

        super(opts);

        // Expand templates on us.
        this.templates = opts.templates;

        // View events.
        this.delegate('mouseover', 'ul.tags li', this.showTooltip);
        this.delegate('mouseout', 'ul.tags li', this.hideTooltip);
        this.delegate('click', 'input[type="checkbox"]', this.toggleList);

        // Listen to when your Model changes.
        this.listenTo(this.model, 'change', () => {
            // Change our class as it is faster than re-render.
            $(this.el)[ ((<l.List> this.model).selected) ? 'removeClass' : 'addClass' ]('selected');
        });
    }

    public render(): RowView {
        // Get them data.
        var data: any = this.model.toJSON(),
            date: Date = new Date(data.dateCreated);
        // Boost with time ago.
        data.timeAgo = moment(date).fromNow();

        // Render our template.
        $(this.el).html(this.templates.row.render(data));

        // Selected list? Add a class on us.
        if (data.selected) $(this.el).addClass('selected');

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
        }
    }

    // Take a guess.
    private hideTooltip(): void {
        if (this.tooltip && this.tooltip.el) {
            this.tooltip.el.remove();
            delete this.tooltip.id;
        }
    }

    // Select/deselect a list.
    private toggleList(ev: Event): void {
        // Change the model.
        (<l.List> this.model).selected = <bool> $(ev.target).prop('checked');
        // Just toggle the class since it is easier than re-rendering all Views again.
        $(this.el).toggleClass('selected');
    }

}