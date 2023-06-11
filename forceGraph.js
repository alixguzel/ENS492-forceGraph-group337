// Description: This file contains the code for the 3D force graph.

// This boolean variable is used to check if the nodes are filtered or not.
// It is used to determine whether to reset the graph or not.
// More details can be found in the resetGraph() function.
let areNodesFiltered = false;

const urlParams = new URLSearchParams(window.location.search);
const dataParams = urlParams.get("data");

// This function is used for URL parameters and fetching the data from the JSON file.
// If the URL data parameter is not specified, the default JSON file is used.
// Otherwise, the JSON file specified in the URL is used.
async function fetchJson() {
  if (dataParams == null) {
    let response = await fetch("./politicianNodes_S3DForce.json");
    let data = await response.json();
    return data;
  }
  let response = await fetch("./" + dataParams);
  let data = await response.json();
  return data;
}

// The data is fetched from the JSON file and saved in the gData variable.
// A seperate variable is used to store the filtered nodes in case of filtering.
var gData = await fetchJson();
var filteredNodes = gData.nodes;

function borderPercentile(maxVal,data){
  let p = parseInt(maxVal);
  data.sort((a, b) => a.num_followers - b.num_followers);

  // Calculate the index of the node representing the percentile
  const index = parseInt(Math.floor(data.length * p) /100) - 1

  // Retrieve the node at the calculated index
  const percentileNode = data[index];

  return percentileNode;
}


