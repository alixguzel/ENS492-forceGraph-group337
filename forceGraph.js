var inputBox = document.getElementById("inputBox");
var inputValue = inputBox.value;

console.log(inputValue);

const Graph = ForceGraph3D()
      (document.getElementById('3d-graph'))
        .jsonUrl('../Data/Sample/sampleUnzip.json')
        .nodeLabel('screen_name')
        .nodeAutoColorBy('followers_count')
        .onNodeClick(node => window.open(`https://twitter.com/${node.screen_name}`, '_blank'));