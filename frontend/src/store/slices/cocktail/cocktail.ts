import {createAsyncThunk, createSlice, PayloadAction} from "@reduxjs/toolkit";
import axios from "axios";
import { RootState } from "../..";

export interface CocktailType {
    id: number,
    name: string,
    image: string,
    introduction: string,
    recipe: string,
    ABV: number,
    price_per_glass: number
    type: string,
    author_id: number,
    created_at: Date,
    updated_at: Date,
    rate: number
}

export interface CocktailInfo{
    cocktailList : CocktailType[],
    cocktailItem : CocktailType | null,
}
const initialState : CocktailInfo = {
    cocktailList: [
        {
            id: 1,
            name: 'name',
            image: 'https://www.acouplecooks.com/wp-content/uploads/2021/03/Blue-Lagoon-Cocktail-007s.jpg',
            introduction: '소개',
            recipe: '제조법',
            ABV: 42.4,
            price_per_glass: 3400,
            type: 'CS',
            author_id: 3,
            created_at: new Date(2022, 6, 17),
            updated_at: new Date(2022, 7, 14),
            rate: 4.8
        }, {
            id: 2,
            name: 'name2',
            image: 'https://www.acouplecooks.com/wp-content/uploads/2021/03/Blue-Lagoon-Cocktail-007s.jpg',
            introduction: '소개',
            recipe: '제조법',
            ABV: 42.4,
            price_per_glass: 3400,
            type: 'CS',
            author_id: 3,
            created_at: new Date(2022, 6, 17),
            updated_at: new Date(2022, 7, 14),
            rate: 3.4
        }, {
            id: 3,
            name: 'name3',
            image: 'https://www.acouplecooks.com/wp-content/uploads/2021/03/Blue-Lagoon-Cocktail-007s.jpg',
            introduction: '소개',
            recipe: '제조법',
            ABV: 42.4,
            price_per_glass: 3400,
            type: 'CS',
            author_id: 3,
            created_at: new Date(2022, 6, 17),
            updated_at: new Date(2022, 7, 14),
            rate: 5.0
        }
    ],
    cocktailItem: null,
}

export const fetchCocktailList = createAsyncThunk(
    "cocktail/fetchCocktailList", async () => {
        const response = await axios.get('/api/v1/cocktails');
        console.log(response.data)
        return response.data
    },
)

export const getCocktail = createAsyncThunk(
    "cocktail/getCocktail",
    async (id: CocktailType["id"], {dispatch}) => {
        const response = await axios.get(`/api/v1/cocktails/${id}`)
        console.log(response.data)
        return response.data;
    }
)

export const postCocktail = createAsyncThunk(
    "cocktail/postCocktail",
    async (cocktail: Omit<CocktailType, "id">, { dispatch }) => {
        const response = await axios.post('/api/v1/cocktails', cocktail);
        dispatch(cocktailActions.addCocktail(response.data));
    }
)

export const cocktailSlice = createSlice({
    name: "cocktail",
    initialState,
    reducers: {
        addCocktail: (
            state,
            action: PayloadAction<Omit<CocktailType, "id">>
        ) => {
            const newCocktail = {
                id: (state.cocktailList.at(-1)?.id ?? 0) + 1,
                image: action.payload.image,
                name: action.payload.name,
                introduction: action.payload.introduction,
                recipe: action.payload.recipe,
                ABV: action.payload.ABV,
                price_per_glass: action.payload.price_per_glass,
                type: action.payload.type,
                author_id: action.payload.author_id,
                created_at: action.payload.created_at,
                updated_at: action.payload.updated_at,
                rate: 5.0,
            };
            state.cocktailList.push(newCocktail);
        }
    },
    extraReducers: (builder) => {
        // Add reducers for additional action types here, and handle loading state as needed
        builder.addCase(fetchCocktailList.fulfilled, (state, action) => {
            state.cocktailList = action.payload;
        });
        builder.addCase(getCocktail.fulfilled, (state, action) => {
            state.cocktailItem = action.payload;
        });
        builder.addCase(postCocktail.rejected, (_state, action) => {
            console.error(action.error);
        });
    },
})

export const cocktailActions = cocktailSlice.actions;
export const selectCocktail = (state: RootState) => state.cocktail;

export default cocktailSlice.reducer;