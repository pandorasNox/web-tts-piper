
// type State = {
//   count: number;
// };

// type Msg = "Increment" | "Decrement" | "ExternalEvent";

// type Cmd = () => void;

// type Port = (msg: Msg) => void; // Function to send messages to the app

// type Receive = (event: string, handler: () => void) => void; // Function to register event listeners

// type Subscription = (send: Port, receive: Receive) => void; // Subscriptions use send and receive

// type Option<T> = T | null;

// type Update = (msg: Msg, state: State) => { state: State; cmd: Option<Cmd> };

// type View = (state: State, send: (msg: Msg) => void) => HTMLElement;

// // Update function: Modifies the model and returns a command
// const update: Update = (msg, state) => {
//   const noneCmd: Cmd = { cmd: "none" };

//   switch (msg) {
//     case "Increment":
//       return {
//         state: { count: state.count + 1 },
//         cmd: () => console.log("Increment command executed!"),
//       };
//     case "Decrement":
//       return {
//         state: { count: state.count - 1 },
//         cmd: () => console.log("Decrement command executed!"),
//       };
//     case "ExternalEvent":
//       return {
//         state,
//         cmd: () => console.log("External event handled!"),
//       };
//     default:
//       return { state: state, cmd: noneCmd };
//   }
// };

// // View function: Creates the HTML interface for the current state
// const view: View = (model, send) => {
//   const container = document.createElement("div");

//   const counterDisplay = document.createElement("p");
//   counterDisplay.textContent = `Count: ${model.count}`;
//   container.appendChild(counterDisplay);

//   const incrementButton = document.createElement("button");
//   incrementButton.textContent = "Increment";
//   incrementButton.onclick = () => send("Increment");
//   container.appendChild(incrementButton);

//   const decrementButton = document.createElement("button");
//   decrementButton.textContent = "Decrement";
//   decrementButton.onclick = () => send("Decrement");
//   container.appendChild(decrementButton);

//   return container;
// };

// // Subscriptions: Registers event listeners using send and receive
// const subscriptions: Subscription[] = [
//   (send, receive) => {
//     // Simulate external events
//     setInterval(() => {
//       send("ExternalEvent");
//     }, 3000); // Fire ExternalEvent every 3 seconds

//     // Listen for custom events via receive
//     receive("customEvent", () => {
//       send("Increment");
//     });
//   },
// ];

// // Program loop
// const runApp = (initialModel: State, rootElement: HTMLElement) => {
//   let model = initialModel;

//   // Simple event system for receive
//   const eventHandlers: Record<string, (() => void)[]> = {};

//   const receive: Receive = (event, handler) => {
//     if (!eventHandlers[event]) {
//       eventHandlers[event] = [];
//     }
//     eventHandlers[event].push(handler);
//   };

//   const triggerEvent = (event: string) => {
//     (eventHandlers[event] || []).forEach((handler) => handler());
//   };

//   const send = (msg: Msg) => {
//     const { state: newModel, cmd } = update(msg, model);
//     model = newModel;

//     if (cmd) {
//       cmd();
//     }

//     // Re-render the view
//     while (rootElement.firstChild) {
//       rootElement.removeChild(rootElement.firstChild);
//     }
//     rootElement.appendChild(view(model, send));
//   };

//   // Initialize subscriptions
//   subscriptions.forEach((subscription) => subscription(send, receive));

//   // Initial render
//   rootElement.appendChild(view(model, send));

//   // Example: Trigger a custom event after 5 seconds
//   setTimeout(() => {
//     console.log("Triggering customEvent...");
//     triggerEvent("customEvent");
//   }, 5000);
// };

// // Initial model
// const initialModel: State = { count: 0 };

// // Start the app
// const rootElement = document.getElementById("app"); // Ensure there's a <div id="app"></div> in your HTML
// if (rootElement) {
//   runApp(initialModel, rootElement);
// }
