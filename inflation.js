const marginInflation = { top: 50, right: 40, bottom: 50, left:190};
const charLR = marginInflation.left - marginInflation.right;
const charTB = marginInflation.top - marginInflation.bottom;
const widthIn = 800 - charLR;
const heightIn = 400 - charTB;

const svg1 = d3.select('#inflation-container')
  .append('svg')
  .attr('height', heightIn + charTB + 100)
  .attr('width', widthIn + charLR)
  .append('g')
  .attr('transform', `translate(${180}, ${40})`);

d3.csv('Fruit-Prices-2022.csv').then(data => { 
  const fruitData = data.sort((a,b) => b.RetailPrice - a.RetailPrice).slice(5, 20);
  const xScale = d3.scaleLinear()
  .range([0, widthIn])
  .domain([0, d3.max(fruitData, d => +d.RetailPrice)]);

  const yScale = d3.scaleBand()
    .range([0, heightIn])
    .domain(fruitData.map(d => `${d.Fruit} (${d.Form})`))
    .padding(0.4);

  svg1.append('g')
    .attr('transform', `translate(0, 400)`)
    .call(d3.axisBottom(xScale).ticks(10))
    .attr('font-family', 'cursive')
    .attr('font-size', '14px');

    svg1.append('g')
    .call(d3.axisLeft(yScale))
    .attr('font-family', 'cursive')
    .attr('font-size', '14px');

    const colors = d3.scaleOrdinal()
      .domain(fruitData.map(d => d.Fruit))
      .range(['#f25da3', '#34b0e2', '#a5d85f', '#7b2f89', '#e0c24d', '#2980b9', '#d9534f', '#66b3b3']);

    svg1.selectAll('.bar')
      .data(fruitData)
      .enter()
      .append('rect')
      .attr('stroke-width', 0.6)
      .attr('y', d => yScale(`${d.Fruit} (${d.Form})`))
      .attr('height', yScale.bandwidth())
      .attr('width', d => xScale(d.RetailPrice))
      .attr('fill', d => colors(d.Fruit));

    svg1.append('line')
      .attr('x1', 220)
      .attr('x2', 220)
      .attr('y1', 10)
      .attr('y2', heightIn)
      .attr('stroke', 'black')
      .attr('stroke-dasharray', '8');

    svg1.append('text')
      .attr('x', widthIn / 2 - 220)
      .attr('y', -10)
      .attr('font-family', 'cursive')
      .text('Suggested Price Increase due to Inflation vs Actual Increase');

    svg1.append('text')
      .attr('x', 240)
      .attr('y', 130)
      .attr('font-family', 'cursive')
      .text('Inflation Rate: 7.8%');

    svg1.append('text')
      .attr('x', widthIn / 2 - 170)
      .attr('y', 450)
      .attr('font-family', 'cursive')
      .text('Suggested Retail Price Increase in $');
});