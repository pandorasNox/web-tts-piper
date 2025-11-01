// // Msg - Represents messages in the system
// type Msg = { type: 'Increment' } | { type: 'Decrement' } | { type: 'FetchData' } | { type: 'GotData'; payload: string };

// // Model - Represents the application state
// type Model = {
//   counter: number;
//   data: string | null;
// };

// // Cmd - Represents declarative commands
// type Cmd = {
//   type: 'HttpGet';
//   url: string;
//   onSuccess: (response: unknown) => Msg;
// };

// // Runtime - Represents the simplified Elm runtime
// class Runtime {
//   model: Model;
//   updateFn: (msg: Msg, model: Model) => [Model, Cmd | null];
//   viewFn: (model: Model) => void;

//   constructor(
//     initialModel: Model,
//     updateFn: (msg: Msg, model: Model) => [Model, Cmd | null],
//     viewFn: (model: Model) => void
//   ) {
//     this.model = initialModel;
//     this.updateFn = updateFn;
//     this.viewFn = viewFn;
//   }

//   dispatch(msg: Msg) {
//     const [newModel, cmd] = this.updateFn(msg, this.model);
//     this.model = newModel;
//     this.viewFn(this.model);

//     if (cmd) {
//       this.executeCmd(cmd);
//     }
//   }

//   async executeCmd(cmd: Cmd) {
//     if (cmd.type === 'HttpGet') {
//       try {
//         const response = await fetch(cmd.url);
//         const data = await response.json();
//         const successMsg = cmd.onSuccess(data);
//         this.dispatch(successMsg);
//       } catch (error) {
//         console.error('Command execution failed', error);
//       }
//     }
//   }
// }

// // Example: Update function
// const update = (msg: Msg, model: Model): [Model, Cmd | null] => {
//   switch (msg.type) {
//     case 'Increment':
//       return [{ ...model, counter: model.counter + 1 }, null];
//     case 'Decrement':
//       return [{ ...model, counter: model.counter - 1 }, null];
//     case 'FetchData':
//       return [
//         model,
//         {
//           type: 'HttpGet',
//           url: 'https://api.example.com/data',
//           onSuccess: (response) => ({ type: 'GotData', payload: response as string })
//         }
//       ];
//     case 'GotData':
//       return [{ ...model, data: msg.payload }, null];
//     default:
//       return [model, null];
//   }
// };

// // Example: View function
// const view = (model: Model) => {
//   console.log('Model updated:', model);
// };

// // Initialize runtime
// const initialModel: Model = { counter: 0, data: null };
// const app = new Runtime(initialModel, update, view);

// // Dispatch some messages
// app.dispatch({ type: 'Increment' });
// app.dispatch({ type: 'FetchData' });
