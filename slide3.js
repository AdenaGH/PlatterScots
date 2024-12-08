// Fetch data from selected_fruits_data.json
fetch('selected_fruits_data.json')
    .then(response => response.json())
    .then(data => {
        // Prepare the bubble chart data
        const bubbleData = Object.keys(data).map((fruit, i) => {
            const forms = data[fruit];
            const freshPrices = forms["Fresh"] || [];
            const price2013 = freshPrices.find(d => d.year === 2013)?.price || 0;
            const price2022 = freshPrices.find(d => d.year === 2022)?.price || 0;
            const increase = price2013 > 0 ? ((price2022 - price2013) / price2013) * 100 : 0;
            return {
                name: fruit,
                value: increase,
                prices: forms,
                color: d3.schemeTableau10[i % d3.schemeTableau10.length] // Assign unique color
            };
        });

        // Compute fixed y-axis range across all data
        const allPrices = Object.values(data).flatMap(fruit =>
            Object.values(fruit).flatMap(form => form.map(d => d.price))
        );
        const yMin = 0;
        const yMax = Math.ceil(Math.max(...allPrices));

        // Bubble Chart Dimensions
        const width = 400;
        const height = 400;

        // Bubble Chart
        const bubbleSvg = d3
            .select("#bubble-chart")
            .append("svg")
            .attr("width", width)
            .attr("height", height);

        const bubbleScale = d3.scaleLinear()
            .domain([0, d3.max(bubbleData, d => d.value)])
            .range([10, 50]);

        const simulation = d3.forceSimulation(bubbleData)
            .force("x", d3.forceX(width / 2).strength(0.05))
            .force("y", d3.forceY(height / 2).strength(0.05))
            .force("collision", d3.forceCollide().radius(d => bubbleScale(d.value) + 2))
            .on("tick", ticked);

        const bubbleNodes = bubbleSvg
            .selectAll("circle")
            .data(bubbleData)
            .enter()
            .append("circle")
            .attr("r", d => bubbleScale(d.value))
            .attr("fill", d => d.color)
            .attr("stroke", "black")
            .attr("stroke-width", 2)
            .style("cursor", "pointer")
            .on("click", (event, d) => updateLineChart(d.prices, d.name, d.color));

        const bubbleLabels = bubbleSvg
            .selectAll("text")
            .data(bubbleData)
            .enter()
            .append("text")
            .text(d => d.name)
            .attr("font-size", "10px")
            .attr("text-anchor", "middle")
            .attr("fill", "white")
            .style("pointer-events", "none");

        function ticked() {
            bubbleNodes.attr("cx", d => d.x).attr("cy", d => d.y);
            bubbleLabels.attr("x", d => d.x).attr("y", d => d.y + 4);
        }

        // Dimensions and margins for the line chart
        const margin = { top: 50, right: 100, bottom: 60, left: 60 };
        const graphWidth = 400 - margin.left - margin.right;
        const graphHeight = 400 - margin.top - margin.bottom;

        // Line Chart Container
        const lineSvg = d3
            .select("#line-chart")
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Scales with fixed y-axis
        const x = d3.scaleLinear().domain([2013, 2022]).range([0, graphWidth]);
        const y = d3.scaleLinear().domain([yMin, yMax]).range([graphHeight, 0]);

        // Axis Labels
        const xAxis = d3.axisBottom(x).tickFormat(d3.format("d"));
        const yAxis = d3.axisLeft(y);

        lineSvg.append("g").attr("transform", `translate(0,${graphHeight})`).call(xAxis);
        lineSvg.append("g").attr("class", "y-axis").call(yAxis);

        lineSvg
            .append("text")
            .attr("x", graphWidth / 2)
            .attr("y", graphHeight + 40)
            .attr("text-anchor", "middle")
            .attr("font-size", "14px")
            .text("Year");

        lineSvg
            .append("text")
            .attr("x", -graphHeight / 2)
            .attr("y", -40)
            .attr("text-anchor", "middle")
            .attr("font-size", "14px")
            .attr("transform", "rotate(-90)")
            .text("Avg price per pound");

        // Add a title placeholder
        const title = d3
            .select("#line-chart")
            .append("text")
            .attr("x", graphWidth / 2 + margin.left)
            .attr("y", margin.top / 2)
            .attr("text-anchor", "middle")
            .attr("font-size", "16px")
            .attr("font-family", "sans-serif")
            .attr("font-weight", "bold");

        // Line Generator
        const lineGenerator = d3.line()
            .x(d => x(d.year))
            .y(d => y(d.price));

        // Function to update the graph
        function updateLineChart(data, fruitName, fruitColor) {
            // Clear existing lines
            lineSvg.selectAll(".line").remove();

            // Update title
            title.text(fruitName);

            // Add lines for Fresh and Frozen prices
            const categories = ["Fresh", "Frozen"];
            categories.forEach(category => {
                if (data[category]) {
                    lineSvg
                        .append("path")
                        .datum(data[category])
                        .attr("class", "line")
                        .attr("fill", "none")
                        .attr("stroke", category === "Fresh" ? "green" : "blue")
                        .attr("stroke-width", 2)
                        .attr("d", lineGenerator);
                }
            });

            // Add a key container
            const keyContainer = d3
                .select("#line-chart")
                .selectAll(".legend")
                .data(categories)
                .join("g")
                .attr("transform", (_, i) => `translate(10, ${i * 20})`)
                .attr("class", "legend");

            keyContainer
                .append("circle")
                .attr("r", 5)
                .attr("cx", graphWidth + 20)
                .attr("cy", (_, i) => 10 + i * 20)
                .attr("fill", d => (d === "Fresh" ? "green" : "blue"));

            keyContainer
                .append("text")
                .attr("x", graphWidth + 30)
                .attr("y", (_, i) => 15 + i * 20)
                .text(d => d)
                .attr("font-size", "12px")
                .attr("fill", fruitColor);
        }

        // Default graph view
        updateLineChart(bubbleData[0].prices, bubbleData[0].name, bubbleData[0].color);
    })
    .catch(error => console.error("Error loading data:", error));
