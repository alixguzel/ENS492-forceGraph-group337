async function fetchJson() {
  let response = await fetch('./Data/Sample/sampleUnzip.json');
  let data = await response.json();
  return data;
}

function createFloatingBox(title, description) {
  var floatingBox = document.querySelector('.floating-box-two');

  if (floatingBox) {
    floatingBox.remove();
  }

  const node = document.createElement("div");
  node.classList.add("card");
  node.classList.add("floating-box-two");
  node.innerHTML = `
      <h3 class="card-title">${title}</h3>
      <p>${description}</p>
      <button class="close-button">
  <span>X</span>
</button>
    `;

  document.body.appendChild(node);

  const closeButton = node.querySelector('.close-button');
  closeButton.addEventListener('click', function () {
    node.remove();
  });
}

function filterNodes(inputval) {

  var filter_num = parseInt(inputval);
  const filteredNodes = gData.nodes.filter((n) => n.group == filter_num);
  console.log(filteredNodes);
  const filteredNodesIds = [];
  JSON.stringify(filteredNodes, (key, value) => {
    if (key === "id") filteredNodesIds.push(value);
    return value;
  });
  console.log(filteredNodesIds);
  const filteredLinks = gData.links.filter(
    (e) =>
      filteredNodesIds.includes(e.source.id) &&
      filteredNodesIds.includes(e.target.id)
  );
  console.log(filteredLinks);
  const filteredData = { nodes: filteredNodes, links: filteredLinks };
  console.log(filteredData);
  Graph.graphData(filteredData);
}

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

const submitBtn = document.getElementById("submit-btn");
submitBtn.addEventListener("click", function (event) {
  event.preventDefault();

  const inputVal = document.getElementById("inputBox").value;
  filterNodes(inputVal);
});

const resetBtn = document.getElementById("reset-btn");
resetBtn.addEventListener("click", function (event) {
  event.preventDefault();

  const inputVal = document.getElementById("inputBox").value;
  Graph.graphData(gData);
});


const elem = document.getElementById('3d-graph');
var gData = await fetchJson();

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

const Graph = ForceGraph3D()(document.getElementById("3d-graph"))
  .nodeLabel("id")
  .nodeAutoColorBy("group")
  .graphData(gData)
  .onNodeClick(node => createFloatingBox(node.id, node.description));


/*if(x == 6){
Graph.onNodeClick(node => window.open(`${node.user}/${node.id}`, '_blank'));
}
else{
Graph.nodeVisibility(node => node.group == 1);
}*/





