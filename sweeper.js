const sweeper = (stepMulti, mainCb, localStartFreq, localStopFreq) => {
  document.getElementById('sweep-btn').disabled = true
  var oscContext = new AudioContext()
  var osc = oscContext.createOscillator()
  var g = oscContext.createGain()
  osc.connect(g)
  g.connect(oscContext.destination)

  let freq
  const deltaFreq = STOP_FREQ - START_FREQ
  let N = Math.round(deltaFreq * 1/(STEP_FREQ * stepMulti))
  let dataRowArr = new Array(N).fill(0)
  // let counter
  
  const tick = (direction, cb) => {
    window.setTimeout(() => {
      document.getElementById('sweep-range-label').innerText = freq.toFixed(2) + ' Hz'
      // document.getElementById('sweep-range').value = freq
      if ((direction === 1 && freq >= (localStopFreq||STOP_FREQ)) || (direction === -1 && freq <= (localStartFreq||START_FREQ))) {
        cb()
        return
      }
      // console.log(argmax(DATA_ARRAY_ALT)/2048, freq)
      let maxValReal = parabolic(DATA_ARRAY_ALT, argmax(DATA_ARRAY_ALT))[1]
      let fixedMaxValReal = isNaN(maxValReal) ? max(DATA_ARRAY_ALT) : maxValReal

      // [22,24,26,28,30]
      // [0, 1, 2, 3, 4 ]

      // 26

      // 26 - 22 = 4

      // 4 / step = 2

      let counter = Math.round((freq - START_FREQ) / (STEP_FREQ * stepMulti))

      dataRowArr[counter] += fixedMaxValReal
      document.getElementById('argmax').innerText = fixedMaxValReal.toFixed(1)
      // counter += direction
      
      freq = freq + (STEP_FREQ * stepMulti) * direction
      osc.frequency.value = freq
      tick(direction, cb)
    }, 1)
  }
  


  window.setTimeout(() => {
    freq = (localStartFreq||START_FREQ)
    osc.frequency.value = freq
    osc.start(0)
    // counter = 0
    tick(1, () => {
      freq = (localStopFreq||STOP_FREQ)

      tick(-1, () => {
        osc.stop()
        if (mainCb) mainCb(dataRowArr)
      })
    })
  }, 200)
}