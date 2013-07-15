/// <reference path="../defs/lib.d.ts" />
/// <reference path="../defs/underscore.d.ts" />

// Paginator triggering events and hiding its implementation.
export class Paginator extends Backbone.Model {

    // Max of how many do we want to see per page?
    get perPage(): number          { return this.get('perPage'); }
    set perPage(value: number) {
        if (this.get('perPage') !== value) {
            this.reset();
            // This will trigger change.
            this.set('perPage', value);
        }
    }

    // The current erm page.
    get currentPage(): number      { return this.get('currentPage'); }
    set currentPage(value: number) {
        if (this.get('currentPage') !== value) {
            this.reset();
            // This will trigger change.
            this.set('currentPage', value);
        }
    }

    // A function accessed as a property :).
    get pages(): number {
        return this.size / this.get('perPage');
    }

    // The size of the whole collection, not just the current page.
    get size(): number      { return this._size; }
    set size(value: number) { this._size = value; }

    // Number of items matching the current page.
    get returned(): number      { return this._returned; }
    set returned(value: number) { this._returned = value; }

    private _size: number;
    private _returned: number;

    constructor(opts: {
        perPage: number;
    }) {
        // Some defaults that can be overriden from higher up.
        super(_.extend({
            currentPage: 1, // always start on the first page
            perPage: 10 // have 10 results per page
        }, opts));
    }

    // Reset when we change our size or page. Does not trigger change as not saved as a Model attribute.
    public reset(): void {
        this.returned = 0;
        this.size = 0;
    }

}