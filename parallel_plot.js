//reference code: https://d3-graph-gallery.com/graph/parallel_basic.html

const slide6Container = d3.select(".slide6 .visualization-container");

const svgWidth = 900;
const svgHeight = 500;
const margin = { top: 20, right: 10, bottom: 10, left: 10 };
const width = svgWidth - margin.left - margin.right;
const height = svgHeight - margin.top - margin.bottom;

const svg = d3
  .select(".slide6 .visualization-container")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

Promise.all([d3.csv("FP2022.csv"), d3.csv("VP2022.csv")])
.then(([fruitData, vegData]) => {

    fruitData.forEach((d) => (d.type = "fruit"));
    vegData.forEach((d) => (d.type = "vegetable"));

    const data = [...fruitData, ...vegData];

    const axes = ["Form", "Yield", "RetailPrice"];

    const y = {
    Form: d3
        .scalePoint()
        .domain(["Fresh", "Canned", "Juice", "Frozen", "Dried"])
        .range([height, 0]),
    Yield: d3
        .scaleLinear()
        .domain(d3.extent(data, (d) => +d.Yield))
        .range([height, 0]),
    RetailPrice: d3
        .scaleLinear()
        .domain(d3.extent(data, (d) => +d.RetailPrice))
        .range([height, 0]),
    };

    const colorScale = d3.scaleOrdinal()
        .domain(["fruit", "vegetable"])
        .range(["orange", "green"]);
    

    const x = d3
    .scalePoint()
    .domain(axes)
    .range([0, width])
    .padding(1);

    function path(d) {
    return d3.line()(
        axes.map((dim) => [x(dim), y[dim](dim === "Form" ? d[dim] : +d[dim])])
    );
    }

    svg.selectAll("axes")
    .data(axes)
    .join("g")
    .attr("transform", (d) => `translate(${x(d)})`)
    .each(function (d) {
        d3.select(this).call(d3.axisLeft(y[d]));
    })
    .append("text")
    .style("text-anchor", "middle")
    .attr("y", -10)
    .text((d) => d)
    .style("fill", "black");

    svg.selectAll("axesLines")
    .data(data)
    .join("path")
    .attr("d", path)
    .style("fill", "none")
    .style("stroke", (d) => colorScale(d.type))
    .style("opacity", 0.5);

});