// import { useEffect, useRef } from "react";

// function usePrevious(value) {
//   const ref = useRef();
//   useEffect(() => {
//     ref.current = value; //assign the value of ref to the argument
//   },[value]); //this code will run when the value of 'value' changes
//   return ref.current; //in the end, return the current ref value.
// }
// export default usePrevious;

import { useEffect, useRef } from "react";

function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined); // Ref is initialized to undefined
  useEffect(() => {
    ref.current = value; // Assign the value of ref to the argument
  }, [value]); // This effect runs whenever 'value' changes
  return ref.current; // Return the previous value
}

export default usePrevious;
