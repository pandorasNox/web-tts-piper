
// type Model = {
//   count: number;
// };

// type Msg = "Increment" | "Decrement" | "ExternalEvent";

// type Cmd = () => void;

// type Port = (msg: Msg) => void; // A function to send messages back to the app

// type Subscription = (port: Port) => void; // A subscription registers listeners using the port

// type Update = (model: Model, msg: Msg) => { model: Model; cmd: Cmd | null };

// type View = (model: Model, send: (msg: Msg) => void) => HTMLElement;

// // Update function: modifies the model and returns a command
// const update: Update = (model, msg) => {
//   switch (msg) {
//     case "Increment":
//       return {
//         model: { count: model.count + 1 },
//         cmd: () => console.log("Increment command executed!"),
//       };
//     case "Decrement":
//       return {
//         model: { count: model.count - 1 },
//         cmd: () => console.log("Decrement command executed!"),
//       };
//     case "ExternalEvent":
//       return {
//         model,
//         cmd: () => console.log("External event handled!"),
//       };
//     default:
//       return { model, cmd: null };
//   }
// };

// // View function: creates HTML for the current state of the model
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

// // Subscriptions: Registers event listeners using ports
// const subscriptions: Subscription[] = [
//   (port) => {
//     // Simulate external events with a timer
//     setInterval(() => {
//       port("ExternalEvent");
//     }, 3000); // Fires an ExternalEvent message every 3 seconds
//   },

//   (port) => {
//     // Example: Listen for a browser event (e.g., keypress)
//     document.addEventListener("keydown", (event) => {
//       if (event.key === "ArrowUp") {
//         port("Increment");
//       } else if (event.key === "ArrowDown") {
//         port("Decrement");
//       }
//     });
//   },
// ];

// // Program loop
// const runApp = (initialModel: Model, rootElement: HTMLElement) => {
//   let model = initialModel;

//   const send = (msg: Msg) => {
//     const { model: newModel, cmd } = update(model, msg);
//     model = newModel;

//     if (cmd) {
//       cmd();
//     }

//     while (rootElement.firstChild) {
//       rootElement.removeChild(rootElement.firstChild);
//     }
//     rootElement.appendChild(view(model, send));
//   };

//   // Initialize subscriptions with the port
//   subscriptions.forEach((subscription) => subscription(send));

//   // Initial render
//   rootElement.appendChild(view(model, send));
// };

// // Initial model
// const initialModel: Model = { count: 0 };

// // Start the app
// const rootElement = document.getElementById("app"); // Ensure there's a <div id="app"></div> in your HTML
// if (rootElement) {
//   runApp(initialModel, rootElement);
// }
