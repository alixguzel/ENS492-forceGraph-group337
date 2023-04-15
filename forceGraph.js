const Graph = ForceGraph3D()
      (document.getElementById('3d-graph'))
        .jsonUrl('../Data/sampleUnzip.json')
        .nodeLabel('screen_name')
        .nodeAutoColorBy('followers_count');