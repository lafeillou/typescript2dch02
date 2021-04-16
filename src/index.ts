import { ApplicationTest } from "./ApplicationTest";
import { Application } from "./Application";

let canvas: HTMLCanvasElement | null = document.getElementById(
  "canvas"
) as HTMLCanvasElement;
let app: Application = new ApplicationTest(canvas);
app.update(0, 0);
app.render();
let startButton: HTMLButtonElement | null = document.getElementById(
  "start"
) as HTMLButtonElement;
let stopButton: HTMLButtonElement | null = document.getElementById(
  "stop"
) as HTMLButtonElement;
startButton.onclick = (ev: MouseEvent): void => {
  app.start();
};

stopButton.onclick = (ev: MouseEvent): void => {
  app.stop();
};
