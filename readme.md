### React + Redux练手项目

项目特点：

1. 函数式组件，代码注释涉及了useState、useEffect的使用原因和渲染原理
2. 内容包括了父子组件状态通信方法、redux全局状态通信
3. 基本的Redux封装，并且实现了可控的时间旅行（time travel）
4. 以“五子棋”为载体，实现了**状态**的可视化，加深理解
5. Vite+TypeScript搭建



### Redux时间旅行简介

官网介绍了[时间旅行](https://redux.js.org/recipes/implementing-undo-history)的概念，然而Redux本身并没有内置实现这个功能，有点奇怪，所以自行实现。如果有时间，以后会把这个功能封装成通用的redux时间旅行库。目前npm有这样的[库](https://www.npmjs.com/package/redux-time-travel)，不过已经3年没有维护了，我去试了一下好像也遇到一些问题，所以可以尝试重新做一个更好的。



### TODO

1. 用一个通用的组件库（例如[antd](https://ant.design/index-cn)）来美化一下界面。
2. 封装到Electron和Native



本项目几乎未使用CSS修饰，因为目的不是学习CSS，主要为了节省时间，

![wuziqi](https://cescdf.com/image/gif/wuziqi.gif)

克隆后执行`npm install`可自行玩耍和调试，欢迎star和fork~