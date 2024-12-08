(function () {
    const csvPath = './Datasets/Price_increase.csv';
    const margin = { top: 20, right: 20, bottom: 40, left: 50 },
          width = 900 - margin.left - margin.right,
          height = 400 - margin.top - margin.bottom;

    const svg = d3.select("#price-bar-chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    d3.text(csvPath).then(raw => {
        const data = d3.csvParseRows(raw, ([form, category, increase]) => ({
            form: form.trim(),
            category: category.trim(),
            increase: +increase.replace('%', '')
        }));

        data.forEach(d => {
            if (d.category === "Veggetable") d.category = "Vegetable";
        });

        const x0 = d3.scaleBand()
                    .domain([...new Set(data.map(d => d.form))])
                    .range([0, width])
                    .padding(0.2);

        const x1 = d3.scaleBand()
                    .domain(["Fruit", "Vegetable"])
                    .range([0, x0.bandwidth()])
                    .padding(0.1);

        const y = d3.scaleLinear()
                    .domain([0, d3.max(data, d => d.increase)])
                    .nice()
                    .range([height, 0]);

        const color = d3.scaleOrdinal()
                        .domain(["Fruit", "Vegetable"])
                        .range(["orange", "green"]);

                        svg.append("g")
                        .call(d3.axisLeft(y))
                        .append("text")
                        .attr("transform", "rotate(-90)")
                        .attr("x", -height / 2)
                        .attr("y", -margin.left + 15)
                        .attr("text-anchor", "middle")
                        .attr("fill", "black")
                        .style("font-size", "14px")
                        .text("Avg price increase %");
                     
                     svg.append("g")
                        .attr("transform", `translate(0,${height})`)
                        .call(d3.axisBottom(x0))
                        .append("text")
                        .attr("x", width / 2)
                        .attr("y", margin.bottom - 5)
                        .attr("text-anchor", "middle")
                        .attr("fill", "black")
                        .style("font-size", "14px")
                        .text("Form");
                     

        const groups = svg.selectAll(".form-group")
            .data(d3.group(data, d => d.form))
            .join("g")
            .attr("transform", ([form]) => `translate(${x0(form)},0)`);

        const bars = groups.selectAll("rect")
            .data(([_, values]) => values)
            .join("rect")
            .attr("x", d => x1(d.category))
            .attr("y", height)
            .attr("width", x1.bandwidth())
            .attr("height", 0)
            .attr("fill", d => color(d.category));

        const legend = svg.append("g")
                          .attr("transform", `translate(${width - 51}, ${height - 100})`);

        legend.selectAll("rect")
              .data(color.domain())
              .join("rect")
              .attr("x", 0)
              .attr("y", (d, i) => i * 20)
              .attr("width", 18)
              .attr("height", 18)
              .attr("fill", color);

        legend.selectAll("text")
              .data(color.domain())
              .join("text")
              .attr("x", 24)
              .attr("y", (d, i) => i * 20 + 12)
              .text(d => d)
              .style("font-size", "12px");

        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    bars.transition()
                        .duration(1000)
                        .attr("y", d => y(d.increase))
                        .attr("height", d => height - y(d.increase));
                }
            });
        }, { threshold: 0.5 });

        observer.observe(document.querySelector("#price-bar-chart"));
    }).catch(error => {
        console.error("Error loading or processing CSV:", error);
    });
})();
