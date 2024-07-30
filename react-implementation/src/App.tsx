import { useEffect, useRef } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
// import {
//   memory,
//   cellsPtr,
//   width,
//   height,
// } from "./wasm-game-of-life/pkg/wasm_game_of_life_bg";
import "./App.css";

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestIdRef = useRef<number>();

  const draw = (ctx: CanvasRenderingContext2D, frameCount: number) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.arc(50, 100, 20 * Math.sin(frameCount * 0.05) ** 2, 0, 2 * Math.PI);
    ctx.fill();
  };

  useEffect(() => {
    // const cells = new Uint8Array(new ArrayBuffer(3), _, width * height);
    const animate = () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");

      let frameCount = 0;
      const render = () => {
        if (!ctx) {
          return;
        }
        frameCount++;
        draw(ctx, frameCount);
        requestIdRef.current = requestAnimationFrame(render);
      };
      render();
    };

    animate();
    return () => {
      if (requestIdRef.current) {
        cancelAnimationFrame(requestIdRef.current);
      }
    };
  }, []);
  return (
    <>
      <div>
        <canvas ref={canvasRef} id="canvas"></canvas>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App;
