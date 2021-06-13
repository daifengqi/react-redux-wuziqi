import React, { useState, useEffect } from "react";
import boardStore from "../../redux/boardreducer";
import timeStore from "../../redux/timereducer";

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

type TimelineProps = {
  freeze: boolean;
  timetext: string[];
  setFreeze: Function;
  setTimetext: Function;
  boardAttribute: boardAttributeAttr;
  setBlack: Function;
  match: string;
  setMatch: Function;
  setWinner: Function;
};

const Timeline: React.FunctionComponent<TimelineProps> = ({
  freeze,
  timetext,
  setTimetext,
  setFreeze,
  boardAttribute,
  setBlack,
  match,
  setMatch,
  setWinner,
}: TimelineProps) => {
  const [viewIdx, setViewIdx] = useState(0);

  // 处理视图
  function handleView(e, idx) {
    console.log(idx);
    console.log(timeStore.getState());
    const board: HTMLCanvasElement = document.getElementById(
      "board"
    ) as HTMLCanvasElement;
    const ctx = board.getContext("2d");
    // 1. 清理棋盘
    ctx.clearRect(0, 0, boardAttribute.wh, boardAttribute.wh);
    // 2. 呈现第i步的状态
    boardAttribute.paintCanvas(ctx, timeStore.getState()[idx]);
    // 3. 冻结下棋点击操作
    setFreeze(true);
    // 4. 取得索引
    setViewIdx(idx);
  }

  // 点击“时间回溯”之后：处理状态（不用处理视图，因为view已经处理好了）
  function timeTravel() {
    const stateOfTime = timeStore.getState();
    const textOfTime = timetext.slice();
    if (match !== "end") {
      // 1. 取消冻结
      setFreeze(false);
      // 2. 回到第i个索引的状态
      boardStore.dispatch({
        type: "JUMP",
        state: stateOfTime[viewIdx],
      });
      // 3. 状态组件里保留到i个
      timeStore.dispatch({
        type: "JUMP",
        index: viewIdx,
      });
      // 4. 重置先手（如果是白，说明该黑走，反之同理）
      const firstHand = timetext[viewIdx][0] === "白" ? true : false;
      setBlack(firstHand);
      // 5. 重置时间旅行列表
      setTimetext(textOfTime.slice(0, viewIdx + 1));
    } else {
      // 如果回溯的就是现在的比赛结束态，则不做任何处理
      if (viewIdx === textOfTime.length - 1) {
        return;
      }
      setMatch("ing");
      setWinner(null);
      // 因为setMatch会触发另一个组件的useEffect，所以要推入下一个事件循环进行
      // 注意，所有东西已经在useEffect里重置，要用提前保留好的变量来恢复
      setTimeout(() => {
        setFreeze(false);
        boardStore.dispatch({
          type: "JUMP",
          state: stateOfTime[viewIdx],
        });
        console.log(viewIdx);
        timeStore.dispatch({
          type: "SET",
          state: stateOfTime.slice(0, viewIdx + 1),
        });
        const firstHand = textOfTime[viewIdx][0] === "白" ? true : false;
        setBlack(firstHand);
        setTimetext(textOfTime.slice(0, viewIdx + 1));
        // 另外，绘制棋盘
        const board: HTMLCanvasElement = document.getElementById(
          "board"
        ) as HTMLCanvasElement;
        const ctx = board.getContext("2d");
        ctx.clearRect(0, 0, boardAttribute.wh, boardAttribute.wh);
        boardAttribute.paintCanvas(ctx, boardStore.getState());
      }, 100);
    }
  }

  return (
    <>
      {freeze && <button onClick={timeTravel}>时间回溯</button>}
      <ul>
        {timetext.map((v, idx) => (
          <section style={{ display: "flex", flexDirection: "row" }} key={v}>
            <li>{v}</li>
            <button
              onClick={(e) => {
                handleView(e, idx);
              }}
            >
              view
            </button>
          </section>
        ))}
      </ul>
    </>
  );
};

export default Timeline;
