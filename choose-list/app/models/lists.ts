/// <reference path="../defs/lib.d.ts" />
/// <reference path="../defs/underscore.d.ts" />
/// <reference path="./sort.ts" />
/// <reference path="./paginator.ts" />
/// <reference path="./tags.ts" />

import s = module("./sort");
import p = module("./paginator");
import t = module("./tags");

// All the lists.
export class Lists extends s.SortedCollection {

    model: List;
    paginator: p.Paginator;

    initialize() {
        // By default sort on the date key.
        this.sortOrder = { key: 'dateCreated', direction: -1 };

        // Init paginator (disregard the fn name).
        this.paginator = new p.Paginator({ perPage: 10 });

        // Listen for changes on the paginator.
        this.paginator.bind('change', () => {
            // And then trigger our change...
            this.trigger('change');
        }, this);
    }

    // Will return a particular "page" of a collection of only active lists.
    public forEach(cb: s.ForEachCallback): void {
        // Number of lists skipped because they do not match our criteria.
        var skipped: number = 0;

        // Need to reset the internal paginator counters..
        this.paginator.reset();

        // Work out the subset I need to grab.
        var start: number = this.paginator.perPage * (this.paginator.currentPage - 1);

        // Call the custom dad.
        s.SortedCollection['prototype'].forEach.call(this, (list: List, i: number) => {
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
    }

}

export interface ListInterface {
    dateCreated: number;
    description: string;
    name: string;
    size: number;
    status: string;
    tags: t.Tag[];
    type: string;
}

// Single row Model.
export class List extends Backbone.Model implements ListInterface {

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
    get tags(): t.Tag[] {
        // Convert internal list of strings into actual objects...
        return <t.Tag[]> _.map(this.get('tags'), function(cid: string) {
            // By calling the global collection.
            return <t.Tag> (<Backbone.Collection> t.tags).get(cid);
        });
    }
    set tags(value: t.Tag[]) {
        // Actually save the Model ids only.
        // Take care not to save the ref to Tag objects!
        this.set('tags', _.map(value, function(tag: t.Tag): string {
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
                        return <t.Tag> t.tags.add({ name: name });
                    });
                    break;
                default:
                    this[key] = list[key];
            }
        }

    }

    // Boost JSONification with JSONified tags.
    public toJSON(): any {
        return _.extend(Backbone.Model['prototype'].toJSON.call(this), (() => {
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

// Globally available.
export var lists = new Lists();