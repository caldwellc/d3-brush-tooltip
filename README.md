# d3-brush-tooltip

Library for adding a tooltip to a [d3 brush](https://github.com/d3/d3-brush).

[![npm version](https://badge.fury.io/js/d3-brush-tooltip.svg)](https://badge.fury.io/js/d3-brush-tooltip)


# Example
[See it in action here](https://caldwellc.github.io/d3-brush-tooltip/)

![Tooltip Example](https://github.com/caldwellc/d3-brush-tooltip/blob/main/tooltip-example.jpg?raw=true)

# add to d3 brush in browser

Adding the tooltip to a d3 brush requires importing the library and providing a bit of css. Below you will find a sample html file and sample style for the label, which allows for it to be positioned alongside the cursor.

```html
<!DOCTYPE html>
<script src="https://cdn.jsdelivr.net/npm/d3@7"></script>
<script src="https://cdn.jsdelivr.net/npm/d3-brush-tooltip@1.0.1"></script>
<link rel="stylesheet" href="css/style.css">
<html>
    <body>
        <div id="chart-div">
            <div id="tooltip" class="tooltip-default"/>
        </div>
        <script>
            // create chart
            let width = 600;
            let height = 400;

            const margin = { top: 10, right: 30, bottom: 30, left: 40 };
            width = width - margin.left - margin.right,
            height = height - margin.top - margin.bottom;

            // append the svg object to the body of the page
            var svg = d3.select("#chart-div")
                .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform",
                    "translate(" + margin.left + "," + margin.top + ")");

            const maxX = 1000;

            // add x axis
            const x = d3.scaleLinear()
                .domain([0, maxX])
                .range([0, width]);

            svg.append("g")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(x));

            // generate random data
            const data = [];
            for (let i = 0; i < 1000; i++) {
              data.push(Math.random() * maxX);
            }

            // create bins
            const bin = d3.bin()
                .domain(x.domain())
                .thresholds(x.ticks(20));

            const bins = bin(data);

            // add y axis
            const y = d3.scaleLinear()
                .domain([0, d3.max(bins, function (d) { return d.length; })])
                .range([height, 0]);

            svg.append("g")
                .call(d3.axisLeft(y));

            // append the bar rectangles to the svg element
            svg.selectAll("rect")
                .data(bins)
                .enter()
                .append("rect")
                .attr("x", 1)
                .attr("transform", function (d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; })
                .attr("width", function (d) { return Math.max(0, x(d.x1) - x(d.x0) - 1); })
                .attr("height", function (d) { return height - y(d.length); })
                .style("fill", "#69b3a2")

            // add a brush container to the chart
            const brushContainer = svg.append("g");

            // create the brush
            const brush = d3.brushX().extent([[0, 0], [width, height]]);
            brushContainer.call(brush);

            // move brush to the initial position
            const initialSelection = [x(100), x(200)];
            brushContainer.call(brush.move, initialSelection);

            const tooltipId = "#tooltip";

            // function that takes a selection and provides the count of records within those bounds
            function getTooltipText(selection) {
                if (selection) {
                    const min = Math.round(x.invert(selection[0]));
                    const max = Math.round(x.invert(selection[1]));
                    const count = data.filter(value => value >= min && value <= max).length;
                    return `${min} - ${max}: ${count} records`;
                } else {
                    return null;
                }
            }

            // add tooltip to the brush
            window.d3BrushTooltip.addTooltipToBrush(tooltipId, brush, brushContainer, (brushEvent) => {
                const selection = brushEvent.selection;
                return getTooltipText(selection);
            }, getTooltipText(initialSelection));
        </script>
    </body>
</html>
```

```css
.tooltip-default {
    opacity: 1;
    background-color: white;
    border: solid 1px black;
    padding: 4px;
    border-radius: 4px;
    white-space: nowrap;
    pointer-events: none;
    display: none;
    z-index: 2;
    user-select: none;
    position: fixed;
}
```
