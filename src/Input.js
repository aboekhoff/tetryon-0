const { keys } = Object

class Button {
  constructor(name, which) {
    this.name = name
    this.which = which
    this.isDown = false
    this.wasDown = false
  }

  update(state) {
    this.wasDown = this.isDown
    this.isDown = state[this.which] 
  }

  get pressed() {
    return this.isDown && !this.wasDown
  }

  get released() {
    return !this.isDown && this.wasDown
  }
}

class GamepadButton {
  constructor(name, index, gpid, parent) {
    this.parent = parent
    this.name = name
    this.gpid = gpid
    this.index = index

    this.value = 0
    this.prevValue = 0

    this.isDown = false
    this.wasDown = false
  }

  update() {
    if (this.parent.gamepads == null) { return }
    const gp = this.parent.gamepads[this.gpid]
    if (gp == null) { return }

    this.prevValue = this.value
    this.wasDown = this.isDown

    this.isDown = gp.buttons[this.index].pressed
    this.value = gp.buttons[this.index].value
  }

  get pressed() {
    return this.isDown !== this.wasDown
  }
}

class Axis {
  constructor(name, index, gpid, parent) {
    this.parent = parent
    this.name = name
    this.gpid = gpid
    this.index = index

    this.value = 0
    this.prevValue = 0
  }

  update() {
    if (this.parent.gamepads == null) { return }
    const gp = this.parent.gamepads[this.gpid]
    if (gp == null) { return }
    
    this.prevValue = this.value
    this.value = gp.axes[this.index]
    this.delta = value - this.prevValue
  }
}

class Pointer {
  constructor(name) {
    this.name = name
    this.x = 0
    this.y = 0
    this.prevX = 0
    this.prevY = 0
  }

  update(state) {
    this.prevX = this.x
    this.prevY = this.y
    this.x = state.x
    this.y = state.y
  }

  moved() {
    return this.x !== this.prevX || this.y !== this.prevY
  }
}

class Input {
  constructor() {
    this.buttons = {}
    this.buttonNames = []

    this.pointers = {}
    this.pointerNames = []

    this.axes = {}
    this.axisNames = []

    this.gamepadButtons = {}
    this.gamepadButtonNames = []

    this.gamepads = null
    this.keyboard = {}
    this.mouse = {
      x: 0,
      y: 0,
      button1: false,
      button2: false,
      button3: false
    }
  }

  addCallbacks() {
    window.addEventListener('gamepadconnected', (e) => {
      console.log('gamepad connected ' + e.gamepad.index)
    })

    window.addEventListener('keydown', (e) => {
      this.keyboard[e.which] = true
    })

    window.addEventListener('keyup', (e) => {
      this.keyboard[e.which] = false
    })

    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX
      this.mouse.y = e.clientY
    })

    window.addEventListener('mousedown', (e) => {
      this.mouse.button1 = true
    })

    window.addEventListener('mouseup', (e) => {
      this.mouse.button1 = false
    })
  }

  update() {
    this.gamepads = navigator.getGamepads()

    this.updateButtons()
    this.updatePointers()

    if (this.gamepads) {
      this.updateAxes()
      this.updateGamepadButtons()
    }
  }

  updateAxes() {
    for (let i = 0; i < this.axisNames.length; i++) {
      const a = this.axes[this.axisNames[i]]
      a.update()
    }
  }

  updateGamepadButtons() {
    for (let i = 0; i < this.gamepadButtonNames.length; i++) {
      const b = this.gamepadButtons[this.gamepadButtonNames[i]]
      b.update()
    }
  }

  updateButtons() {
    for (let i = 0; i < this.buttonNames.length; i++) {
      const b = this.buttons[this.buttonNames[i]]
      b.update(this.keyboard)
    }
  }

  updatePointers() {
    for (let i = 0; i < this.pointerNames.length; i++) {
      const p = this.pointers[this.pointerNames[i]]
      p.update(this.mouse)
    }
  }

  addButton(name, which) {
    this.buttons[name] = new Button(name, which)
    this.buttonNames = keys(this.buttons)
    return this.buttons[name]
  }

  addPointer(name) {
    this.pointers[name] = new Pointer(name)
    this.pointerNames = keys(this.pointers)
    return this.pointers[name]
  }

  addAxis(name, index, gpid = (this.gamepads && this.length) || 0) {
    this.axes[name] = new Axis(name, index, gpid, this)
    this.axisNames = keys(this.axes)
    return this.axes[name]
  }

  addGamepadButton(name, index, gpid = (this.gamepads && this.length) || 0) {
    this.gamepadButtons[name] = new GamepadButton(name, index, gpid, this)
    this.gamepadButtonNames = keys(this.gamepadButtons)
    return this.gamepadButtons[name]
  }
}

