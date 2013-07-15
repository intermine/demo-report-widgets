/// <reference path="../defs/lib.d.ts" />

// Just like Chaplin, be able to properly kill views.
export class DisposableView extends Backbone.View {

    // Are we dead?
    public disposed: bool;

    constructor(opts?: any) {
        super(opts);

        // It is alive!
        this.disposed = false;
    }

    // Call this with a list of Views.
    public disposeOf(obj: any): void {
        // Iterable? Pass each of this to us.
        if (obj instanceof Array) {
            obj.forEach(this.disposeOf);
        } else {
            // We better be able to dispose.
            if ('dispose' in obj && typeof(<DisposableView> obj.dispose) == 'function') {
                obj.dispose();
            } else {
                throw 'Cannot dispose of this object';
            }
        }
    }

    // Dispose of properly.
    public dispose(): void {
        // Not needed?
        if (this.disposed) return;

        // Use Backbone internal remove.
        // this.undelegateEvents();
        // this.stopListening();
        this.remove();

        // Delete properties on us.
        [ 'el', '$el', 'options', 'opts', 'model', 'collection' ].forEach((property: string) => {
            delete this[property];
        });

        // Say we are dead.
        this.disposed = true;

        // You are frozen when your heart is not open.
        if (Object.freeze && typeof Object.freeze === 'function') {
            Object.freeze(this);
        }
    }

}