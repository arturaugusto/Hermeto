// const START_FREQ = 100
// const STOP_FREQ = 1200

// const START_FREQ = 200


const START_FREQ = 650
const STOP_FREQ = 800
const STEP_FREQ = 0.05
// const STEP_FREQ = 0.05


/**
 * 
 * Open tube formulas
 * 
 * l = v/f
 * L = l/4
 * 
 * when 
 * 
 * L = tube length
 * l = wave length
 * f = frequency
 * v = sound speed on air = 340 m/s
 * 
 * To find L (tube length):
 * 
 * L = (340/f)/4
 * 
 * 
 * 
 * 
 * 
 * 1 - 0
 * 2 - 5
 * 3 - 9
 * 4 - 12
 * 5 - 14
 * 6 - 16
 * 7 - 21
 * 
 * 
 * teste2.txt
 * 
 * 1 0
 * 2 5
 * 3 10
 * 4 15
 * 5 18
 * 6 23
 * 7 25
 * 8 29
 * 9 32
 * 10 35
*/


const winSize1 = 30 / STEP_FREQ
const winArgmax = function(arr) {
  // const winSize1 = 1000
  //const winSize1 = 50 / STEP_FREQ
  const winSize = winSize1 % 2 === 0 ? winSize1 : winSize1 + 1
  // console.log("winSize:" , winSize)
  // const winSize = 11
  // const winSize = 6
  const pad = (winSize-1)/2
  let maxVal = 0
  let maxValIndex = undefined
  for (let i = pad; i < arr.length-pad; i++) {
    let localMax = arr.slice(i-pad, i+pad).reduce((a, c) => a+c,0)/arr.length
    if (localMax > maxVal) {
      maxVal = localMax
      maxValIndex = i
    }
  }
  return maxValIndex
}      


let uplot1 = null


