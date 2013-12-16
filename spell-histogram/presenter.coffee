# Simple assertion class.
class AssertException

    constructor: (@message) ->

    toString: -> "AssertException: #{@message}"

###
Set the assertion on the window object.
@param {boolean} exp Expression to be truthy
@param {string} message Exception text to show if `exp` is not truthy fruthy
###
@.assert = (exp, message) -> throw new AssertException(message) unless exp


# This is my app definition, needs to have a set signature.
# There always needs to be one and only one class `App`.
class exports.App

    # Google Visualization chart options.
    chartOptions:
        # The default font face for all text in the chart.
        fontName: 'Sans-Serif'
        # The default font size, in pixels, of all text in the chart.
        fontSize: 9
        # The colors to use for the chart elements.
        colors:   [ '#8E0022' ]
        # An object with members to configure various aspects of the legend.
        legend:
            # No legend is displayed.
            position: 'none'
        # An object with members to configure various horizontal axis elements.
        hAxis:
            # The title of the horizontal axis.
            title: 'Log2 Ratios'
            # An object that specifies the horizontal axis title text style.
            titleTextStyle:
                # The font face for the text in the horizontal axis.
                fontName: 'Sans-Serif'
        # An object with members to configure various vertical axis elements.
        vAxis:
            # The title of the vertical axis.
            title: 'Number of Experiments'
            # An object that specifies the vertical axis title text style.
            titleTextStyle:
                # The font face for the text in the vertical axis.
                fontName: 'Sans-Serif'

    ###
    Have access to config and templates compiled in.
    This function needs to always be present and will always accept the following two Objects.
    By using the at sign I am saving the two parameters on `this` object.
    @param {Object} config A key value dictionary of config coming from the server.
    @param {Object} templates A key value dictionary of template functions.
    ###
    constructor: (@config, @templates) ->
        assert @config.mine?, '`mine` needs to point to an InterMine instance'

        @service = new intermine.Service 'root': "#{@config.mine}service/"

    ###
    Render accepts a target to draw results into.
    This function needs to always be present and will always accept the target string.
    @param {jQuery selector} target Either a string or a jQuery selected object where to draw the output to.
    ###
    render: (@target) ->
        assert @config.pathQueries? and @config.pathQueries.expressionScores?, 'PathQuery of `expressionScores` not set'
        assert @config.type, 'an object `type` needs to be set'
        assert @config.symbol, 'an object `symbol` needs to be set'

        # Render template with loading text.
        $(@target).html @templates['chart.eco']
            'symbol': @config.symbol

        # Attach an event to update graph on symbol change.
        $(@target).find('input.symbol').keyup (e) =>
            symbol = $(e.target).val()
            # A new symbol?
            if symbol isnt @config.symbol
                @config.symbol = symbol
                # Render then.
                do @histogram

        # Make the initial graph rendering after fetching Google Visualization packages.
        google.load 'visualization', '1.0',
            'packages': [ 'corechart' ]
            'callback': @histogram

    # Make a clone of the PathQuery, bin data and display them.
    histogram: =>
        # Add a loading sign.
        $(@target).prepend loading = $ '<div class="alert-box">Loading &hellip;</div>'

        # Replace all occurences of 'TYPE' with the actual object type.
        pq = (replaceType = (obj, type) ->
            if typeof obj is 'object' # Object
                o = {} ; ( o[key] = replaceType(value, type) for key, value of obj ) ; return o
            else if obj instanceof Array # Array
                ( replaceType(item, type) for item in obj )
            else if typeof obj is 'string' # String
                return obj.replace /TYPE/g, type
        ) @config.pathQueries.expressionScores, @config.type
        
        # Push a constraint on the object symbol.
        pq.constraints ?= []
        pq.constraints.push
            'path':  @config.type
            'op':    'LOOKUP'
            'value': @config.symbol

        return @service.rows(pq).then (rows, res) =>
            return loading.text('Error').addClass('alert') if res.error
            
            # Flatten.
            rows = ( x.pop() for x in rows )

            # 1. Construct a linear quantitative scale.
            # 2. Set the scale's input domain to -20, 20.
            # 3. Set the scale's output range to -20, 20.
            x = d3.scale.linear().domain([-20, 20]).range([-20, 20])

            # 1. Construct a new histogram layout.
            # 2. Organize into bins of 20 representative values from the linear scale.
            data = d3.layout.histogram().bins(x.ticks(20))(rows)

            # Coerce the data into the Google Visualization format.
            twoDArray = _.map data, (bin) ->
                from = Math.round(x(bin.x))
                [ "#{from} to #{from + 2}", bin.y ]

            # Remove loading sign.
            do loading.remove

            # Point the chart to render to the `target` element's specified `chart` div.
            el = $(@target).find('.chart')[0]
            chart = new google.visualization.ColumnChart el

            # Take the 2-dimensional array and turn it into a DataTable.
            table = google.visualization.arrayToDataTable twoDArray, yes
            # Draw the visualization on the page passing in options that we specified higher up.
            chart.draw table, @chartOptions