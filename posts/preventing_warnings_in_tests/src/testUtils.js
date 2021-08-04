import { v4 as uuid } from 'uuid';


const testRegisters = {}; 

export function registerTest() {
    const id = uuid();

    testRegisters[id] = []; 
    process.env.TEST_ID = id; 

}


export function registerWarning(message) {
    const id = process.env.TEST_ID;

    if (id && testRegisters[id]){
        testRegisters[id].push(message); 
    }
}

export function cleanUpTest() {

    const id = process.env.TEST_ID;
    if (testRegisters[id].length > 0) {
        throw new Error("Disallowed console warnings/errors exist on this test!");
    }
}