var region_data;
const scaler = 4000;

function preload() {
  region_data = new Promise(async (resolve, reject) => {
    let data = await fetch("data/regmm.geojson");
    let meta = await data.json();
    const region_polygons = {};
    result = meta.features.map((e) => {
      let allcoords = [];
      e.geometry.coordinates.forEach((e) => {
        const sub = e[0];
        allcoords = [...allcoords, ...sub];
      });
      return {
        name: e.properties.Nom_Region,
        Xmin: e.properties.Xmin / scaler,
        Xmax: e.properties.Xmax / scaler,
        Ymin: e.properties.Ymin / scaler,
        Ymax: e.properties.Ymax / scaler,
        polygons: e.geometry.coordinates,
        color: color(getC(), getC(), getC())
      };
    });
    resolve(result);
  });
}

var data;
var borders = [];
async function setup() {
  data = await region_data;
  console.log(data);
  createCanvas(800, 800);
}

function extractSequences(region) {
  let border;
  let coordinates = region.polygons.map((e) => {
    border = {
      minX: e[0][0][0] / scaler,
      minY: e[0][0][1] / scaler,
      maxX:e[0][0][0] / scaler,
      maxY:e[0][0][1] / scaler,
    }

    let maped = e[0].map((c) => {
      let point = { x: c[0] / scaler, y: c[1] / scaler }
      border.minX = border.minX > point.x ? point.x : border.minX
      border.minY = border.minY > point.y ? point.y : border.minY
      border.maxX = border.maxX < point.x ? point.x : border.maxX
      border.maxY = border.maxY < point.y ? point.y: border.maxY
      return point;
    });

    return maped;
  });
  borders.push(border);
  let double_b  = Object.assign({}, border);
  double_b.minX = double_b.minX + 100;
  double_b.maxX = double_b.maxX + 100;
  // borders.push(double_b)
  return coordinates;
}

function drawSequence(sequence) {
  sequence.forEach((p, i) => {
    let previous_p = sequence[i - 1] ? sequence[i - 1] : p;
    line(p.x, p.y, previous_p.x, previous_p.y);
  });
}

function getC(salt) {
  return Math.floor(Math.random()*255);
}
function setRandomColor(opacity) {
  fill(getC(), getC(), getC(), opacity);
}

function setRandomStroke(salt) {
  stroke(getC(salt), getC(salt), getC(salt));
}

function startNode(tree) {
  console.log("test",tree)
  const nodes = tree.data.children;
  // DRAW CCHILDREN TREE
  newcolor = [getC(), getC(), getC()]
  drawBranch(nodes, 0)
  // DRAW FIRST NODE
}

function setDepthColor(depth){
  stroke(sin(depth)*255, cos(depth)*255, cos(depth+100)*255);
}

// let counter = 0;
// let depth = 0;
// async function drawBranch(nodes, color) {
//   nodes.forEach((k,i) => {
//     if(counter < 100) {
//       console.log(i)
//       strokeWeight(1)
//       rectMode(CORNERS)
//       fill(255,0,0, 0);
//       strokeWeight(2)
//       stroke(color[0], color[1], color[2])
//       rect(k.minX, k.minY, k.maxX, k.maxY)
//       counter++
//       if(k.children) {
//         newcolor = [getC(), getC(), getC()]
//         drawBranch(k.children, newcolor)
//       }
//     }
//   })
// }


let counter = 0;
let layer_colors = {}
async function drawBranch(nodes, depth) {
  nodes.forEach((k,i) => {
    if(counter < 100) {
      if(!layer_colors[depth]) layer_colors[depth] = [getC(), getC(), getC()]
      color = layer_colors[depth];
      console.log(i, color)
      strokeWeight(1)
      rectMode(CORNERS)
      strokeWeight(2 - depth/1.5)
      fill(color[0], color[1], color[2], 100)
      rect(k.minX, k.minY, k.maxX, k.maxY)
      if(k.children) {
        drawBranch(k.children, depth+1)
      }
    }
  })
}

function drawBox() {}

var drawed = false;
function draw() {
  scale(1, -1);
  translate(300, -height + 400);
  let boxes = [];
  if (data && !drawed) {
    data.forEach((region) => {
      // Draw Borders
      sequences = extractSequences(region);
      sequences.forEach((sequence) => {
        drawSequence(sequence);
      });

      // Draw Boxes
    });


    var tree = new rbush(2);
    borders = borders.map(e => {
      let newe = e;
      newe.item = true;
      return newe
    })
    
    tree.load(borders);
    startNode(tree);

        
    // borders.forEach(border => {
    //   rectMode(CORNERS)
    //   strokeWeight(1)
    //   fill(255,0,0, 0);
    //   stroke(color(0, 255, 100))
    //   rect(border.minX, border.minY, border.maxX, border.maxY)
    // })
    drawed = true;
  }
}

function rescaleToScreen(value) {
  const MAX_THEORIC = 400000;
  const SCALE = 500;
  return (value / MAX_THEORIC) * SCALE;
}
