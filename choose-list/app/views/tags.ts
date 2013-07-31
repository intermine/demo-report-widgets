/// <reference path="../defs/lib.d.ts" />
/// <reference path="../defs/jquery.d.ts" />
/// <reference path="../models/tags.ts" />
/// <reference path="../mediator" />

import t = module("../models/tags");
import m = module("../mediator");

// Encapsulates all tags in a sidebar.
export class TagsView extends Backbone.View {

    private collection: t.Tags;
    private template: Hogan.Template;
    private events: any;

    // Save some things on us.
    constructor(opts: {
        collection: t.Tags
        template: Hogan.Template
    }) {
        // The DOM events.
        this.events = {
            'click ul.side-nav li': 'toggleTag',
            'click dl.sub-nav dd': 'toggleFilter'
        };

        super(opts);

        this.template = opts.template;

        // Re-render us when our collection changes.
        (<Backbone.Collection> this.collection).bind('change', this.render, this);
    }

    render(): TagsView {
        // Render the whole collection in one template.
        $(this.el).html(this.template.render({
            tags: (<Backbone.Collection> this.collection).toJSON(),
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
        (<Backbone.Collection> this.collection).find(function(tag: t.Tag): bool {
            if (tag.cid == cid) {
                tag.active = !tag.active;
                return true; // do not search further
            }
            return false;
        });

        // Trigger an event (TableView is listening).
        m.mediator.trigger('change:tags');
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

        // Trigger an event (TableView is listening).
        m.mediator.trigger('change:tags');
    }

}