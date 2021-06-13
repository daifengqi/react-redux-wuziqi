import store from "./boardreducer";
import { createStore } from "redux";

// 深度比较两个相同大小的二维正方形数组是否完全一样
function diff2dArray(arr1, arr2) {
  const n = arr1.length;
  for (let i = 0; i < n; ++i) {
    for (let j = 0; j < n; ++j) {
      if (arr1[i][j] !== arr2[i][j]) {
        return true;
      }
    }
  }
  return false;
}

const timeReducer = (state = [], action) => {
  switch (action.type) {
    case "DIFF":
      return [...state, action.state];
    case "JUMP":
      return state.slice(0, action.index + 1);
    case "CLEAR":
      return [];
    case "SET":
      return action.state;
    default:
      return state;
  }
};

const timeStore = createStore(timeReducer);

// 每当store有状态改变，就把store状态存到时间旅行链条里去
store.subscribe(() => {
  const timeState = timeStore.getState();
  const diff =
    timeState.length === 0
      ? true
      : diff2dArray(timeState[timeState.length - 1], store.getState());
  if (diff) {
    timeStore.dispatch({ type: "DIFF", state: store.getState() });
  }
});

export default timeStore;
