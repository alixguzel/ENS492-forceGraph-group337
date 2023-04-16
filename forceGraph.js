var inputBox = document.getElementById("inputBox");
var inputValue = inputBox.value;

console.log(inputValue);

const Graph = ForceGraph3D()
      (document.getElementById('3d-graph'))
        .jsonUrl('../networkData-test.json')
        .nodeLabel('screen_name')
        .nodeAutoColorBy('mean_bot_score')
        .onNodeClick(node => window.open(`https://twitter.com/${node.screen_name}`, '_blank'));