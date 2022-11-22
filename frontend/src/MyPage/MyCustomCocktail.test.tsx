import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { CocktailInfo, CocktailItemType } from "../store/slices/cocktail/cocktail";
import { CommentInfo } from "../store/slices/comment/comment";
import { IngredientInfo } from "../store/slices/ingredient/ingredient";
import { getMockStore } from "../test-utils/mock";
import MyCustomCocktail from "./MyCustomCocktail";
import {UserInfo} from "../store/slices/user/user";

const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
    ...jest.requireActual("react-redux"),
    useDispatch: () => mockDispatch,
}));

const mockNavigate = jest.fn();
jest.mock("react-router", () => ({
    ...jest.requireActual("react-router"),
    useNavigate: () => mockNavigate,
}));

jest.mock("../common/Components/Item", () => (prop: Pick<CocktailItemType, "image" | "name" | "rate" | "type" | "id" | "tags">) => (
    <div data-testid={`spyCocktail_${prop.id}`}>
    </div>
));

const custom_cocktail1_item: CocktailItemType = {
    id: 2,
    name: "CS_COCKTAIL1",
    image: "IMAGE1",
    type: "CS",
    tags: [],
    author_id: 1,
    rate: 0,
    is_bookmarked: false,
}

const cocktaiState: CocktailInfo = {
    cocktailList: [custom_cocktail1_item],
    cocktailItem: null,
    itemStatus: "success",
    listStatus: "success",
}

const commentState: CommentInfo = {
    commentList: [],
    commentItem: null,
    state: null,
}

const ingredientState: IngredientInfo = {
    ingredientList: [],
    myIngredientList: [],
    ingredientItem: null,
    itemStatus: "success",
    listStatus: "success",
}

const stubUserInitialState: UserInfo = {
    user: {
        id: (localStorage.getItem("id") === null) ? null : localStorage.getItem("id"),
        username:  (localStorage.getItem("username") === null) ? null : localStorage.getItem("username"),
        password:  null,
        nickname:  (localStorage.getItem("nickname") === null) ? null : localStorage.getItem("nickname"),
        intro:  (localStorage.getItem("intro") === null) ? null : localStorage.getItem("intro"),
        profile_img:  (localStorage.getItem("profile_img") === null) ? null : localStorage.getItem("profile_img"),
    },
    token: (localStorage.getItem("token") === null) ? null : localStorage.getItem("token"),
    isLogin: (localStorage.getItem("token") !== null)
}

const mockStore = getMockStore({ cocktail: cocktaiState, ingredient: ingredientState, comment: commentState, user:stubUserInitialState });


describe("<MyCustomCocktail />", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should render comment without errors", () => {
        render(
            <Provider store={mockStore}>
                <MyCustomCocktail />
            </Provider>
        );
        expect(mockDispatch).toBeCalledTimes(1)
        screen.getByTestId("spyCocktail_2")
    });

    it("should handle create cocktail click", async () => {
        render(
            <Provider store={mockStore}>
                <MyCustomCocktail />
            </Provider>
        );
        const element = screen.getByText("Add");
        fireEvent.click(element)
        await waitFor(() => { expect(mockNavigate).toBeCalledWith("/custom/create") })
    });
})