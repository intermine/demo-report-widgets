/// <reference path="../defs/lib.d.ts" />
/// <reference path="../defs/jquery.d.ts" />
/// <reference path="./disposable.ts" />
/// <reference path="../models/tags.ts" />
/// <reference path="../models/lists" />
/// <reference path="../mediator" />
/// <reference path="../utils/colors" />

import d = module("./disposable");
import t = module("../models/tags");
import l = module("../models/lists");
import m = module("../mediator");
import c = module("../utils/colors");

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

        // Listen to when your Model gets toggled (a self contained re-render change).
        this.listenTo(this.model, 'change:selected', this.render);
    }

    public render(): RowView {
        // Get them data.
        var data: any = this.model.toJSON();
        if (data.tags) {
            // Sort tags alphabetically.
            (<t.Tag[]> data.tags).sort(function(a: t.Tag, b: t.Tag) {
                // Not exactly a Tag, but close enough...
                return a.slug.localeCompare(b.slug);
            });
            // Darken color.
            data.tags = _.map(data.tags, function(tag: any) {
                var before: string = tag.color;
                tag.color = {
                    background: before,
                    border: c.darken(before, { val: 20, type: '%' })
                };
                return tag;
            });
        }
        // Boost with formatted times.
        var time: Moment = moment(data.timestamp);
        _.extend(data, {
            timeAgo: time.fromNow(),
            prettyDate: time.format()
        });

        // Render our template.
        $(this.el).html(this.templates.row.render(data));

        // Selected list? Add a class on us. Or not.
        $(this.el)[(data.selected) ? 'addClass' : 'removeClass']('selected');

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

    // Select/deselect a list (LAX to SFO through LGW).
    private toggleList(ev: Event): void {
        // Trigger a toggling event on the list..
        m.mediator.trigger('select:list', {
            key: 'cid',
            value: this.model.cid,
            force: true
        });
    }

}