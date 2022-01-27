// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import { cleanUpTest, registerTest, registerWarning } from './testUtils';




const {warn, error} = console; 




/**
 * Iteration 1
 */
console.warn = (...args) => {
          registerWarning(...args); 

    warn(...args); 
    throw new Error("Encountered a console.warn message! Please fix this!");
}


console.error = (...args) => {
    
    error(...args);     
    throw new Error("Encountered a console.error message! Please fix this!");
}


beforeEach(() => {
    registerTest();
}); 


afterEach(() => {
    cleanUpTest();
}); 


/**
 * Iteration 2 - solving the error solving problem
 */


//  console.warn = (...args) => {
//      registerWarning(...args); 
//      warn(...args); 
//      throw new Error("Encountered a console.warn message! Please fix this!");
//  }
 
 
//  console.error = (...args) => {
     
//      error(...args);     
//      throw new Error("Encountered a console.error message! Please fix this!");
//  }