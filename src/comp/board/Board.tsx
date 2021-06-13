import React, { useState, useEffect } from "react";
import boardStore from "../../redux/boardreducer";
import timeStore from "../../redux/timereducer";
import styles from "./board.module.css";

// 判断比赛结束的函数（已经有一方有连续的n个棋子）
function nConsecutivePieces(n: number, arr: number[][]): number {
  // f[i][j][k]：到第i j位置时有连续的状态为k的棋子的个数
  // k（黑棋）：0表示左到右，1表示上到下，2表示左上到右下，3表示右上到左下
  // k（白棋）：4表示左到右，5表示上到下，6表示左上到右下，7表示右上到左下
  const wh = arr.length;
  const f: number[][][] = new Array(wh + 2)
    .fill(0)
    .map(() => new Array(wh + 2).fill(0).map(() => new Array(8).fill(0)));

  for (let i = 1; i <= wh; ++i) {
    for (let j = 1; j <= wh; ++j) {
      // 只看有棋子的时候，1（黑色）或 2（白色）
      if (arr[i - 1][j - 1] === 1) {
        f[i][j][0] = f[i][j - 1][0] + 1;
        f[i][j][1] = f[i - 1][j][1] + 1;
        f[i][j][2] = f[i - 1][j - 1][2] + 1;
        f[i][j][3] = f[i - 1][j + 1][3] + 1;
      } else if (arr[i - 1][j - 1] === 2) {
        f[i][j][4] = f[i][j - 1][4] + 1;
        f[i][j][5] = f[i - 1][j][5] + 1;
        f[i][j][6] = f[i - 1][j - 1][6] + 1;
        f[i][j][7] = f[i - 1][j + 1][7] + 1;
      }
    }
  }

  // 存在连续的n种情况，就返回1或2
  for (let i = 1; i <= wh; ++i) {
    for (let j = 1; j <= wh; ++j) {
      // 如果黑棋赢了，返回1
      if (Math.max(...f[i][j].slice(0, 4)) >= n) {
        return 1;
      }
      // 如果白棋赢了，返回2
      if (Math.max(...f[i][j].slice(4, 8)) >= n) {
        return 2;
      }
    }
  }

  // 否则返回0
  return 0;
}

/*
 * 「棋盘组件」
 */

type boardAttributeAttr = {
  wh: number;
  grid: number;
  nCon: number;
  step: number;
  border: number;
  grids: number[];
  luozi: Function;
  paintCanvas: Function;
};

//  TODO：black状态提升，因为时间回溯后要重新根据状态设置先手。
type BoardProps = {
  boardAttribute: boardAttributeAttr;
  freeze: boolean;
  setFreeze: Function;
  setTimetext: Function;
  black: boolean;
  setBlack: Function;
  match: string;
  setMatch: Function;
  winner: string | null;
  setWinner: Function;
};

const Board: React.FunctionComponent<BoardProps> = ({
  boardAttribute,
  freeze,
  setFreeze,
  setTimetext,
  black,
  setBlack,
  match,
  setMatch,
  winner,
  setWinner,
}: BoardProps) => {
  /*
   * canvas操作：布置棋盘线条和背景
   * 注意这个钩子，有以下情况会执行：
   * 1. 初始化组件渲染结束时；
   * 2. match由"bgn"变化为"ing"
   * 3. match由"ing"变化为“end"
   */
  useEffect(() => {
    // 布置canvas
    const board: HTMLCanvasElement = document.getElementById(
      "board"
    ) as HTMLCanvasElement;
    const ctx = board.getContext("2d");
    // 处理逻辑
    if (match === "bgn" || match === "ing") {
      setMatch("ing");
      // 每次布置棋盘，都要初始化
      setBlack(true); // 设置先手
      boardStore.dispatch({ type: "INITBOARD", grid: boardAttribute.grid }); // 初始化棋盘
      timeStore.dispatch({ type: "CLEAR" });
      setTimetext([]);
      // 画棋盘
      ctx.beginPath();
      boardAttribute.grids.forEach((v) => {
        ctx.moveTo(boardAttribute.border + v, boardAttribute.border);
        ctx.lineTo(
          v + boardAttribute.border,
          boardAttribute.wh - boardAttribute.border
        );
        ctx.moveTo(boardAttribute.border, v + boardAttribute.border);
        ctx.lineTo(
          boardAttribute.wh - boardAttribute.border,
          v + boardAttribute.border
        );
      });
      ctx.stroke();
    } else {
      // match === 'end'
      // 画好最后的棋盘
      boardAttribute.paintCanvas(ctx, boardStore.getState());
    }
    // 清空棋盘
    return () => {
      ctx.clearRect(0, 0, boardAttribute.wh, boardAttribute.wh);
    };
  }, [match]);

  /*
   * 点击完成落子，然后转换先手方
   */
  const handleLuozi = (e: any) => {
    // 比赛结束，不再触发任何事件
    if (match === "end" || freeze) {
      return;
    }
    const board: HTMLCanvasElement = document.getElementById(
      "board"
    ) as HTMLCanvasElement;
    const ctx = board.getContext("2d");

    const x = e.nativeEvent.offsetX;
    const y = e.nativeEvent.offsetY;
    const i = Math.floor(x / boardAttribute.step);
    const j = Math.floor(y / boardAttribute.step);
    // 只能落还没有下的地方
    if (boardStore.getState()[i][j] === 0) {
      // 改变视图
      boardAttribute.luozi(ctx, i, j, black);
      // 更改状态
      boardStore.dispatch({ type: "LUOZI", i, j, val: black ? 1 : 2 });

      setBlack((color) => !color);
      // 胜者：处理结束比赛的逻辑
      const conPieces = nConsecutivePieces(
        boardAttribute.nCon,
        boardStore.getState()
      );
      if (conPieces === 1) {
        setMatch("end");
        setWinner("black");
      } else if (conPieces === 2) {
        setMatch("end");
        setWinner("white");
      }
      // 处理时空旅行
      setTimetext((textArray) => [
        ...textArray,
        `${black ? "黑" : "白"}：（${i}，${j}）`,
      ]);
    }
  };

  /*
   * 重新开始
   */
  function Restart() {
    setMatch("bgn");
    setWinner(null);
    setTimetext([]);
    setFreeze(false);
    // 两个全局状态不用初始化，因为match状态的改变会触发useEffect，那里会初始化
  }

  return (
    <>
      <h1 className={styles.h1}>连子棋の时间旅行</h1>
      <canvas
        id="board"
        width={boardAttribute.wh}
        height={boardAttribute.wh}
        onClick={handleLuozi}
      ></canvas>
      <button onClick={Restart}>重新开始</button>
      {winner !== null && (
        <p>获得比赛胜利的是：{winner === "black" ? "黑棋" : "白棋"}！✌️</p>
      )}
    </>
  );
};

export default Board;
