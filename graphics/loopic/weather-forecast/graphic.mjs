class Graphic extends HTMLElement {
  #iframe = null
  #stepCount = 1
  #currentStep = undefined

  constructor() {
    super()
    this.nrtState = {
      timestamp: 0,
      schedule: [],
    }
    this.nrtSimulation = []
  }

  connectedCallback() {}

  async load(params) {
    const iframe = document.createElement('iframe')
    iframe.width = '1920'
    iframe.height = '1080'
    iframe.style.border = 'none'
    this.appendChild(iframe)
    this.#iframe = iframe

    await new Promise((resolve, reject) => {
      iframe.addEventListener('load', () => {
        iframe.contentWindow.onReady(() => {
          resolve()
        })
      })
      iframe.addEventListener('error', reject)
      iframe.src = import.meta.resolve('./resources/index.html')
    })

    this.updateAction(params)

    return { statusCode: 200, statusMessage: 'OK' }
  }

  async dispose(_params) {
    this.innerHTML = ''
    this.#currentStep = undefined
  }

  checkIframe() {
    return !!(this.#iframe && this.#iframe.contentWindow)
  }

  async updateAction(params) {
    if (!this.checkIframe()) {
      return {
        statusCode: 500,
        statusMessage: 'Could not trigger update method, iframe is not accessible',
      }
    }

    this.#iframe.contentWindow.update(JSON.stringify(params.data))
    return { statusCode: 200, statusMessage: 'OK' }
  }

  getLoopic() {
    const loopic = this.#iframe.contentWindow.loopic
    if (!loopic) throw new Error('Loopic variable was not found on iframe contentWindow')
    return loopic
  }

  getUpdate() {
    const update = this.#iframe.contentWindow.update
    if (!update) throw new Error('Update variable was not found on iframe contentWindow')
    return update
  }

  getMainComposition() {
    const mainComposition = this.#iframe.contentWindow.mainComposition
    if (!mainComposition) throw new Error('Main composition variable was not found on iframe contentWindow')
    return mainComposition
  }

  checkNoAnimationMode(params) {
    const loopic = this.getLoopic()
    if (params.skipAnimation) {
      loopic.setNoAnimationMode(true)
    } else {
      loopic.setNoAnimationMode(false)
    }
  }

  async playAction(params) {
    if (!this.checkIframe()) {
      return {
        statusCode: 500,
        statusMessage: 'Could not trigger play method, iframe is not accessible',
      }
    }

    this.checkNoAnimationMode(params)

    if (this.#stepCount === 0) {
      this.#iframe.contentWindow.play()
      return { statusCode: 200, statusMessage: 'OK', currentStep: this.#currentStep }
    }

    const targetStep = this.#currentStep === undefined ? 0 : this.#currentStep + 1

    if (targetStep >= this.#stepCount) {
      return await this.stopAction(params)
    }

    this.#currentStep = targetStep
    this.#iframe.contentWindow.play()
    return { statusCode: 200, statusMessage: 'OK', currentStep: this.#currentStep }
  }

  async stopAction(params) {
    if (!this.checkIframe()) {
      return {
        statusCode: 500,
        statusMessage: 'Could not trigger stop method, iframe is not accessible',
      }
    }

    this.checkNoAnimationMode(params)

    if (this.#currentStep === undefined) {
      return { statusCode: 400, statusMessage: 'Bad request, graphic is not playing' }
    }

    this.#currentStep = undefined
    this.#iframe.contentWindow.stop()
    return { statusCode: 200, statusMessage: 'OK' }
  }

  async customAction(_params) {
    return { statusCode: 400, statusMessage: 'No custom actions supported' }
  }

  async setActionsSchedule(params) {
    const composition = this.getMainComposition()

    // Save schedule and convert timestamps to frames
    this.nrtState.schedule = params.schedule
      .map((item) => ({
        ...item,
        frame: this.timestampToFrame(item.timestamp, composition.fps),
      }))
      .sort((a, b) => a.timestamp - b.timestamp)

    await this.#runSimulator()
  }

  timestampToFrame(timestamp, fps) {
    return Math.floor(timestamp / (1000 / fps))
  }

  async goToTime(params) {
    this.nrtState.timestamp = params.timestamp

    const mainComposition = this.getMainComposition()
    const loopic = this.getLoopic()

    loopic.reset()
    mainComposition.reset()
    loopic.setSimulatorMode(true)

    const nrtFrame = this.timestampToFrame(params.timestamp, mainComposition.fps)

    const nrtSimulationFrame = this.nrtSimulation[nrtFrame]
      ? this.nrtSimulation[nrtFrame]
      : this.nrtSimulation[this.nrtSimulation.length - 1]
    if (!nrtSimulationFrame) return

    nrtSimulationFrame.compositions.forEach((compositionItem) => {
      compositionItem.composition.executeCompositionAction()
    })

    const scheduledItemsThatShouldBeExecuted = this.nrtState.schedule.filter((scheduled) => scheduled.frame <= nrtFrame)
    await this.#executeScheduledItems(scheduledItemsThatShouldBeExecuted)

    nrtSimulationFrame.compositions.forEach((compositionItem) => {
      compositionItem.composition.executeCompositionAction()
      compositionItem.composition.executeFrameActionsBeforeFrame(compositionItem.frame)
      compositionItem.composition.goTo(compositionItem.frame)
      if (compositionItem.isVisible) {
        compositionItem.composition.show()
      } else {
        compositionItem.composition.hide()
      }
    })

    loopic.setSimulatorMode(false)
    mainComposition.refreshRender()
  }

  #goToCurrentTimestamp() {
    this.goToTime({ timestamp: this.nrtState.timestamp })
  }

  #getLastScheduledAction() {
    const schedule = this.nrtState.schedule

    if (!Array.isArray(schedule) || schedule.length === 0) {
      return
    }

    return schedule.reduce((latest, item) => {
      return item.frame > latest.frame ? item : latest
    })
  }

  async #executeScheduledItems(scheduledItems) {
    scheduledItems.forEach(async (scheduledItem) => await this.#executeScheduledItem(scheduledItem))
  }

  async #executeScheduledItem(scheduledItem) {
    const loopic = this.getLoopic()
    const update = this.getUpdate()

    if (scheduledItem.action.type === 'playAction') {
      loopic.flags.play = true
      await loopic.firePlay()
      return
    }

    if (scheduledItem.action.type === 'stopAction') {
      loopic.flags.stop = true
      await loopic.fireStop()
      return
    }

    if (scheduledItem.action.type === 'updateAction') {
      const updateData = scheduledItem.action.params.data
      if (updateData) {
        update(updateData)
      }
      return
    }
  }

  async #runSimulator() {
    const mainComposition = this.getMainComposition()
    const loopic = this.getLoopic()
    const lastScheduledAction = this.#getLastScheduledAction()

    // Reset states
    mainComposition.reset()
    loopic.reset()
    loopic.setSimulatorMode(true)
    this.nrtSimulation = []

    // TODO: Make max duration configurable
    const MAX_DURATION = 10000

    // Start simulation
    mainComposition.executeCompositionAction()

    let frame = 0
    while (true) {
      if (frame > MAX_DURATION) {
        console.error(`Frame limit exceeded (${MAX_DURATION} frames)`)
        break
      }

      // If main or one of nested compositions is playing
      const thereIsSomethingPlaying = checkIfCompositionOrNestedCompositionPlaying(mainComposition)

      // Nothing is playing, and there are no future scheduled actions
      if (
        (lastScheduledAction === undefined && thereIsSomethingPlaying === false) ||
        (lastScheduledAction && frame > lastScheduledAction.frame && thereIsSomethingPlaying === false)
      ) {
        break
      }

      // Execute scheduled items
      const scheduledItems = this.nrtState.schedule.filter((item) => item.frame === frame)
      this.#executeScheduledItems(scheduledItems)

      // Tick main composition, which will tick all detached nested compositions
      await mainComposition.simulatorTick()

      // Write current simulation frame
      const currentNrtSimulationFrame = {
        compositions: [],
      }
      addCompositionToCurrentNrtSimulationFrame(currentNrtSimulationFrame, mainComposition, true)
      this.nrtSimulation.push(currentNrtSimulationFrame)

      frame++
    }

    // Reset states
    mainComposition.reset()
    loopic.reset()
    loopic.setSimulatorMode(false)

    // Render initial frame
    this.#goToCurrentTimestamp()
  }
}

function checkIfCompositionOrNestedCompositionPlaying(composition) {
  if (composition.isPlaying) {
    return true
  }

  for (const layer of composition.layers) {
    if (layer.element.type !== 'COMPOSITION') {
      continue
    }

    if (checkIfCompositionOrNestedCompositionPlaying(layer.element.composition)) {
      return true
    }
  }

  return false
}

function addCompositionToCurrentNrtSimulationFrame(currentNrtSimulationFrame, composition, detached) {
  if (detached) {
    currentNrtSimulationFrame.compositions.push({
      composition: composition,
      frame: composition.activeFrame,
      isVisible: composition.isVisible,
    })
  }

  composition.layers.forEach((layer) => {
    if (layer.element.type !== 'COMPOSITION') return
    addCompositionToCurrentNrtSimulationFrame(currentNrtSimulationFrame, layer.element.composition, layer.element.detachPlayhead)
  })
}

export default Graphic
