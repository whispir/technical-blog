import { render,screen} from "@testing-library/react";
import { MyComponent } from "./MyComponent";

describe("MyComponent", () => {
    it ("Renders fine", () => {
        render(<MyComponent/>)


        expect(screen.getByText("a")).toBeInTheDocument();
        expect(screen.getByText("b")).toBeInTheDocument();
        expect(screen.getByText("c")).toBeInTheDocument();
    })
});     