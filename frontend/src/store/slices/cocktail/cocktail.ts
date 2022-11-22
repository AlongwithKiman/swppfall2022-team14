import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { RootState } from "../..";
import ingredient, { IngredientType } from "../ingredient/ingredient";


export interface CocktailItemType {
    id: number,
    name: string,
    image: string,
    type: "CS" | "ST",
    tags: string[],
    author_id: number | null,
    rate: number,
    is_bookmarked: boolean
}

export interface CocktailDetailType {
    id: number,
    name: string,
    image: string,
    introduction: string,
    recipe: string,
    ABV: number,
    price_per_glass: number
    tags: string[],
    type: "CS" | "ST",
    author_id: number | null,
    created_at: Date,
    updated_at: Date,
    rate: number,
    ingredients: IngredientPrepareType[],
    is_bookmarked: boolean
}

export interface IngredientPrepareType extends IngredientType {
    amount: string;
}

export interface CocktailInfo {
    cocktailList: CocktailItemType[],
    cocktailItem: CocktailDetailType | null,
    itemStatus: string,
    listStatus: string
}

const initialState: CocktailInfo = {
    cocktailList: [],
    cocktailItem: null,
    itemStatus: "loading",
    listStatus: "loading"
}



export interface FilterParamType {
    type_one: string[];
    type_two: string[];
    type_three: string[];
    name_param: string[];
    available_only: boolean
    // my_ingredient_id_list: number[];
}

export const fetchStandardCocktailList = createAsyncThunk(
    "cocktail/fetchStandardCocktailList", async (params: FilterParamType | null) => {
        if (!params) {
            const response = await axios.get(`/api/v1/cocktails/?type=standard`);
            console.log(response.data)
            return response.data
        }
        else {
            const response = await axios.get(`/api/v1/cocktails/?type=standard`,
                {
                    params: params
                }
            );
            console.log(response.data)
            return response.data
        }

    },
)

export const fetchCustomCocktailList = createAsyncThunk(
    "cocktail/fetchCustomCocktailList", async (params: FilterParamType | null) => {
        if (!params) {
            const response = await axios.get(`/api/v1/cocktails/?type=custom`);
            console.log(response.data)
            return response.data
        }
        else {
            const response = await axios.get(`/api/v1/cocktails/?type=custom`,
                {
                    params: params
                }
            );
            console.log(response.data)
            return response.data
        }

    },
)

export const fetchMyCocktailList = createAsyncThunk(
    "cocktail/fetchMyCocktailList", async () => {
        const response = await axios.get('/api/v1/cocktails/me');
        return response.data
    },
)

export const getCocktail = createAsyncThunk(
    "cocktail/getCocktail",
    async (id: CocktailItemType["id"]) => {
        const ingredient_response = await axios.get(`/api/v1/cocktails/${id}/ingredients`)
        console.log(ingredient_response.data)

        const response = await axios.get(`/api/v1/cocktails/${id}`)
        console.log(response.data)

        return { ...response.data, ingredients: ingredient_response.data };
    }
)

export const postCocktail = createAsyncThunk(
    "cocktail/postCocktail",
    async (cocktail: Omit<CocktailDetailType, "id"|"type"|"created_at"|"updated_at"|"rate"|"is_bookmarked">, { dispatch }) => {
        const response = await axios.post<CocktailDetailType>('/api/v1/cocktails/', cocktail);
        dispatch(cocktailActions.addCocktail(response.data));
        return response.data
    }
)

export const editCocktail = createAsyncThunk(
    "cocktail/editCocktail",
    async (cocktail: Omit<CocktailDetailType, "type"|"created_at"|"updated_at"|"rate"|"is_bookmarked">, { dispatch }) => {
        const response = await axios.put<CocktailDetailType>(`/api/v1/cocktails/${cocktail.id}/`, cocktail);
        console.log(response.data);
        dispatch(cocktailActions.editCocktail(response.data));
        return response.data
    }
)

export const toggleBookmark = createAsyncThunk(
    "cocktail/toggleBookmark",
   async (cocktail_id:number) => {
        await axios.put(`/api/v1/bookmark/cocktails/${cocktail_id}/`,{
            headers: {
                'X-csrftoken': 'eR4TF9Bfxq6jxjl1v5Hqi9YmEW7DUkpx'
            }
        });
        return {cocktail_id: cocktail_id}
   }
)

export const cocktailSlice = createSlice({
    name: "cocktail",
    initialState,
    reducers: {
        addCocktail: (state, action: PayloadAction<CocktailDetailType>) => {
            state.cocktailList.push(action.payload)
        },
        editCocktail: (state, action: PayloadAction<CocktailDetailType>) => {
            const editted = state.cocktailList.map((cocktail) => {
                if (cocktail.id === action.payload.id) {
                    return { ...cocktail, name: action.payload.name, image: action.payload.image, tags: action.payload.tags };
                } else {
                    return cocktail;
                }
            });
            state.cocktailList = editted;
        },
    },
    extraReducers: (builder) => {
        //CustomCocktailList
        builder.addCase(fetchCustomCocktailList.fulfilled, (state, action) => {
            state.cocktailList = action.payload.cocktails;
            state.listStatus = "success";
        });
        builder.addCase(fetchCustomCocktailList.pending, (state, action) => {
            state.listStatus = "loading";
        });
        builder.addCase(fetchCustomCocktailList.rejected, (state, action) => {
            state.listStatus = "failed";
        });
        //StandardCocktailList
        builder.addCase(fetchStandardCocktailList.fulfilled, (state, action) => {
            state.cocktailList = action.payload.cocktails;
            state.listStatus = "success";
        });
        builder.addCase(fetchStandardCocktailList.pending, (state, action) => {
            state.listStatus = "loading";
        });
        builder.addCase(fetchStandardCocktailList.rejected, (state, action) => {
            state.listStatus = "failed";
        });

        //MyCocktailList
        builder.addCase(fetchMyCocktailList.fulfilled, (state, action) => {
            state.cocktailList = action.payload.cocktails;
            state.listStatus = "success";
        });
        builder.addCase(fetchMyCocktailList.pending, (state, action) => {
            state.listStatus = "loading";
        });
        builder.addCase(fetchMyCocktailList.rejected, (state, action) => {
            state.listStatus = "failed";
        });

        //CocktailItem
        builder.addCase(getCocktail.fulfilled, (state, action) => {
            state.cocktailItem = action.payload;
            state.itemStatus = "success";
        });
        builder.addCase(getCocktail.pending, (state, action) => {
            state.itemStatus = "loading";
        });
        builder.addCase(getCocktail.rejected, (state, action) => {
            state.itemStatus = "failed";
        });

        //Bookmark
        builder.addCase(toggleBookmark.fulfilled, (state, action) => {
            state.cocktailList.forEach((c, i) => {
                if(c.id === action.payload.cocktail_id){
                    state.cocktailList[i].is_bookmarked = !state.cocktailList[i].is_bookmarked
                }
            })

            if(state.cocktailItem && state.cocktailItem.id === action.payload.cocktail_id){
                state.cocktailItem.is_bookmarked = !state.cocktailItem.is_bookmarked
            }
        })
    },
})
export const cocktailActions = cocktailSlice.actions;
export const selectCocktail = (state: RootState) => state.cocktail;

export default cocktailSlice.reducer;