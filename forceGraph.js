async function fetchJson() {
  let response = await fetch('./networkData-test.json');
  let data = await response.json();
  return data;
}


function createFloatingBox(name, screen_name, num_followers, party) {
  var floatingBox = document.querySelector('.floating-box-two');

  if (floatingBox) {
    floatingBox.remove();
  }

  const node = document.createElement("div");
  node.classList.add("card");
  node.classList.add("floating-box-two");
  node.innerHTML = `
      <h3 class="card-title">${name}</h3> 
      <p><b>Number of Followers:</b> ${num_followers}</p>
      <p><b>Political Party:</b> ${party}</p>
      <p><b>Twitter:</b> <a href="https://twitter.com/${screen_name}" target="_blank">https://twitter.com/${screen_name}</a></p>
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

// Function to filter nodes based on the input value
function filterNodes(partyinputVal, minFinputVal, maxFinputVal, party, minF, maxF) {

  let filteredNodes = gData.nodes

  console.log(partyinputVal, minFinputVal, maxFinputVal, party, minF, maxF)

  if (party) {
    filteredNodes = filteredNodes.filter((n) => n.party == partyinputVal);
  }
  if (minF) {
    filteredNodes = filteredNodes.filter((n) => n.num_followers > parseInt(minFinputVal));
  }
  if (maxF) {
    filteredNodes = filteredNodes.filter((n) => n.num_followers < parseInt(maxFinputVal));
  }

  const filteredNodesIds = [];
  JSON.stringify(filteredNodes, (key, value) => {
    if (key === "id") filteredNodesIds.push(value);
    return value;
  });

  const filteredLinks = gData.links.filter(
    (e) =>
      filteredNodesIds.includes(e.source.id) &&
      filteredNodesIds.includes(e.target.id)
  );

  const filteredData = { nodes: filteredNodes, links: filteredLinks };

  Graph.graphData(filteredData);
}

// Event listener for the filter input submit button
const submitBtn = document.getElementById("submit-btn");
submitBtn.addEventListener("click", function (event) {
  event.preventDefault();

  let party, minF, maxF = false;

  const partyinputVal = document.getElementById("party-inputBox").value;
  const minFinputVal = document.getElementById("minF-inputBox").value;
  const maxFinputVal = document.getElementById("maxF-inputBox").value;

  if (partyinputVal != "") { party = true; }
  if (minFinputVal != "") { minF = true; }
  if (maxFinputVal != "") { maxF = true; }

  filterNodes(partyinputVal, minFinputVal, maxFinputVal, party, minF, maxF);
});

// Event listener for removing the filters by clicking on the reset button
const resetBtn = document.getElementById("reset-btn");
resetBtn.addEventListener("click", function (event) {
  event.preventDefault();

  Graph.graphData(gData);
});


const elem = document.getElementById('3d-graph');
var gData = await fetchJson();


const Graph = ForceGraph3D()(document.getElementById("3d-graph"))
  .nodeLabel("screen_name")
  .nodeColor(node => { if (node.party == "CHP") { return "red" } else if (node.party == "AKP") { return "yellow" } else if (node.party == "MHP") { return "white" } else if (node.party == "HDP") { return "green" } else if (node.party == "IYI") { return "blue" }; })
  .graphData(gData)
  .onNodeClick(node => { // Aim at node from outside it
    const distance = 40;
    const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);

    const newPos = node.x || node.y || node.z
      ? { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio }
      : { x: 0, y: 0, z: distance }; // special case if node is in (0,0,0)

    Graph.cameraPosition(
      newPos, // new position
      node, // lookAt ({ x, y, z })
      3000  // ms transition duration
    ); createFloatingBox(node.name, node.screen_name, node.num_followers, node.party)
  });




/*
if(x == 6){
Graph.onNodeClick(node => window.open(`${node.user}/${node.id}`, '_blank'));
}
else{
Graph.nodeVisibility(node => node.group == 1);
}
*/
