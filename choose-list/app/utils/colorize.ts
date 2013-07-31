/// <reference path="../defs/lib.d.ts" />
/// <reference path="../defs/underscore.d.ts" />

interface ColorMap {
    [key: string]: string;
}

export class Colorize {

    private map: ColorMap;

    // Init a new list for colorization.
    constructor() {
        this.map = {};
    }

    // Add text to a list to be colorized.
    public add(key: string): void {
        // Are we in already?
        if (_.isUndefined(this.map[key])) {
            // Not yet so add us.
            this.map[key] = null;
        }
    }

    // If we have not colorized - colorize and return our color.
    public get(key: string): string {
        var color: string;
        // Return white if we don't have you.
        if (_.isUndefined(color = this.map[key])) {
            return '#FFF';
        } else {
            return color;
        }

    }

    // Colorize them all.
    public run(): void {
        // How many ColorBrewer colors are we going for?
        var keys: string[] = _.keys(this.map),
            size: number = keys.length,
            count: number = 11;
        if (size >= 3 && size < 11) count = size;

        // TODO: skip clustering if count <= 11

        // Create a distance vector for each key.
        var vectors: number[][] = [];
        for (var i = 0; i < size; i++) {
            var vector: number[] = [];
            for (var j = 0; j < size; j++) {
                vector.push(distance(keys[i], keys[j]));
            }
            vectors.push(vector);
        }

        // A major ***.
        var clusters: any = clusterfck.kmeans(vectors, count);

        // Now go back and try to determine which is which.
        clusters.forEach((cluster: number[][], i: number) => {
            // For each element in the cluster.
            cluster.forEach((a: number[]) => {
                // For each vector.
                for (var j = 0; j < vectors.length; j++) {
                    var b: number[] = vectors[j];
                    // Break if we find a vector that matches our cluster.
                    if (arraysEqual(a, b)) break;
                }

                // Save the color.
                (<Colorize> this).map[keys[j]] = colorbrewer.RdYlGn[count][i];
                // Remove to reduce search space.
                vectors.splice(j, 1);
                keys.splice(j, 1);
            });
        });
    }

}

// Memoize Levenshtein distance.
var distance = _.memoize(function(a: string, b: string): number {
    return (new Levenshtein(a, b)).distance;

// The hash function.
}, function(): string {
    var a: string = arguments[0];
    var b: string = arguments[1];

    // The same distance regardless of the direction.
    if (<number> a.localeCompare(b) === 1) {
        return a + ":" + b;
    } else {
        return b + ":" + a;
    }
});

// Array equality.
var arraysEqual = function(a: any[], b: any[]): bool {
    return !(a < b || b < a);
};

// One colorizer per app.
export var colorize = new Colorize();