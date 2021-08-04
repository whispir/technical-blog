
export const MyComponent = () => {
    const values = ["a", "b", "c"]; 

    return <div> 
        {values.map((v) => <span>{v}</span>)}
    </div>; 
}