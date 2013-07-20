// eco templates.
interface EcoTemplate {
    (context?: any): string;
}

// Hogan templates.
declare module Hogan {
    export class Template {
        constructor (precompiled: string);
        render(context: any): string;
    }
}

// Moment.
interface Moment {
    fromNow(): string;
}
interface MomentStatic {
    (date: Date): Moment;
}
declare var moment: MomentStatic;

// md5.
declare function md5(input: string): string;

// imjs.
interface Promise {}
declare module intermine {
    export class List {
        authorized: bool;
        dateCreated: string;
        description: string;
        folders: any[];
        name: string;
        size: number;
        status: string;
        tags: string[];
        timestamp: number;
        title: string;
        type: string;
    }

    interface InterMineServiceListsCallback {
        (lists: List[]): void;
    }

    export class Service {
        constructor (opts: {
            root: string
            token: string
            errorHandler: Function
        });
        fetchLists(cb: (lists: intermine.List[]) => void ): Promise;
    }
}

// async.
interface AsyncResultsCallback {
    (err: string, results?: any): void;
}
interface Async {
    each(arr: any[], iterator: Function, cb: AsyncResultsCallback): void;
    waterfall(tasks: any[], cb: AsyncResultsCallback): void;
}
declare var async: Async;

// Backbone 1.0.0 & Backbone-Relational 0.8.5
declare module Backbone {
    // It is a Module, not a Class!
    export module Events {
        function on(eventName: string, callback: (...args: any[]) => void , context?: any): any;
        function off(eventName?: string, callback?: (...args: any[]) => void , context?: any): any;
        function trigger(eventName: string, ...args: any[]): any;
        function bind(eventName: string, callback: (...args: any[]) => void , context?: any): any;
        function unbind(eventName?: string, callback?: (...args: any[]) => void , context?: any): any;

        function once(events: string, callback: (...args: any[]) => void , context?: any): any;
        function listenTo(object: any, events: string, callback: (...args: any[]) => void ): any;
        function listenToOnce(object: any, events: string, callback: (...args: any[]) => void ): any;
        function stopListening(object?: any, events?: string, callback?: (...args: any[]) => void ): any;
    }

    export class Model {
        constructor (attr?, opts?);
        get(name: string): any;
        set(name: string, val: any): void;
        set(obj: any, opts?: any): void;
        escape(attr: string): string;
        has(attr: string): bool;
        unset(attr: string, opts?: any): void;
        clear(opts?: any): void;
        id: string;
        idAttribute: string;
        cid: string;
        attributes: any;
        changed: any;
        defaults(opts?: any): any;
        toJSON(): any;
        sync(method: string, model: Model, opts?: any): void;
        fetch(opts?: any): void;
        save(attrs?: any, opts?: any): void;
        destroy(opts?: any): void;
        validate(attrs: any, opts: any);
        validationError: any;
        isValid(): bool;
        url(): string;
        urlRoot: any;
        parse(response:any, opts: any): any;
        clone(): Model;
        isNew(): bool;
        hasChanged(attr?: string): bool;
        changedAttributes(attrs?: any): any;
        previous(attr: string): any;
        previousAttributes(): any;

        // Events.
        bind(eventName: string, callback: (...args: any[]) => void , context?: any): any;
    }

    export class Collection {
        constructor (models?, opts?);
        model: any;
        models: any[];
        toJSON(): any;
        sync(method: string, collection: any, opts?: any): void;
        add(models: any, opts?: any): void;
        remove(models: any, opts?: any): void;
        reset(models?: any, opts?: any): void;
        set(models: any, opts?: any): void;
        get(id: string): Model;
        at(index: number): Model;
        push(model: any, opts?: any): void;
        pop(opts?: any): Model;
        unshift(model: Model, opts?: any): Model;
        shift(opts?: any): Model;
        slice(begin: number, end: number): Model[];
        length: number;
        comparator(element: any): any;
        comparator(compare: any, to?: any): any;
        sort(opts?: any): any;
        pluck(attr): any[];
        where(attrs): Model[];
        findWhere(attrs): Model;
        url: any;
        parse(response:any, opts: any): any;
        clone(): Collection;
        fetch(opts?: any): void;
        create(attrs: any, opts?: any): Collection;

        // from Underscore.
        find(iterator: (element: Model, index: number) => bool, context?: any): Model;
        forEach(iterator: (element: Model, index: number, list?: any) => void , context?: any);
        each(iterator: (element: Model, index: number, list?: any) => void , context?: any);
        filter(iterator: (element: Model, index: number) => bool, context?: any): Model[];

        // Events.
        bind(eventName: string, callback: (...args: any[]) => void , context?: any): any;
        trigger(eventName: string, ...args: any[]): any;
        off(eventName?: string, callback?: (...args: any[]) => void , context?: any): any;
    }

    export class View {
        constructor (opts?);
        el: HTMLElement;
        $el: any;
        setElement(element: HTMLElement, delegate?: bool): void;
        attributes: any;
        $(selector: string): any;
        render(): View;
        remove(): void;
        delegateEvents(events?: any): void;
        undelegateEvents(): void;
        tagName: string;
        id: string;
        cid: string;

        // Events.
        stopListening(object?: any, events?: string, callback?: (...args: any[]) => void ): any;
    }

}

// The little bowler hat man.
declare module Chaplin {

    export class Model extends Backbone.View {

    }

    export class View extends Backbone.View {
        delegate(event: string, handler: Function);
        delegate(event: string, selector: string, handler: Function);
        listenTo(model: Backbone.Model, event: string, handler: Function);
        listenTo(model: Chaplin.Model, event: string, handler: Function);
        removeSubview(name: string);
        removeSubview(view: Chaplin.View);
        dispose();
    }

}