const KEYS = {}

KEYS.CANCEL = 3;
KEYS.HELP = 6;
KEYS.BACK_SPACE = 8;
KEYS.TAB = 9;
KEYS.CLEAR = 12;
KEYS.RETURN = 13;
KEYS.ENTER = 14;
KEYS.SHIFT = 16;
KEYS.CONTROL = 17;
KEYS.ALT = 18;
KEYS.PAUSE = 19;
KEYS.CAPS_LOCK = 20;
KEYS.ESCAPE = 27;
KEYS.SPACE = 32;
KEYS.PAGE_UP = 33;
KEYS.PAGE_DOWN = 34;
KEYS.END = 35;
KEYS.HOME = 36;
KEYS.LEFT = 37;
KEYS.UP = 38;
KEYS.RIGHT = 39;
KEYS.DOWN = 40;
KEYS.PRINTSCREEN = 44;
KEYS.INSERT = 45;
KEYS.DELETE = 46;
KEYS[0] = 48;
KEYS[1] = 49;
KEYS[2] = 50;
KEYS[3] = 51;
KEYS[4] = 52;
KEYS[5] = 53;
KEYS[6] = 54;
KEYS[7] = 55;
KEYS[8] = 56;
KEYS[9] = 57;
KEYS.SEMICOLON = 59;
KEYS.EQUALS = 61;
KEYS.A = 65;
KEYS.B = 66;
KEYS.C = 67;
KEYS.D = 68;
KEYS.E = 69;
KEYS.F = 70;
KEYS.G = 71;
KEYS.H = 72;
KEYS.I = 73;
KEYS.J = 74;
KEYS.K = 75;
KEYS.L = 76;
KEYS.M = 77;
KEYS.N = 78;
KEYS.O = 79;
KEYS.P = 80;
KEYS.Q = 81;
KEYS.R = 82;
KEYS.S = 83;
KEYS.T = 84;
KEYS.U = 85;
KEYS.V = 86;
KEYS.W = 87;
KEYS.X = 88;
KEYS.Y = 89;
KEYS.Z = 90;
KEYS.CONTEXT_MENU = 93;
KEYS.NUMPAD0 = 96;
KEYS.NUMPAD1 = 97;
KEYS.NUMPAD2 = 98;
KEYS.NUMPAD3 = 99;
KEYS.NUMPAD4 = 100;
KEYS.NUMPAD5 = 101;
KEYS.NUMPAD6 = 102;
KEYS.NUMPAD7 = 103;
KEYS.NUMPAD8 = 104;
KEYS.NUMPAD9 = 105;
KEYS.MULTIPLY = 106;
KEYS.ADD = 107;
KEYS.SEPARATOR = 108;
KEYS.SUBTRACT = 109;
KEYS.DECIMAL = 110;
KEYS.DIVIDE = 111;
KEYS.F1 = 112;
KEYS.F2 = 113;
KEYS.F3 = 114;
KEYS.F4 = 115;
KEYS.F5 = 116;
KEYS.F6 = 117;
KEYS.F7 = 118;
KEYS.F8 = 119;
KEYS.F9 = 120;
KEYS.F10 = 121;
KEYS.F11 = 122;
KEYS.F12 = 123;
KEYS.F13 = 124;
KEYS.F14 = 125;
KEYS.F15 = 126;
KEYS.F16 = 127;
KEYS.F17 = 128;
KEYS.F18 = 129;
KEYS.F19 = 130;
KEYS.F20 = 131;
KEYS.F21 = 132;
KEYS.F22 = 133;
KEYS.F23 = 134;
KEYS.F24 = 135;
KEYS.NUM_LOCK = 144;
KEYS.SCROLL_LOCK = 145;
KEYS.COMMA = 188;
KEYS.PERIOD = 190;
KEYS.SLASH = 191;
KEYS.BACK_QUOTE = 192;
KEYS.OPEN_BRACKET = 219;
KEYS.BACK_SLASH = 220;
KEYS.CLOSE_BRACKET = 221;
KEYS.QUOTE = 222;
KEYS.META = 224;

export { Input, Button, Pointer, KEYS }