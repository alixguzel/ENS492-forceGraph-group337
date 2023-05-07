
const urlParams = new URLSearchParams(window.location.search);
const dataParams = urlParams.get('data');
console.log(dataParams);
console.log(typeof dataParams)


async function fetchJson() {
    if (dataParams == null){
      let response = await fetch('./data.json');
      let data = await response.json();
      return data;
    }
    let response = await fetch('./'+dataParams);
    let data = await response.json();
    return data;
}
function createCard() {
    // create card container
    const card = document.createElement('div');
    card.classList.add('card');
  
    // create row 1
    const row1 = document.createElement('div');
    row1.classList.add('row');
    const row1Title = document.createElement('h3');
    row1Title.innerText = 'Row 1';
    const row1Text = document.createElement('p');
    row1Text.innerText = 'This is the content of row 1';
    row1.appendChild(row1Title);
    row1.appendChild(row1Text);
    card.appendChild(row1);
    document.body.appendChild(card);
    return card;
}
let card  = createCard();

// add the card element to a container element in the DOM
const container = document.getElementById('card-container');
container.appendChild(card)

const elem = document.getElementById('3d-graph');

var gData = await fetchJson();
  

const Graph = ForceGraph3D()(document.getElementById("3d-graph"))
  .nodeLabel("id")
  .nodeAutoColorBy("group")
  .graphData(gData)
  .onNodeClick(node => window.open(container));
/*if(x == 6){
  Graph.onNodeClick(node => window.open(`${node.user}/${node.id}`, '_blank'));
}
else{
  Graph.nodeVisibility(node => node.group == 1);
}*/



function filterNodes(inputval){

    var filter_num  = parseInt(inputval);
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
const submitBtn = document.getElementById("submit-btn");
submitBtn.addEventListener("click", function(event) {
  event.preventDefault();
  
  const inputVal = document.getElementById("inputBox").value;
  filterNodes(inputVal);
});

const resetBtn = document.getElementById("reset-btn");
resetBtn.addEventListener("click", function(event) {
  event.preventDefault();
  
  Graph.graphData(gData);
});
