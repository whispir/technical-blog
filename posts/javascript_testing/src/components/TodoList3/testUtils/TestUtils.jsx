import { FetchTodosProvider } from "../FetchTodosProvider";

//nb!  Important issue with jest config and the default CRA configuration
// Jest _does not_ like mocks functions declared module scoped like this, it resets them. 


// const defaultMockFetchTodos = jest.fn().mockResolvedValue([
//     {
//         "userId": 1,
//         "id": 1,
//         "title": "foo", 
//         "completed": false
//       },
// ])

export const TextContextProvider = (props) => {

    const {fetchTodos = jest.fn().mockResolvedValue([
        {
            "userId": 1,
            "id": 1,
            "title": "foo", 
            "completed": false
          },
    ]), children} = props; 

    return <FetchTodosProvider fetchTodos = {fetchTodos}>
        {children}
    </FetchTodosProvider>
}