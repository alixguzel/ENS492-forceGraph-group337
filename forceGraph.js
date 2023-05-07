let areNodesFiltered = false


const urlParams = new URLSearchParams(window.location.search);
const dataParams = urlParams.get('politicianNodes_S3D.json');
console.log(dataParams);
console.log(typeof dataParams)


async function fetchJson() {
  if (dataParams == null) {
    let response = await fetch('./politicianNodes_S3D.json');
    let data = await response.json();
    return data;
  }
  let response = await fetch('./' + dataParams);
  let data = await response.json();
  return data;
}

var gData = await fetchJson();
var filteredNodes = gData.nodes


// cross-link node objects
gData.links.forEach(link => {
  const a = gData.nodes.find(node => node.id === link.source);
  const b = gData.nodes.find(node => node.id === link.target);
  !a.neighbors && (a.neighbors = []);
  !b.neighbors && (b.neighbors = []);
  a.neighbors.push(b);
  b.neighbors.push(a);

  !a.links && (a.links = []);
  !b.links && (b.links = []);
  a.links.push(link);
  b.links.push(link);
});

const highlightNodes = new Set();
const highlightLinks = new Set();
let hoverNode = null;


const Graph = ForceGraph3D()(document.getElementById("3d-graph"))
  .graphData(gData)
  .nodeLabel("screen_name")
  .nodeRelSize(30)
  .nodeOpacity(1)
  .linkWidth(link => highlightLinks.has(link) ? 10 : 5)
  .linkDirectionalParticles(link => highlightLinks.has(link) ? 4 : 0)
  .linkDirectionalParticleWidth(4)
  .nodeColor(node => { if (node.party == "CHP") { return "red" } else if (node.party == "AKP") { return "yellow" } else if (node.party == "MHP") { return "white" } else if (node.party == "HDP") { return "green" } else if (node.party == "IYI") { return "blue" }; })
  .linkVisibility(link => highlightLinks.has(link))
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
  })
  .onNodeHover(node => {
    // no state change
    if ((!node && !highlightNodes.size) || (node && hoverNode === node)) return;

    highlightNodes.clear();
    highlightLinks.clear();
    if (node) {
      highlightNodes.add(node);
      node.neighbors.forEach(neighbor => highlightNodes.add(neighbor));
      node.links.forEach(link => highlightLinks.add(link));
    }

    hoverNode = node || null;

    updateHighlight();
  })
  .onLinkHover(link => {
    highlightNodes.clear();
    highlightLinks.clear();

    if (link) {
      highlightLinks.add(link);
      highlightNodes.add(link.source);
      highlightNodes.add(link.target);
    }

    updateHighlight();
  });



function updateHighlight() {
  // trigger update of highlighted objects in scene
  Graph
    .nodeColor(Graph.nodeColor())
    .linkWidth(Graph.linkWidth())
    .linkDirectionalParticles(Graph.linkDirectionalParticles());
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

function createPopUpBox(textInput) {
  var floatingPopUpBox = document.querySelector('.floating-box-popUp');

  if (floatingPopUpBox) {
    floatingPopUpBox.remove();
  }

  const node = document.createElement("div");
  node.classList.add("card");
  node.classList.add("floating-box-popUp");
  node.innerHTML = `
        <p>${textInput}</p>
      `;

  document.body.appendChild(node);

  const closeButton = node.querySelector('.close-button');
  closeButton.addEventListener('click', function () {
    node.remove();
  });
}

// Function to filter nodes based on the input value
function searchNodes(searchInputVal, createPopUp) {

  let exactNode = gData.nodes.find((n) => n.screen_name == searchInputVal);

  const distance = 40;
  const distRatio = 1 + distance / Math.hypot(exactNode.x, exactNode.y, exactNode.z);

  const newPos = exactNode.x || exactNode.y || exactNode.z
    ? { x: exactNode.x * distRatio, y: exactNode.y * distRatio, z: exactNode.z * distRatio }
    : { x: 0, y: 0, z: distance }; // special case if node is in (0,0,0)

  Graph.cameraPosition(
    newPos, // new position
    exactNode, // lookAt ({ x, y, z })
    3000  // ms transition duration
  ); createFloatingBox(exactNode.name, exactNode.screen_name, exactNode.num_followers, exactNode.party)
  if (createPopUp) { createPopUpBox("Filtreler temizlendi") }
}


// Function to filter nodes based on the input value
function filterNodes(partyinputVal, minFinputVal, maxFinputVal, party, minF, maxF) {


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

  areNodesFiltered = true;
  Graph.graphData(filteredData);
}

// Event listener for the filter input submit button
const SearchSubmitBtn = document.getElementById("submit-search-btn");
SearchSubmitBtn.addEventListener("click", function (event) {
  event.preventDefault();

  let createPopUp = false;

  const searchInputVal = document.getElementById("search-inputBox").value;
  const searchInputValPresent = gData.nodes.find(n => n.screen_name == searchInputVal);

  if (searchInputVal != "" && searchInputValPresent != undefined) {

    if (areNodesFiltered) {

      const NodeAvailable = filteredNodes.find(n => n.screen_name == searchInputVal);

      if (NodeAvailable) {

      }
      else {
        console.log("Node not found")
        createPopUp = true;
        resetBtn.click();
      }
    }

    searchNodes(searchInputVal, createPopUp);
  }
  else { createPopUpBox("Aradığınız kriterlere uygun sonuç bulunamadı"); }
});


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

  areNodesFiltered = false;
  filteredNodes = gData.nodes;
  Graph.graphData(gData);
});
