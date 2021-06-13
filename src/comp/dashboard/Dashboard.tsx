import React, { useState, useRef } from "react";
import Board from "../board/Board";
import Timeline from "../timeline/Timeline";

const Dashboard: React.FunctionComponent = () => {
  // 用户选择的属性：棋盘宽高，棋盘一行格数，连续几个棋子算胜利
  const [wh, setWh] = useState(600);
  const [grid, setGrid] = useState(20);
  const [nCon, setNCon] = useState(5);
  // 计算属性
  const step = wh / grid; // 每格宽高
  const border = step / 2; // 边缘补白
  const grids = new Array(grid).fill(0).map((v, i) => i * step); // 每格宽高起始
  // 函数：根据落子，在画布上添加棋子
  const luozi = function (
    context: CanvasRenderingContext2D,
    i: number,
    j: number,
    black: boolean
  ) {
    context.beginPath();
    context.arc(
      border + i * step,
      border + j * step,
      step / 2.5,
      0,
      2 * Math.PI
    );
    context.closePath();
    const gradient = context.createRadialGradient(
      border + i * step + step / 10,
      border + j * step - step / 10,
      border,
      border + i * step,
      border + j * step,
      0
    );
    if (black) {
      gradient.addColorStop(0, "#0a0a0a");
      gradient.addColorStop(1, "#636766");
    } else {
      gradient.addColorStop(0, "#D1D1D1");
      gradient.addColorStop(1, "#F9F9F9");
    }
    context.fillStyle = gradient;
    context.fill();
  };
  // 函数：根据属性绘制画布
  function paintCanvas(ctx: CanvasRenderingContext2D, state: number[][]) {
    // 画棋盘
    ctx.beginPath();
    grids.forEach((v) => {
      ctx.moveTo(border + v, border);
      ctx.lineTo(v + border, wh - border);
      ctx.moveTo(border, v + border);
      ctx.lineTo(wh - border, v + border);
    });
    ctx.stroke();
    // 根据状态落子
    for (let i = 0; i < grid; ++i) {
      for (let j = 0; j < grid; ++j) {
        if (state[i][j] === 1) {
          luozi(ctx, i, j, true);
        } else if (state[i][j] === 2) {
          luozi(ctx, i, j, false);
        }
      }
    }
  }

  const boardAttribute = {
    wh,
    grid,
    nCon,
    step,
    border,
    grids,
    luozi,
    paintCanvas,
  };

  // 时间旅行状态文本
  const [timetext, setTimetext] = useState([]);
  const [freeze, setFreeze] = useState(false);
  // 先手状态
  const [black, setBlack] = useState(true);
  // 棋盘状态：开始（bgn），比赛中（ing），结束（end）
  const [match, setMatch] = useState("bgn");
  const [winner, setWinner] = useState(null);

  // 用户可设置的属性：
  // 1. 棋盘宽高 wh
  // 2. 棋盘一行格数 grid
  // 3. 连续几个棋子算胜利 nCon（数值选择，最少3，最多7）
  // 注意，由于这三个属性都是state，所以重设之后会刷新整个Dashboard及子组件，所以不用处理后面的逻辑，挺好的
  const nInput = useRef(null);
  function handleSubmit(e) {
    e.preventDefault();
    setNCon(nInput.current.value);
  }

  return (
    <>
      <form onSubmit={handleSubmit}>
        <label htmlFor="nCon">想要连续几个棋子算胜利？（最少3，最多7）</label>
        <input
          defaultValue={5}
          type="number"
          ref={nInput}
          name="nCon"
          min="3"
          max="7"
        ></input>
        <button type="submit">Submit</button>
      </form>
      <Board
        boardAttribute={boardAttribute}
        freeze={freeze}
        setFreeze={setFreeze}
        setTimetext={setTimetext}
        black={black}
        setBlack={setBlack}
        match={match}
        setMatch={setMatch}
        winner={winner}
        setWinner={setWinner}
      />
      <Timeline
        freeze={freeze}
        timetext={timetext}
        setTimetext={setTimetext}
        setFreeze={setFreeze}
        boardAttribute={boardAttribute}
        setBlack={setBlack}
        match={match}
        setMatch={setMatch}
        setWinner={setWinner}
      />
    </>
  );
};

export default Dashboard;
