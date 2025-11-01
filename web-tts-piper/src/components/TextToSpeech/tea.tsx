
type App = {}

type Msg = "Increment" | "Decrement"

type State = {}

type Cmd = {cmd: "log", msg: string} | {cmd: "none"}

type UpdateFn = (msg: Msg, state: State) => [state: State, cmd: Cmd]

type CleanupFn = () => void

type Subscription = () => CleanupFn | void


// --


const app = {
  run: function(update: UpdateFn) {

  }
}


// --


// function update(msg: Msg, state: State): [state: State, cmd: Cmd] {
// function update(...args: Parameters<UpdateFn>): ReturnType<UpdateFn> {
//   const [msg, state] = args;
//   const noneCmd: Cmd = {cmd: "none"};
//   return [state, noneCmd]
// }

const update: UpdateFn = (msg, state) => {
  const noneCmd: Cmd = {cmd: "none"};
  return [state, noneCmd]
}


// --


app.run(update)
// render view
// listen to onClick/onChange etc handler
// init subscription, which get passed in ports/dispatch func which can send msgs
