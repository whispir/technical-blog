import { render,screen} from "@testing-library/react";
import { MyOuterComponent } from "./StyledComponent";
import { cleanUpTest, registerTest } from "./testUtils";




describe("StyledComponent", () => {
    it ("Renders fine", () => {
        render(<MyOuterComponent/>)
        expect(screen.getByText("hello world!")).toBeInTheDocument();

    })
});     

describe("SomethingElse", () => {
    it ("Renders fine", () => {
        render(<div> hello world!</div>)
        expect(screen.getByText("hello world!")).toBeInTheDocument();

    })
});     