// Fetch the JSON data
async function fetchData() {
  const response = await fetch("Data/Sample/sampleUnzip.json");
  return await response.json();
}

// Filter the data based on followers_count
function filterData(data, maxFollowersCount) {
  const filteredNodes = data.nodes.filter((node) => {
    return node.followers_count < maxFollowersCount;
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

// Render the graph
function renderGraph(data) {
  const Graph = ForceGraph3D()(document.getElementById("3d-graph")).graphData(
    data
  );
}

// Initial render
fetchData().then((data) => {
  renderGraph(data);
});

// Update the graph when the search button is clicked
document.getElementById("search-button").addEventListener("click", () => {
  fetchData().then((data) => {
    const maxFollowersCount = parseInt(
      document.getElementById("search-input").value,
      10
    );
    const filteredData = isNaN(maxFollowersCount)
      ? data
      : filterData(data, maxFollowersCount);
    renderGraph(filteredData);
  });
});
