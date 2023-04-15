//const {dat} = require('dat.gui');
const gui = new dat.GUI();
const elem = document.getElementById('3d-graph');
var x = 6;
//var gData = JSON.parse(fs.readFileSync('./data.json'));



const Graph = ForceGraph3D()(elem)
  .backgroundColor("#000")
  .jsonUrl('./Data/Sample/Old/gephiExport.json')
  .nodeAutoColorBy("group")
  .nodeLabel(node => `${node.id}`)
  //.nodeVisibility(node => node.group == 1)
  .linkVisibility()

/*if(x == 6){
  Graph.onNodeClick(node => window.open(`${node.user}/${node.id}`, '_blank'));
}
else{
  Graph.nodeVisibility(node => node.group == 1);
}*/


var parameters = {
filter: 0
};
filterGroup = gui
.add(parameters, "filter")
.min(0)
.max(2)
.step(1)
.name("Filter group")
.listen();

filterGroup.onFinishChange((newValue) => {
// console.log(gData);
const filteredNodes = gData.nodes.filter((n) => n.group == newValue);
// console.log(filteredNodes);
const filteredNodesIds = [];
JSON.stringify(filteredNodes, (key, value) => {
if (key === "id") filteredNodesIds.push(value);
return value;
});
// console.log(filteredNodesIds);
const filteredLinks = gData.links.filter(
(e) =>
  filteredNodesIds.includes(e.source.id) &
  filteredNodesIds.includes(e.target.id)
);
// console.log(filteredLinks);
const filteredData = { nodes: filteredNodes, links: filteredLinks };
console.log(filteredData);
Graph.graphData(filteredData);
});