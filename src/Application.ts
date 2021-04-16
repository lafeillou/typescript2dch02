import { vec2 } from "./math2d";

interface EventListenerObject {
  handleEvent(evt: Event): void;
}

export class CanvasInputEvent {
  // 分别用来指示Alt / Ctrl / Shift键是否被按下
  public altKey: boolean;
  public ctrlKey: boolean;
  public shiftKey: boolean;
  public type: EInputEventType;

  public constructor(
    altkey: boolean = false,
    ctrlKey: boolean = false,
    shiftKey: boolean = false,
    type: EInputEventType = EInputEventType.MOUSEEVENT
  ) {
    this.altKey = altkey;
    this.ctrlKey = ctrlKey;
    this.shiftKey = shiftKey;
    this.type = type;
  }
}

export enum EInputEventType {
  MOUSEEVENT,
  MOUSEDOWN,
  MOUSEUP,
  MOUSEMOVE,
  MOUSEDRAG,
  KEYBOARDEVENT,
  KEYUP,
  KEYDOWN,
  KEYPRESS,
}

export class CanvasMouseEvent extends CanvasInputEvent {
  public button: number;
  public canvasPostion: vec2;
  public localPostion: vec2;
  public constructor(
    canvasPos: vec2,
    button: number,
    altKey: boolean = false,
    ctrlKey: boolean = false,
    shiftKey: boolean = false
  ) {
    super(altKey, ctrlKey, shiftKey);
    this.canvasPostion = canvasPos;
    this.button = button;
    this.localPostion = vec2.create();
  }
}

export class CanvasKeyBoardEvent extends CanvasInputEvent {
  public key: string;
  public keyCode: number;
  // 当按下键时，是否不停地触发事件
  public repeat: boolean;
  public constructor(
    key: string,
    keyCode: number,
    repeat: boolean,
    altKey: boolean = false,
    ctrlKey: boolean = false,
    shiftKey: boolean = false
  ) {
    super(altKey, ctrlKey, shiftKey, EInputEventType.KEYBOARDEVENT);
    this.key = key;
    this.keyCode = keyCode;
    this.repeat = repeat;
  }
}

export class Application implements EventListenerObject {
  public canvas: HTMLCanvasElement;

  // 开关变量，设置为ture则每次鼠标移动都会触发mousemove事件
  public isSupportMouseMove: boolean;
  // 当前鼠标是否为按下状态
  protected _isMouseDown: boolean;

  protected _start: boolean = false;
  protected _requestId: number = -1;
  protected _lastTime!: number;
  protected _startTime!: number;

  public constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.canvas.addEventListener("mousedown", this, false);
    this.canvas.addEventListener("mouseup", this, false);
    this.canvas.addEventListener("mousemove", this, false);

    // 键盘事件不能在canvas中触发，但是能在全局的window对象中触发
    window.addEventListener("keydown", this, false);
    window.addEventListener("keyup", this, false);
    window.addEventListener("keypress", this, false);

