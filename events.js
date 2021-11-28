let eventsDebounceId = undefined
Array.from(document.getElementsByClassName('watch')).forEach(el => {
  ['keydown'].forEach(eventType => {
    el.addEventListener(eventType, () => {
      if (eventsDebounceId) window.clearTimeout(eventsDebounceId)
      eventsDebounceId = window.setTimeout(update, 500)
    })
  })
})


document.getElementById('load-sample-data-btn').addEventListener('click', () => {
  if (window.confirm('This action will erase current test. Are you sure?')) {
    loadSampleData()
    update()
  }
})

// generator

// let sweepTimeoutlId = undefined
document.getElementById('sweep-btn').addEventListener('click', () => {
  // TODO: rewrite using promises
  
  const postActions = (dataRowArr) => {
    let dataRow = new Date().toISOString().split('T')[1].replace('Z', ' ')
    dataRow += dataRowArr.toString()+','
    document.getElementById('input-data').value += dataRow+'\n'
    // console.log(dataRowArr)
    update()    
  }

  const cb = (dataRowArr) => {
    window.setTimeout(() => {

      postActions(dataRowArr)
      if (document.getElementById('interval-select').value !== 'Once') {
        sweeper(1, cb)
      } else {
        document.getElementById('sweep-btn').disabled = false
      }

    }, parseFloat(document.getElementById('interval-input').value)*1000)
  }
  
  if (document.getElementById('interval-select').value === 'Once') {
    sweeper(1, (dataRowArr) => {
      postActions(dataRowArr)
      document.getElementById('sweep-btn').disabled = false
    })
  } else {
    sweeper(1, cb)
  }

})


document.getElementById('remove-data-btn').addEventListener('click', (event) => {
  if (window.confirm('Are you sure?')) {
    const canvas = document.getElementById('full-spectogram')
    const context = canvas.getContext('2d')
    context.clearRect(0, 0, canvas.width, canvas.height)
    document.getElementById('input-data').value = ''
    update()
  }
})

