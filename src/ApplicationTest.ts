import {
  Application,
  CanvasKeyBoardEvent,
  CanvasMouseEvent,
} from "./Application";

export class ApplicationTest extends Application {
  protected dispatchKeyDown(evt: CanvasKeyBoardEvent): void {
    console.log(`key: ${evt.key} is down.`);
  }

  protected dispatchMouseDown(evt: CanvasMouseEvent): void {
    console.log(`canvasPosition: ${evt.canvasPostion}`);
  }

  public update(elapsedMsec: number, intervalSec: number) {
    console.log(`elapsedMsec: ${elapsedMsec} intervalSec: ${intervalSec}`);
  }

  public render(): void {
    console.log("调用render方法");
  }
}
