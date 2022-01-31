
export const fetchTodos = async () => {
  return [{
    "userId": 1,
    "id": 1,
    "title": "foo",
    "completed": false
  }]
};


// This doesn't work
// export const  fetchTodos = jest.fn().mockResolvedValue([
//     {
//   "userId": 1,
//   "id": 1,
//   "title": "foo",
//   "completed": false
// }
// ])