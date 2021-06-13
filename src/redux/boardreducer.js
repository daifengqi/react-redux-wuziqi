import { createStore } from "redux";
import { ActionTypes } from "redux-undo";
/*
 * 定义棋盘的状态：state[i][j]：0表示没有棋子，1表示黑色，2表示白色
 */

/*
 * 要有一个纯函数，把二维数组的某一位进行修改
 */
function newBoard(arr, i, j, val) {
  // 浅拷贝二维数组
  const ret = new Array(arr.length).fill(0).map((v, i) => [...arr[i]]);
  ret[i][j] = val;
  return ret;
}

// Reducer
function boardReducer(state = 0, action) {
  switch (action.type) {
    case "INITBOARD":
      return new Array(action.grid)
        .fill(0)
        .map(() => new Array(action.grid).fill(0));
    case "LUOZI":
      return newBoard(state, action.i, action.j, action.val);
    case "JUMP":
      return action.state;
    default:
      return state;
  }
}

// 创建 Redux store 来存放应用的状态。
// API 是 { subscribe, dispatch, getState }。
const store = createStore(boardReducer);

export default store;
