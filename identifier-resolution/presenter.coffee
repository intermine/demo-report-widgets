class Form extends Backbone.View

    events:
        'click button': 'submit'

    initialize: (@config, @templates, @service) ->

    render: ->
        # Populate the template.
        $(@el).html @templates[@config.type + '.eco'] @config

        @

    # Upload a list of identifiers and make them into a list.
    submit: ->
        # Our ref.
        self = @

        # Input cleaner.
        clean = (value) ->
            value = value
            .replace(/^\s+|\s+$/g, '') # trim leading and ending whitespace
            .replace(/\s{2,}/g, ' ')   # remove multiple whitespace
            
            return [] if value is ''   # useless whitespace input

            value.split /\s/g          # split on whitespace

        # Expose the input "globally".
        input = {}

        # Work starts here.
        self.config.cb null, true

        # Get the form.
        async.waterfall [ (cb) ->
            # Get the identifiers.
            input.ids = clean $(self.el).find('form *[name="input"]').val()

            # Do we have any?
            return cb 'No identifiers have been provided' if input.ids.length is 0

            # Get the DOM data.
            input.organism = $(self.el).find('form select[name="organism"]').val()
            input.type = $(self.el).find('form select[name="type"]').val()

            # Next.
            cb null

        # Upload IDs.
        (cb) ->
            (self.service.resolveIds
                'identifiers': input.ids
                'type':        input.type
                'extra':       input.organism
            ).then (job) ->
                cb null, job

        # Poll for job results.
        (job, cb) ->
            job.poll().then (results) ->
                # Just get the keys.
                keys = _.keys results

                # Do we have anything?
                return cb 'No identifiers were resolved' if keys.length is 0
        
               # Form a query.
                query =
                    'select': [
                        "#{input.type}.*"
                    ]
                    'constraints': [
                        { 'path': "#{input.type}.id", 'op': 'ONE OF', 'values': keys }
                    ]

                cb null, query

        # Call back with the JSON query and original input.
        ], (err, q) ->
            self.config.cb err, false,
                'input': input
                'query': q

# This is my app definition, needs to have a set signature.
class exports.App

    # Have access to config and templates compiled in.
    constructor: (@config, @templates) ->
        # I will throw up the first chance I get. Or will I?
        @config.cb ?= -> throw 'Provide your own `cb` function'

        # Point to the mine's service.
        @service = new intermine.Service
            'root': @config.mine
            'errorHandler': @config.cb # first param passed to errorHandler is the error

    # Render accepts a target to draw results into.
    render: (target) ->
        self = @

        target = $ target

        # Work starts here.
        self.config.cb null, true

        # Get the types.
        async.waterfall [ (cb) ->
            self.service.fetchModel (model) ->
                # Binary search tree of classes where items are sorted based on name.
                classes = new buckets.BSTree (a, b) -> a[1].localeCompare(b[1])
                
                # Now that we have the model, convert to PathInfo for each and give us nice name.
                async.each Object.keys(model.classes), (clazz, cb) ->
                    (model.getPathInfo(clazz)).getDisplayName (name) ->
                        classes.add [ clazz, name ]
                        cb null
                , (err) ->
                    # Convert to Array.
                    self.config.classes = classes.toArray()
                    cb null

        # Get the organisms.
        (cb) ->
            query = self.config.pathQueries?.organisms
            return cb 'Missing `organisms` pathQuery' unless query

            self.service.query query, (q) ->
                q.records (obj) ->
                    # Binary search tree sorted on short name.
                    organisms = new buckets.BSTree (a, b) -> a[1].localeCompare(b[1])
                    # Fill it.
                    ( organisms.add [ item.name, item.shortName ] for item in obj )
                    # Save it.
                    self.config.organisms = organisms.toArray()
                    # Bye.
                    cb null

        ], (err) ->
            # Trouble in the paradise?
            return self.config.cb(err) if err

            # No longer working.
            self.config.cb null, false

            # New View.
            view = new Form self.config, self.templates, self.service
            
            # Render into the target el.
            target.html view.render().el
    
            # Foundation custom forms.
            target.foundation('forms')