// Cross-link node objects
// This is used for highlighting the nodes and links when the user hovers over them.
// It is also used for the click event on the nodes.
gData.links.forEach((link) => {
  const a = gData.nodes.find((node) => node.id === link.source);
  const b = gData.nodes.find((node) => node.id === link.target);
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
const highlightNodes_click = new Set();
const highlightLinks_click = new Set();
let hoverNode = null;

// This is the main part of the graph.
// It is used to create the graph and set the properties of the nodes and links.
// It also contains the functions for the click and hover events.
const Graph = ForceGraph3D()(document.getElementById("3d-graph"))
  .graphData(gData)
  .nodeLabel("screen_name")
  // nodeVal is used to determine the size of the nodes.
  .nodeVal((node) => node.num_followers/20)
  // You can use the following line instead of the above line to use a logarithmic scale for the node sizes.
  //.nodeVal((node) => 5000 * Math.log10(node.num_followers))
  .nodeOpacity(1)
  .linkWidth((link) =>
    highlightLinks.has(link) || highlightLinks_click.has(link) ? 10 : 5
  )
  .linkDirectionalParticles((link) =>
    highlightLinks.has(link) || highlightLinks_click.has(link) ? 4 : 0
  )
  .linkDirectionalParticleWidth(4)
  // nodeColor is used to determine the color of the nodes.
  // The colors are determined according to the party of the politician.
  .nodeColor((node) => {
    if (node.party == "CHP") {
      return "red";
    } else if (node.party == "AKP") {
      return "yellow";
    } else if (node.party == "MHP") {
      return "white";
    } else if (node.party == "HDP") {
      return "green";
    } else if (node.party == "IYI" || node.party == "İYİ") {
      return "aqua";
    } else if (node.party == "DEVA") {
      return "dodgerblue";
    } else if (node.party == "SAADET") {
      return "indianred";
    } else if (node.party == "GELECEK") {
      return "orange";
    } else if (node.party == "DP") {
      return "maroon";
    } else if (node.party == "TIP" || node.party == "TİP") {
      return "darkred";
    } else if (node.party == "BBP") {
      return "pink";
    } else if (node.party == "ZAFER") {
      return "brown";
    } else {
      return "gray";
    }
  })
  // linkVisibility is used to determine the visibility of the links.
  // The links are visible if the nodes are interacted
  .linkVisibility((link) =>
    highlightLinks.has(link) || highlightLinks_click.has(link) ? true : false
  )
  .onNodeClick((node) => {
    // Aim at node from outside it
    // This is used to zoom in on the node when it is clicked.
    const distance = 3500;
    const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);

    const newPos =
      node.x || node.y || node.z
        ? {
          x: node.x * distRatio,
          y: node.y * distRatio,
          z: node.z * distRatio,
        }
        : { x: 0, y: 0, z: distance }; // special case if node is in (0,0,0)

    Graph.cameraPosition(
      newPos, // new position
      node, // lookAt ({ x, y, z })
      3000 // ms transition duration
    );
    // This is used to create the floating box when the node is clicked.
    // Floating box contains the information about the politician.
    // It also contains the Twitter widget.
    createFloatingBox(
      node.name,
      node.screen_name,
      node.num_followers,
      node.party,
      node.Url,
      node.num_following
    );
    // This is used to highlight the nodes and links when the user clicks on them.
    clickHighlight(node);
  })
  .onNodeHover((node) => {
    // no state change
    if ((!node && !highlightNodes.size) || (node && hoverNode === node)) return;

    // This is used to highlight the nodes and links when the user hovers over them.
    highlightNodes.clear();
    highlightLinks.clear();
    if (node) {
      highlightNodes.add(node);
      node.neighbors.forEach((neighbor) => highlightNodes.add(neighbor));
      node.links.forEach((link) => highlightLinks.add(link));
    }

    hoverNode = node || null;

    updateHighlight();
  })
  .onLinkHover((link) => {
    highlightNodes.clear();
    highlightLinks.clear();

    if (link) {
      highlightLinks.add(link);
      highlightNodes.add(link.source);
      highlightNodes.add(link.target);
    }

    updateHighlight();
  });

// This is used to update highlight status
function updateHighlight() {
  // trigger update of highlighted objects in scene
  Graph.nodeColor(Graph.nodeColor())
    .linkWidth(Graph.linkWidth())
    .linkDirectionalParticles(Graph.linkDirectionalParticles());
}

function clickHighlight(node) {
  highlightNodes_click.clear();
  highlightLinks_click.clear();
  if (node) {
    highlightNodes_click.add(node);
    node.neighbors.forEach((neighbor) => highlightNodes_click.add(neighbor));
    node.links.forEach((link) => highlightLinks_click.add(link));
  }
  updateHighlightClick();
}

function updateHighlightClick() {
  // trigger update of highlighted objects in scene
  Graph.nodeColor(Graph.nodeColor())
    .linkWidth(Graph.linkWidth())
    .linkDirectionalParticles(Graph.linkDirectionalParticles());
}
// This is used to create the floating box when the node is clicked.
// Floating box contains the information about the politician.
// It also contains the Twitter widget.
function createFloatingBox(
  name,
  screen_name,
  num_followers,
  party,
  Url,
  num_following
) {
  var floatingBox = document.querySelector(".floating-box-two");

  if (floatingBox) {
    floatingBox.remove();
  }

  const imageUrl = Url !== "null" ? Url : "ppp.jpg";

  const node = document.createElement("div");
  node.classList.add("floating-box-two");
  // This is the code for the floating box.
  node.innerHTML = `
  <div class="card" style = "position: fixed; top: 10px; right: 10px; background-image: linear-gradient(to bottom right, #ffffff, #ffffff); padding: 0px; border-radius: 20px; box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1); width: 350px; height: 640px; display: flex; flex-direction: column;">
    <div class="card-body">
        <button type="button" class="btn-close rounded-circle close-button" aria-label="Close" style="float:right;"></button>
        <h5 class="card-title text-center">${name}</h5>
        <div class="container-fluid bg-light rounded-3 pt-2 mt-2 mb-0 ml-2 mr-2 text-center">
            <div class="row align-items-start">
                <div class="col-sm-4">
                    <div>
                        <h6 class="fw-bold fs-12 mb-0">Parti</h6>
                        <p class="fs-14">${party}</p>
                    </div>
                </div>
                <div class="col-sm-4">
                    <div>
                        <h6 class="fw-bold fs-12 mb-0">Takipçiler</h6>
                        <p class="fs-14">${num_followers}</p>
                    </div>
                </div>
                <div class="col-sm-4">
                    <div>
                        <h6 class="fw-bold fs-12 mb-0">Takip Edilenler</h6>
                        <p class="fs-14">${num_following}</p>
                    </div>
                </div>
            </div>
        </div>
        <button class="btn btn-primary twitter-btn" onclick="window.open('https://twitter.com/${screen_name}', '_blank')" style="width: 100%; margin-bottom: 8px;"> Twitter'a Git</button>
        <div class="info-background">
            <div class="info-container">
                <div class="followers-info">
                </div>
                <div class="followers-info">
                </div>
                <div class="party-info">
                </div>
            </div>
        </div>

        <div id="timelineContainer">
            <a class="twitter-timeline" data-width="450" data-height="450" href="https://twitter.com/${screen_name}">Tweets by ${screen_name}</a> 
        </div> 
    </div> 
</div> 


  
`;

  // Calculate and update the card's height based on the timeline element's height
  window.addEventListener("DOMContentLoaded", () => {
    const timelineContainer = document.getElementById("timelineContainer");
    const timelineElement =
      timelineContainer.querySelector(".twitter-timeline");
    timelineElement.addEventListener("load", () => {
      const timelineHeight = timelineElement.offsetHeight;
      const cardBody = timelineContainer.closest(".card-body");
      const card = cardBody.closest(".card");
      const currentCardHeight = card.offsetHeight;
      const newCardHeight = currentCardHeight + timelineHeight;
      card.style.height = `${newCardHeight}px`;
    });
  });

  document.body.appendChild(node);
  twttr.widgets.load();

  // This is the code for the close button.
  const closeButton = node.querySelector(".close-button");
  closeButton.addEventListener("click", function () {
    node.remove();
    highlightNodes_click.clear();
    highlightLinks_click.clear();
  });
}

// This is used for creating the pop up box for notfications.
function createPopUpBox(textInput) {
  var floatingPopUpBox = document.querySelector(".floating-box-popUp");

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

  const closeButton = node.querySelector(".close-button");
  closeButton.addEventListener("click", function () {
    node.remove();
  });
}

// This function is used to determine the position of the selected node.
// It is used in the name selection bar.
function searchNodes(searchInputVal, createPopUp) {
  let exactNode = gData.nodes.find((n) => n.name == searchInputVal);

  const distance = 3500;
  const distRatio =
    1 + distance / Math.hypot(exactNode.x, exactNode.y, exactNode.z);

  const newPos =
    exactNode.x || exactNode.y || exactNode.z
      ? {
        x: exactNode.x * distRatio,
        y: exactNode.y * distRatio,
        z: exactNode.z * distRatio,
      }
      : { x: 0, y: 0, z: distance }; // special case if node is in (0,0,0)

  Graph.cameraPosition(
    newPos, // new position
    exactNode, // lookAt ({ x, y, z })
    3000 // ms transition duration
  );
  // A floating box is created for the selected node.
  createFloatingBox(
    exactNode.name,
    exactNode.screen_name,
    exactNode.num_followers,
    exactNode.party,
    exactNode.Url,
    exactNode.num_following
  );
  if (createPopUp) {
    createPopUpBox("Filtreler temizlendi");
  }
}

// Function to filter nodes based on the input value
// You can apply multiple filters at the same time.
function filterNodes(
  partyinputVal,
  minFinputVal,

  party,
  minF,
) {
  // Filtered nodes array is resetted so that the filters can be applied again.
  resetBtn.click();

  // Code for filtering nodes percentage wise based on the percentage input value.
  let border;
  if (minF){
    border = borderPercentile(minFinputVal,filteredNodes);
  }

  if (party) {
    if (partyinputVal != "HEPSİ"){
      filteredNodes = filteredNodes.filter((n) => n.party == partyinputVal);
    }
  }
  if (minF) {
    if(minFinputVal != 100){
    filteredNodes = filteredNodes.filter(
      // Filtered nodes are the ones that have less (or equal) followers than the border node.
      (n) => n.num_followers <= border.num_followers
    );
    }
  }

  const filteredNodesIds = [];

  // Filtered nodes' ids are added to an array
  filteredNodes.forEach((node) => {
    filteredNodesIds.push(node.id);
  });

  // Filtered links are created based on the filtered nodes' ids.
  const filteredLinks = gData.links.filter(
    (e) =>
      filteredNodesIds.includes(e.source.id) &&
      filteredNodesIds.includes(e.target.id)
  );
  
  // Filtered data is created and applied to the graph.
  const filteredData = { nodes: filteredNodes, links: filteredLinks };

  areNodesFiltered = true;
  Graph.graphData(filteredData);
}

// Event listener for the search input submit button
const SearchSubmitBtn = document.getElementById("submit-search-btn");
SearchSubmitBtn.addEventListener("click", function (event) {
  event.preventDefault();

  let createPopUp = false;

  const searchInputVal = document.getElementById("user-select").value;
  const searchInputValPresent = gData.nodes.find(
    (n) => n.name == searchInputVal
  );

  if (searchInputVal != "" && searchInputValPresent != undefined) {
    if (areNodesFiltered) {
      const NodeAvailable = filteredNodes.find(
        (n) => n.name == searchInputVal
      );

      if (NodeAvailable) {
      } else {
        console.log("Node not found");
        createPopUp = true;
        resetBtn.click();
      }
    }

    searchNodes(searchInputVal, createPopUp);
  } else {
    createPopUpBox("Aradığınız kriterlere uygun sonuç bulunamadı");
  }
});

// Event listener for the filter input submit button
const submitBtn = document.getElementById("submit-btn");
submitBtn.addEventListener("click", function (event) {
  event.preventDefault();

  let party,
    minF = false;

  const partyinputVal = document.getElementById("party-inputBox").value;
  const minFinputVal = document.getElementById("minF-inputBox").value;


  if (partyinputVal != "") {
    party = true;
  }
  if (minFinputVal != "") {
    minF = true;
  }


  filterNodes(partyinputVal, minFinputVal,  party, minF);
});

// Event listener for removing the filters by clicking on the reset button
const resetBtn = document.getElementById("reset-btn");
resetBtn.addEventListener("click", function (event) {
  event.preventDefault();

  areNodesFiltered = false;
  filteredNodes = gData.nodes;
  Graph.graphData(gData);
});
