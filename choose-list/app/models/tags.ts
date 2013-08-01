/// <reference path="../defs/lib.d.ts" />
/// <reference path="../defs/underscore.d.ts" />
/// <reference path="./sort.ts" />
/// <reference path="../utils/colorize.ts" />

import s = module("./sort");
import c = module("../utils/colorize");

export interface TagInterface {
    name: string; // tag name, not using internal id!
    count: number; // how many times used
    active: bool; // actively selected in UI?
}

// One tag.
export class Tag extends Backbone.Model implements TagInterface {

    get name(): string       { return this.get('name'); }
    set name(value: string)  {
        // An intermine internal tag?
        if (value.match(/^im:/)) {
            value = value.replace(/^im:/, '');
            this.set('im', true);
        }

        // Slugify, set us.
        this.set({
            slug: _['string'].slugify(value), // FIXME
            name: value
        });

        // Add us for colorization.
        c.colorize.add(value);
    }
    get slug(): string       { return this.get('slug'); }
    get im(): bool           { return this.get('im') || false; } // is only set when it exists
    set count(value: number) { this.set('count', value); }
    get count(): number      { return this.get('count'); }
    set active(value: bool)  { this.set('active', value); }
    get active(): bool       { return this.get('active'); }

    constructor(obj: TagInterface) {
        super();

        // Set the name from the incoming object.
        this.name = obj.name;

        // Say are you active?
        this.active = obj.active;

        // Init count.
        this.count = 1;
    }

    // Check if a tag name matches (works out prefixes).
    public isName(name: string): bool {
        return name.replace(/^im:/, '') === this.name;
    }

    // Boost JSONification with our internal id and color.
    public toJSON(): any {
        return _.extend(Backbone.Model['prototype'].toJSON.call(this), {
            id: this.cid,
            color: c.colorize.get(this.name)
        });
    }

}

// All the tags, coming from Lists.
export class Tags extends Backbone.Collection {

    model: Tag;

    public hidden: string[]; // hidden tags config

    initialize() {
        // Empty by default.
        this.hidden = [];
    }

    // By default sort on the count of lists with our tag.
    comparator(tag: Tag) {
        return - tag.count;
    }

    // Add a new tag or increase count.
    add(obj: any): Tag {
        // Do we have it?
        var tag: Tag;
        if (tag = <Tag> this.find(function(item: Tag) {
            return item.isName(obj.name);
        })) {
            tag.count += 1;
        } else {
            // Hidden?
            obj.active = this.hidden.indexOf(obj.name) == -1;
            // Add.
            tag = new Tag(obj);
            Backbone.Collection['prototype'].add.call(this, tag);
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

// Globally available.
export var tags = new Tags();