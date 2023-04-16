// Fetch the JSON data
async function fetchData() {
  const response = await fetch("Data/Sample/sampleUnzip.json");
  return await response.json();
}

// Filter the data based on the filters array
function filterData(data, filters) {
  const filteredNodes = data.nodes.filter((node) => {
    return filters.every((filter) => {
      if (filter.type === "min") {
        return node.followers_count >= filter.value;
      } else if (filter.type === "max") {
        return node.followers_count <= filter.value;
      } else if (filter.type === "screen-name") {
        // Add this new condition
        return node.screen_name
          .toLowerCase()
          .includes(filter.value.toLowerCase());
      }
      return true;
    });
  });

  const filteredNodeIndices = filteredNodes.map((node) =>
    data.nodes.indexOf(node)
  );

  const filteredLinks = data.links.filter((link) => {
    return (
      filteredNodeIndices.includes(link.source) &&
      filteredNodeIndices.includes(link.target)
    );
  });

  return {
    nodes: filteredNodes,
    links: filteredLinks,
  };
}

// Render the force graph with the given data
function renderGraph(data) {
  const Graph = ForceGraph3D()(document.getElementById("3d-graph")).graphData(
    data
  );
}

// Add a new filter to the filters container
function addFilter() {
  const filterContainer = document.createElement("div");
  filterContainer.classList.add("filter");

  const filterSelect = document.createElement("select");
  filterSelect.classList.add("filter-input");
  filterSelect.innerHTML = `
    <option value="min">Min Followers</option>
    <option value="max">Max Followers</option>
    <option value="screen-name">User Name</option>
  `;
  filterContainer.appendChild(filterSelect);

  const filterValue = document.createElement("input");
  filterValue.type = "text";
  filterValue.classList.add("filter-input");
  filterValue.placeholder = "Enter Value";
  filterContainer.appendChild(filterValue);

  document.getElementById("filters").appendChild(filterContainer);
}

// Fetch the initial data and render the graph
fetchData().then((data) => {
  renderGraph(data);
});

// Add a filter when the "Add Filter" button is clicked
document
  .getElementById("add-filter-button")
  .addEventListener("click", addFilter);

// Add an initial filter on page load
addFilter();

// Update the graph when the search button is clicked
document.getElementById("search-button").addEventListener("click", () => {
  fetchData().then((data) => {
    const filters = Array.from(document.getElementById("filters").children).map(
      (filterContainer) => {
        const type = filterContainer.querySelector("select").value;
        const value =
          parseInt(filterContainer.querySelector("input").value, 10) ||
          (type === "min" ? 0 : Infinity);
        return { type, value };
      }
    );
    const filteredData = filterData(data, filters);
    renderGraph(filteredData);
  });
});
document.getElementById("reset-button").addEventListener("click", () => {
  const filtersContainer = document.getElementById("filters");
  while (filtersContainer.firstChild) {
    filtersContainer.removeChild(filtersContainer.firstChild);
  }
  addFilter();
  fetchData().then((data) => {
    renderGraph(data);
  });
});

//Moving search box
const searchBox = document.getElementById("search-box");
let isMouseDown = false;
let offsetX, offsetY;

searchBox.addEventListener("mousedown", (event) => {
  isMouseDown = true;
  offsetX = event.clientX - searchBox.getBoundingClientRect().left;
  offsetY = event.clientY - searchBox.getBoundingClientRect().top;
});

document.addEventListener("mousemove", (event) => {
  if (isMouseDown) {
    searchBox.style.left = event.clientX - offsetX + "px";
    searchBox.style.top = event.clientY - offsetY + "px";
  }
});

document.addEventListener("mouseup", () => {
  isMouseDown = false;
});