const update = (unit) => {
  const TEMP = 23
  // http://www.sengpielaudio.com/calculator-speedsound.htm
  const openTubeCm = f => ((331.3+(0.6 * TEMP))/f)/4*100


  document.getElementById('maxCm').innerText = (openTubeCm(START_FREQ).toFixed(3))
  document.getElementById('minCm').innerText = (openTubeCm(STOP_FREQ).toFixed(3))


  // parse data
  window.localStorage.setItem('bl-input-data', document.getElementById('input-data').value)
  let dataLines = document.getElementById('input-data').value.split('\n')

  let dataDates = dataLines.map(x => x.split(' ')[0])
  let dataValues = dataLines.map(x => x.split(' ')[1])

  let dataArr = dataValues
    .filter(Boolean)
    .map(x => x.split(',').filter(Boolean).map(parseFloat).filter(x => !isNaN(x))
  ).map(row => {
    let minVal = min(row)

    let rowShiftDown = row.map(x => x - minVal)        
    let maxVal = max(rowShiftDown)
    let res = rowShiftDown.map(x => (x / maxVal))
    res = res.map(x => Math.pow(x, 3))
    //.map(x => Math.pow(x, 30))//.map(x => 1-Math.abs(Math.log(x)))
    // console.log(res)
    return res

    // let deltaVal = maxVal - minVal
    
    // let powerRow = row.map(x => (x - minVal) / deltaVal)//.map(Math.log)//.map(x => Math.pow(x, 50))
    // return powerRow.map((x, i) => i === 0 ? x : x*0.6+powerRow[i-1]*0.4)
    // return row.map(x => x/maxVal)

  })
  
  // parse dates
  let today = new Date().toISOString().split('T')[0]
  let dates = dataDates.filter(Boolean).map(x => Date.parse(today+'T'+x+'Z')/1000)

  // set canvas size
  const canvas = document.getElementById('full-spectogram')
  canvas.width = dataArr[0].length-1
  canvas.height = dataArr.length


  canvas.addEventListener('mousemove', function(evt) {
    let rect = canvas.getBoundingClientRect();
    let coords = {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    }
  }, false)

  const ctx = canvas.getContext('2d')
  
  // process data
  const dataArrFlat = dataArr.flat()

  // set canvas pixels
  const canvasArr = new Uint8ClampedArray(dataArrFlat.length*4)
  for (let i = 0; i < canvasArr.length; i += 4) {
    let rgb = color(dataArrFlat[i/4])
    canvasArr[i + 0] = rgb[0] // R
    canvasArr[i + 1] = rgb[1] // G
    canvasArr[i + 2] = rgb[2] // B
    canvasArr[i + 3] = rgb[3] // A
  }

  // put image
  let imageData = new ImageData(canvasArr, dataArr[0].length)
  ctx.putImageData(imageData, 0, 0)  
  
  const yValues = dataArr.map(winArgmax)

  ctx.fillStyle = "#00ff00"
  yValues.forEach((x, y0) => {
    ctx.rect(x-1, y0, 3, 1)

    //ctx.rect(x - Math.round(winSize1/2), y0, winSize1, 1)
  })
  ctx.fill()
  

  let q = [Array.from(document.getElementsByClassName('cf-hz')),Array.from(document.getElementsByClassName('cf-ml'))]

  let dataToFit = q[0].map((x, i) =>[parseFloat(q[0][i].value),parseFloat(q[1][i].value)])

  let reg = regression.linear(dataToFit, {precision: 3})
  console.log(reg)

  const yValuesMl = yValues
    .map(x => (x*STEP_FREQ)+START_FREQ)
    .map(reg.predict)
    .map(x => x[1])
  console.log(yValuesMl)
    
  // const yValuesCm = dataArr
  //   .map(winArgmax)
  //   .map(x => (x*STEP_FREQ)+START_FREQ)
  //   .map(openTubeCm)
  

  // plot
  let adjustedValues = yValuesMl

  let xValues = dates//.map((x, i) => i)

  if (!uplot1) {
    uplot1 = new uPlot(
      {
        title: 'Chart',
        // tzDate: ts => uPlot.tzDate(new Date(ts * 1e3), tz),
        width: 600,
        height: 300,
        axes: [
          {
            label: "date",
            stroke: "#c7d0d9",
            grid: {
              width: 1 / devicePixelRatio,
              stroke: "#2c3235",
            },
            ticks: {
              width: 1 / devicePixelRatio,
              stroke: "#2c3235",
            }
          },
          {
            label: "ml",
            stroke: "#c7d0d9",
            grid: {
              width: 1 / devicePixelRatio,
              stroke: "#2c3235",
            },
            ticks: {
              width: 1 / devicePixelRatio,
              stroke: "#2c3235",
            }
          },
        ],
        series: [
          {},
          {
            label: "Data",
            stroke: "red",
          },
        ],
      },
      [xValues, adjustedValues],
      document.getElementById('plot')
    )
    
    window.addEventListener('resize', e => {
      uplot1.setSize(getSize())
      let intendedWidth = document.querySelector('.wrapper').clientWidth
      let visualizerCanvas = document.querySelector('.visualizer');
      visualizerCanvas.setAttribute('width', intendedWidth)
    })

  } else {
    uplot1.setData([xValues, adjustedValues])
  }
  uplot1.setSize(getSize())
}

// restore local storage data
let localStorageBlInputData = window.localStorage.getItem('bl-input-data')
if (localStorageBlInputData) {
  document.getElementById('input-data').value = localStorageBlInputData
}

update()



function relMouseCoords(event){

  const rect = event.target.getBoundingClientRect()
  const x = event.offsetX || event.layerX
  const y = event.offsetY || event.layerY
  // console.log((x*STEP_FREQ)+START_FREQ)
  // console.log("x: " + x + " y: " + y)
  const index = Math.round(x/event.target.offsetWidth*event.target.width)
  const freq = (index*STEP_FREQ)+START_FREQ
  document.getElementById('cursor-freq').innerText = freq.toFixed(2) + ' Hz'
}


['mousemove'].forEach(item => {
  document.getElementById('full-spectogram').addEventListener(item, (evt) => relMouseCoords(evt));
})
