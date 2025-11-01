// // Cmd - Represents declarative commands
// type Cmd<T> = {
//   type: 'HttpGet' | 'SendMessage';
//   url?: string; // For HttpGet
//   message?: string; // For SendMessage
//   onSuccess?: (response: unknown) => T; // For HttpGet
// };

// // Sub - Represents subscriptions
// type Sub<T> = {
//   type: 'TimeSubscription' | 'MessageReceiver';
//   interval?: number; // For TimeSubscription
//   onTick?: () => T; // For TimeSubscription
//   onMessage?: (message: string) => T; // For MessageReceiver
// };

// // Msg - Represents application messages
// type Msg =
//   | { type: 'Increment' }
//   | { type: 'Decrement' }
//   | { type: 'FetchData' }
//   | { type: 'GotData'; payload: string }
//   | { type: 'Tick'; timestamp: number }
//   | { type: 'SendMessage'; message: string }
//   | { type: 'ReceiveMessage'; message: string };

// // Model - Represents the application state
// type Model = {
//   counter: number;
//   data: string | null;
//   timestamp: number | null;
//   lastSentMessage: string | null;
//   lastReceivedMessage: string | null;
// };

// // Runtime - Handles Cmd, Sub, and Ports
// class Runtime {
//   model: Model;
//   updateFn: (msg: Msg, model: Model) => [Model, Cmd<Msg> | null];
//   viewFn: (model: Model) => void;
//   subscribeFn: (model: Model) => Sub<Msg> | null;
//   intervalId: number | null = null; // For time subscriptions

//   constructor(
//     initialModel: Model,
//     updateFn: (msg: Msg, model: Model) => [Model, Cmd<Msg> | null],
//     viewFn: (model: Model) => void,
//     subscribeFn: (model: Model) => Sub<Msg> | null
//   ) {
//     this.model = initialModel;
//     this.updateFn = updateFn;
//     this.viewFn = viewFn;
//     this.subscribeFn = subscribeFn;

//     this.viewFn(this.model);
//     this.initializeSubscriptions();
//   }

//   dispatch(msg: Msg) {
//     const [newModel, cmd] = this.updateFn(msg, this.model);
//     this.model = newModel;
//     this.viewFn(this.model);

//     if (cmd) {
//       this.executeCmd(cmd);
//     }

//     this.initializeSubscriptions();
//   }

//   async executeCmd(cmd: Cmd<Msg>) {
//     if (cmd.type === 'HttpGet' && cmd.url && cmd.onSuccess) {
//       try {
//         const response = await fetch(cmd.url);
//         const data = await response.json();
//         const successMsg = cmd.onSuccess(data);
//         this.dispatch(successMsg);
//       } catch (error) {
//         console.error('Command execution failed', error);
//       }
//     } else if (cmd.type === 'SendMessage' && cmd.message) {
//       // Simulated port logic for sending messages
//       console.log('Sending message to external system:', cmd.message);
//       // Assume the external system processes the message here
//     } else {
//       console.error('Unsupported command type or missing parameters');
//     }
//   }

//   initializeSubscriptions() {
//     const sub = this.subscribeFn(this.model);

//     if (sub) {
//       if (sub.type === 'TimeSubscription' && sub.interval && sub.onTick) {
//         if (this.intervalId !== null) {
//           clearInterval(this.intervalId);
//         }
//         this.intervalId = setInterval(() => {
//           const tickMsg: Msg = sub.onTick();
//           this.dispatch(tickMsg);
//         }, sub.interval);
//       } else if (sub.type === 'MessageReceiver' && sub.onMessage) {
//         // Simulated port logic for receiving messages
//         console.log('Listening for incoming messages...');
//         const externalMessage = 'Hello from external system'; // Example message
//         const receiveMsg: Msg = sub.onMessage(externalMessage);
//         this.dispatch(receiveMsg);
//       }
//     } else if (this.intervalId !== null) {
//       clearInterval(this.intervalId);
//       this.intervalId = null;
//     }
//   }
// }

// // Example: Update Function
// const update = (msg: Msg, model: Model): [Model, Cmd<Msg> | null] => {
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
//     case 'SendMessage':
//       return [{ ...model, lastSentMessage: msg.message }, { type: 'SendMessage', message: msg.message }];
//     case 'ReceiveMessage':
//       return [{ ...model, lastReceivedMessage: msg.message }, null];
//     case 'Tick':
//       return [{ ...model, timestamp: msg.timestamp }, null];
//     default:
//       return [model, null];
//   }
// };

// // Example: Subscribe Function
// const subscribe = (model: Model): Sub<Msg> | null => {
//   if (model.counter % 2 === 0) {
//     return {
//       type: 'TimeSubscription',
//       interval: 1000, // 1 second
//       onTick: () => ({ type: 'Tick', timestamp: Date.now() })
//     };
//   }
//   return {
//     type: 'MessageReceiver',
//     onMessage: (message) => ({ type: 'ReceiveMessage', message })
//   };
// };

// // Example: View Function
// const view = (model: Model) => {
//   console.log('Model updated:', model);
// };

// // Initialize the runtime
// const initialModel: Model = {
//   counter: 0,
//   data: null,
//   timestamp: null,
//   lastSentMessage: null,
//   lastReceivedMessage: null
// };
// const app = new Runtime(initialModel, update, view, subscribe);

// // Dispatch some messages
// app.dispatch({ type: 'Increment' });
// app.dispatch({ type: 'SendMessage', message: 'Hello, World!' });
