// Slide 7 only
const slide7Container = d3.select(".slide7 .visualization-container");

// Dimensions for the grocery bag image and visualization
const bagWidth = 400;
const bagHeight = 450;

// Tooltip/HoverContainer with aggressive colors
const tooltip = slide7Container
  .append("div")
  .attr("class", "tooltip")
  .style("position", "absolute")
  .style("background-color", "yellow")
  .style("color", "black")
  .style("border", "2px solid red")
  .style("padding", "8px")
  .style("font-size", "16px")
  .style("border-radius", "5px")
  .style("box-shadow", "0px 2px 4px rgba(0,0,0,0.2)")
  .style("pointer-events", "none")
  .style("opacity", 0); // Hide

// Grocery Bag Image
const bagImage = slide7Container
  .append("img")
  .attr("src", "grocerybag.png")
  .attr("alt", "Grocery Bag")
  .style("width", `${bagWidth}px`)
  .style("height", `${bagHeight}px`)
  .style("display", "block")
  .style("margin", "0 auto")
  .style("margin-top", "-100px")
  .on("mouseover", function (event) {
    console.log("Hovering over bag, avgPricePerGood:", avgPricePerGood); // Debugging

    //avgPrice checks
    if (avgPricePerGood > 0) {
      console.log(`Tooltip content: Average Price per Good: $${avgPricePerGood.toFixed(2)}`);

      tooltip
        .style("opacity", 1)
        .html(`Average Price per Good: $${avgPricePerGood.toFixed(2)}`)
        .style("left", `${event.pageX + 10}px`)
        .style("top", `${event.pageY + 10}px`);
    } else {
      tooltip
        .style("opacity", 1)
        .html("No data available")
        .style("left", `${event.pageX + 10}px`)
        .style("top", `${event.pageY + 10}px`);
    }
  })
  .on("mousemove", function (event) {
    // Move tooltip with cursor
    tooltip
      .style("left", `${event.pageX + 10}px`)
      .style("top", `${event.pageY + 10}px`);
  })
  .on("mouseout", function () {
    tooltip.style("opacity", 0);
  });

// Price Bounds Text
const priceText = slide7Container
  .append("h3")
  .attr("class", "price-text")
  .style("text-align", "center")
  .style("margin-top", "10px")
  .style("font-size", "24px")
  .text("");

// Year Slider
const yearSlider = slide7Container
  .append("input")
  .attr("type", "range")
  .attr("min", 2016) 
  .attr("max", 2022)
  .attr("step", 2)
  .attr("value", 2020)
  .style("width", "300px")
  .style("display", "block")
  .style("margin", "10px auto");

// Year Text
const yearLabel = slide7Container
  .append("h4")
  .attr("class", "year-label")
  .style("text-align", "center")
  .style("margin-top", "5px")
  .style("font-size", "18px")
  .text("Year: 2020");

// Global var for avg good price
let avgPricePerGood = 0;

/**
 * Calculate the Price Range
 * @param {*} data - The data loaded from the CSV
 * @returns A range of prices calculated as follows: Average of all goods
 * multiplied by 5 for the lower bound and 10 for the upper bound,
 * assuming consumers will buy 5-10 produce items, and multiplied by 2.51
 * which is the avg household size in the U.S.
 */
function calculatePriceRange(data) {
  avgPricePerGood = d3.mean(data, (d) => +d.RetailPrice) * 2.51;
  console.log("Updated avgPricePerGood:", avgPricePerGood); // Debugging

  const lowerBound = avgPricePerGood * 5;
  const upperBound = avgPricePerGood * 10;

  // Formatting
  return `$${lowerBound.toFixed(2)} - $${upperBound.toFixed(2)}`;
}

// Change Visualization Based on Year and Data
function updateVisualization(year) {
  const fileName = `FP${year}.csv`;

  d3.csv(fileName).then((data) => {
    console.log("Loaded data:", data); // Debugging

    const priceRange = calculatePriceRange(data);
    priceText.text(priceRange);
    yearLabel.text(`Year: ${year}`);
  }).catch((error) => {
    console.error("Error loading data:", error); // Debugging
  });
}

// Initialize Visualization with Default Year
updateVisualization(2020);

// Add Listener for Slider Changes
yearSlider.on("input", function () {
  const selectedYear = +d3.select(this).property("value");
  updateVisualization(selectedYear);
});