    // 初始化时 _isMouseDown为false
    this._isMouseDown = false;
    this.isSupportMouseMove = false;
  }
  // 启动
  public start(): void {
    if (!this._start) {
      this._start = true;
      this._lastTime = -1;
      this._startTime = -1;
      this._requestId = requestAnimationFrame((elapsedMsec: number): void => {
        this.step(elapsedMsec);
      });
    }
  }

  // 终止
  public stop(): void {
    if (this._start) {
      console.log(123);
      window.cancelAnimationFrame(this._requestId);
      this._requestId = -1;
      this._lastTime = -1;
      this._startTime = -1;
      this._start = false;
    }
  }
  // 检查是否处于动画循环状态
  public isRunning(): boolean {
    return this._start;
  }

  protected step(timeStamp: number): void {
    if (this._startTime === -1) {
      this._startTime = timeStamp;
    }

    if (this._lastTime === -1) {
      this._lastTime = timeStamp;
    }

    let elapsedMsec: number = timeStamp - this._startTime;
    let intervalSec: number = (timeStamp - this._lastTime) / 1000.0;
    this._lastTime = timeStamp;

    console.log(`elapsedTime = ${elapsedMsec}  intervalSec = ${intervalSec}`);
    this.update(elapsedMsec, intervalSec);
    this.render();
    this._requestId = requestAnimationFrame((elapsedMsec: number): void => {
      this.step(elapsedMsec);
    });
  }

  // 虚方法
  public update(elapsedMsec: number, intevalsec: number): void {}

  // 虚方法
  public render(): void {}

  // 坐标转换方法
  private _viewportToCanvasCoordinate(evt: MouseEvent): vec2 {
    if (this.canvas) {
      let rect: ClientRect = this.canvas.getBoundingClientRect();

      if (evt.type === "mousedown") {
        console.log(`boundingClientRect: ${JSON.stringify(rect)}`);
        console.log(`clientX: ${evt.clientX} clientY: ${evt.clientY}`);
      }

      if (evt.target) {
        let borderLeftWidth: number = 0;
        let borderTopWidth: number = 0;
        let paddingLeft: number = 0;
        let paddingTop: number = 0;
        let decl: CSSStyleDeclaration = window.getComputedStyle(
          evt.target as HTMLElement
        );
        let strNumber: string | null = decl.borderLeftWidth;

        if (strNumber !== null) {
          borderLeftWidth = parseInt(strNumber, 10);
        }
        strNumber = decl.borderTopWidth;
        if (strNumber !== null) {
          borderTopWidth = parseInt(strNumber, 10);
        }
        strNumber = decl.paddingLeft;
        if (strNumber !== null) {
          paddingLeft = parseInt(strNumber, 10);
        }
        strNumber = decl.paddingTop;
        if (strNumber !== null) {
          paddingTop = parseInt(strNumber, 10);
        }

        let x: number = evt.clientX - rect.left - borderLeftWidth - paddingLeft;
        let y: number = evt.clientY - rect.top - borderTopWidth - paddingTop;
        let pos: vec2 = vec2.create(x, y);

        if (evt.type === "mousedown") {
          console.log(
            `borderLeftWidth: ${borderLeftWidth} borderTopWidth: ${borderTopWidth}`
          );
          console.log(`paddingLeft: ${paddingLeft} paddingTop: ${paddingTop}`);
          console.log(`变换后的canvasPosition: ${pos.toString()}`);
        }
        return pos;
      }
      alert(`evt.target为null`);
      throw new Error("evt.target为 null");
    }
    alert("canvas为null");
    throw new Error("canvas为null");
  }

  // 原生事件对象 转换为 自定义事件对象
  private _toCanvasMouseEvent(evt: Event): CanvasMouseEvent {
    let event: MouseEvent = evt as MouseEvent;
    let mousePosition: vec2 = this._viewportToCanvasCoordinate(event);
    let canvasMouseEvent: CanvasMouseEvent = new CanvasMouseEvent(
      mousePosition,
      event.button,
      event.altKey,
      event.ctrlKey,
      event.shiftKey
    );
    return canvasMouseEvent;
  }

  private _toCanvasKeyBoardEvent(evt: Event): CanvasKeyBoardEvent {
    let event: KeyboardEvent = evt as KeyboardEvent; // 这句语法如何理解
    let canvasKeyboardEvent: CanvasKeyBoardEvent = new CanvasKeyBoardEvent(
      event.key,
      event.keyCode,
      event.repeat,
      event.altKey,
      event.ctrlKey,
      event.shiftKey
    );
    return canvasKeyboardEvent;
  }
  protected dispatchMouseDown(event: CanvasMouseEvent) {}
  protected dispatchMouseUp(event: CanvasMouseEvent) {}
  protected dispatchMouseMove(event: CanvasMouseEvent) {}
  protected dispatchMouseDrag(event: CanvasMouseEvent) {}
  protected dispatchKeyPress(event: CanvasKeyBoardEvent) {}
  protected dispatchKeyDown(event: CanvasKeyBoardEvent) {}
  protected dispatchKeyUp(event: CanvasKeyBoardEvent) {}

  public handleEvent(evt: Event): void {
    switch (evt.type) {
      case "mousedown":
        this._isMouseDown = true;
        this.dispatchMouseDown(this._toCanvasMouseEvent(evt));
        break;
      case "mouseup":
        this._isMouseDown = false;
        this.dispatchMouseUp(this._toCanvasMouseEvent(evt));
        break;
      case "mousemove":
        if (this.isSupportMouseMove) {
          this.dispatchMouseMove(this._toCanvasMouseEvent(evt));
        }
        // 当前鼠标任意一个键处于按下状态并拖动时，触发drag事件
        if (this._isMouseDown) {
          this.dispatchMouseDrag(this._toCanvasMouseEvent(evt));
        }
        break;
      case "keypress":
        this.dispatchKeyPress(this._toCanvasKeyBoardEvent(evt));
        break;
      case "keydown":
        this.dispatchKeyDown(this._toCanvasKeyBoardEvent(evt));
        break;
      case "keyup":
        this.dispatchKeyUp(this._toCanvasKeyBoardEvent(evt));
        break;
    }
  }
}

export class Canvas2DApplication extends Application {
  public context2D: CanvasRenderingContext2D | null;
  public constructor(canvas: HTMLCanvasElement) {
    super(canvas);
    this.context2D = this.canvas.getContext("2d");
  }
}

export class WebGLApplication extends Application {
  public context3D: WebGLRenderingContext | null;
  public constructor(
    canvas: HTMLCanvasElement
    // contextAttributes?: WebGLContextAttributes
  ) {
    super(canvas);
    this.context3D = this.canvas.getContext("webgl");
    // if (this.context3D === null) {
    //   this.context3D = this.canvas.getContext("experimental-webgl");
    if (this.context3D === null) {
      alert("无法创建WebGLRenderingContext上下文对象");
      throw new Error("无法创建WebGLRenderingContext上下文对象");
    }
    // }
  }
}
