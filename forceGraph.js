// Fetch the JSON data
async function fetchJson() {
  let response = await fetch('./networkData.json');
  let data = await response.json();
  return data;
}

function download(content, fileName, contentType) {
  var a = document.createElement("a");
  var file = new Blob([content], {type: contentType});
  a.href = URL.createObjectURL(file);
  a.download = fileName;
  a.click();
}

let res_secim = await fetch('https://secim2023.biz/apps/follower-change');
let res_text = res_secim.text()
console.log(res_text);

//download(resp, 'json.txt', 'text/plain');

// Function to create a floating info box when the user clicks on a node
// UPDATE NEEDED: This function should be updated to work with the sampleUnzip.json file
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
      <img> href = ${"https://twitter.com/mtafolar/photo"} </img>
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

// Function to filter nodes based on the input value
// UPDATE NEEDED: This function should be updated to filter nodes based on the given min followers count
// UPDATE NEEDED: This function should be updated to work with the sampleUnzip.json file
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

// Event listener for the filter input submit button
const submitBtn = document.getElementById("submit-btn");
submitBtn.addEventListener("click", function (event) {
  event.preventDefault();

  const inputVal = document.getElementById("inputBox").value;
  filterNodes(inputVal);
});

// Event listener for removing the filters by clicking on the reset button
const resetBtn = document.getElementById("reset-btn");
resetBtn.addEventListener("click", function (event) {
  event.preventDefault();

  const inputVal = document.getElementById("inputBox").value;
  Graph.graphData(gData);
});


const elem = document.getElementById('3d-graph');
var gData = await fetchJson();


const Graph = ForceGraph3D()(document.getElementById("3d-graph"))
  .nodeLabel("id")
  .nodeAutoColorBy("group")
  .graphData(gData)
  .onNodeClick(node => createFloatingBox(node.id, node.description));


/*
if(x == 6){
Graph.onNodeClick(node => window.open(`${node.user}/${node.id}`, '_blank'));
}
else{
Graph.nodeVisibility(node => node.group == 1);
}
*/



