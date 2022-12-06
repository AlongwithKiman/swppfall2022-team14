import { useState, useEffect } from "react";
import AddIngredientModal from "../CreateCustomPage/Modals/AddIngredientModal"
import { useNavigate, useParams } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../store";
import { CocktailDetailType, IngredientPrepareType, editCocktail, getCocktail, selectCocktail, PostForm } from "../store/slices/cocktail/cocktail";
import './EditCustomPage.scss';
import React from 'react';
import { IngredientType } from "../store/slices/ingredient/ingredient";
import { selectUser } from "../store/slices/user/user";
import { calculateABV, calculateColor, calculatePrice } from "../common/utils/utils";

export default function EditCustomPage() {
    const { id } = useParams();

    const [name, setName] = useState<string>("");
    const [nameEng, setNameEng] = useState<string>("");
    const [introduction, setIntroduction] = useState<string>("");
    const [recipe, setRecipe] = useState<string>("");
    const [tagList, setTagList] = useState<string[]>([]);
    const [tagItem, setTagItem] = useState<string>("");
    const [expectedABV, setExpectedABV] = useState<number>(123);  // Temporary
    const [expectedPrice, setExpectedPrice] = useState<number>(0);  // Temporary
    const [expectedColor, setExpectedColor] = useState<string>('');

    const [ingredientList, setIngredientList] = useState<IngredientPrepareType[]>([]);
    const [isOpen, setOpen] = useState(false);
    const [newIngredient, setNewIngredient] = useState<IngredientType | null>(null);
    const [unitList, setUnitList] = useState<string[]>([]);
    const [newUnit, setNewUnit] = useState<string | null>(null);

    const cocktailState = useSelector(selectCocktail);
    const cocktail = cocktailState.cocktailItem;
    const dispatch = useDispatch<AppDispatch>();
    const userState = useSelector(selectUser)

    useEffect(() => {
        if (!userState.isLogin) {
            navigate(-1)
            console.log("먼저 로그인 해주세요")
        }
        else {
            dispatch(getCocktail(Number(id)));
        }
    }, []);

    // INITIALIZE
    useEffect(() => {
        if (cocktail) {
            setName(cocktail.name);
            setIntroduction(cocktail.introduction);
            setRecipe(cocktail.recipe);
            setTagList(cocktail.tags);
            setUnitList(cocktail.ingredients.map(ingredient => ingredient.recipe_unit))
            setNameEng(cocktail.name_eng);
            setIngredientList(cocktail.ingredients);
            console.log(cocktail.ingredients)
        }
    }, [cocktail]);


    const navigate = useNavigate();
    const onClickIngredientDelete = (selectedIdx: number) => {
        setIngredientList(ingredientList.filter((_value, idx) => idx !== selectedIdx));
        setUnitList(unitList.filter((_value, idx) => idx !== selectedIdx))
    };

    useEffect(() => {
        if (newIngredient && newUnit) {
            setIngredientList([...ingredientList, { ...newIngredient, amount: "", recipe_unit: "" }]);
            setNewIngredient(null);
            setUnitList([...unitList, newUnit])
            setNewUnit(null)
        }
    }, [newIngredient, newUnit])

    const onChangeAmount = (selectedIdx: number, changedAmount: string) => {
        if (changedAmount[0] === "0" || changedAmount[0] === "-") return
        setIngredientList(
            ingredientList.map((ingredient, idx) => {
                if (idx !== selectedIdx) {
                    return ingredient;
                } else {
                    return { ...ingredient, amount: changedAmount } as IngredientPrepareType;
                }
            })
        );
    };

    const onChangeIngredientUnit = (selectedIdx: number, unit: string) => {
        const units = unitList
        units[selectedIdx] = unit
        setUnitList(units)
    }

    const onKeyPress = (e: React.KeyboardEvent<HTMLElement>) => {
        if (tagItem.length !== 0 && e.key === 'Enter') {
            submitTagItem()
        }
    }

    const submitTagItem = () => {
        const updatedTagList = [...tagList]
        updatedTagList.push(tagItem)

        setTagList(updatedTagList)
        setTagItem("")
    }

    const onDeleteTagItem = (deletedTagItem: string) => {
        setTagList(tagList.filter(tagItem => tagItem !== deletedTagItem))
    }

    useEffect(() => {
        setExpectedABV(calculateABV(ingredientList, unitList))
        setExpectedPrice(calculatePrice(ingredientList, unitList))
        setExpectedColor(calculateColor(ingredientList, unitList))
        console.log(expectedABV, expectedPrice, expectedColor)
    }, [unitList, ingredientList])

    const editCocktailHandler = async () => {
        if (userState.user?.id !== null && userState.token !== null) {
            const ingredients = ingredientList.map((ingr, ind) => {
                return { ...ingr, amount: ingr.amount, unit: unitList[ind] }
            })
            const data: PostForm = {
                cocktail: {
                    name: name,
                    name_eng: nameEng,
                    image: "https://izzycooking.com/wp-content/uploads/2021/05/White-Russian-683x1024.jpg",
                    introduction: introduction,
                    recipe: recipe,
                    ABV: expectedABV,
                    color: expectedColor,
                    price_per_glass: expectedPrice,
                    tags: tagList,
                    author_id: Number(userState.user?.id),
                    ingredients: ingredients,
                },
                token: userState.token
            }
            console.log(data)
            const response = await dispatch(editCocktail({ data: data, id: Number(id) }))
            navigate(`/custom/${(response.payload as CocktailDetailType).id}`)
        }
    }

    if (cocktailState.itemStatus == "loading") {
        return <div>Loading ..</div>
    }
    else if (cocktailState.itemStatus == "failed" || !cocktail) {
        return <div>Non existing cocktail</div>
    }
    else {
        return (
            <div className="item-detail">
                <div className="title">
                    <div className="title__name">
                        <label>
                            Name:
                            <input className='title__name-input' value={name} onChange={(e) => setName(e.target.value)} />
                        </label>
                        <label>
                            영어 이름(선택):
                            <input className='title__name-input' value={nameEng} onChange={(e) => setNameEng(e.target.value)} />
                        </label>
                    </div>
                    <button className="title__confirm-button"
                        onClick={() => editCocktailHandler()}>Confirm</button>
                </div>
                <div className="content">
                    <img
                        className="content__image"
                        src="https://izzycooking.com/wp-content/uploads/2021/05/White-Russian-683x1024.jpg"
                    />
                    <div className="content__description-box">
                        <p className="content__abv"> {isNaN(expectedABV) ? "재료를 입력하여 예상 도수를 알아보세요." : `Expected ${expectedABV}% ABV`} </p>
                        <div className='content__description'>
                            <label>
                                Description:<br />
                                <textarea className='content__description-input' value={introduction} onChange={(e) => setIntroduction(e.target.value)} />
                            </label>
                        </div>
                        <div className="content__ingredient-box">
                            Ingredient:
                            {[...ingredientList, { name: "", amount: undefined, unit: [""], recipe_unit: "" }].map((ingredient, idx) => {
                                return (
                                    <div className="content__ingredient" key={`${ingredient.name}_${idx}`}>
                                        <input
                                            data-testid="ingredientInput"
                                            className="content__ingredient-name"
                                            onClick={() => (idx === ingredientList.length) && setOpen(true)}
                                            value={ingredient.name}
                                            readOnly
                                        />
                                        <AddIngredientModal
                                            isOpen={isOpen}
                                            close={() => setOpen(false)}
                                            addedIngredientList={ingredientList.map((ingredient) => { return ingredient.name })}
                                            setNewIngrdient={setNewIngredient}
                                            setDefaultUnit={setNewUnit}
                                        />
                                        <input
                                            data-testid="ingredientAmountInput"
                                            className="content__ingredient-input"
                                            value={ingredient.amount ?? ""}
                                            type="number"
                                            onChange={(event) => {
                                                onChangeAmount(idx, event.target.value);
                                                setExpectedABV(calculateABV(ingredientList, unitList));
                                                setExpectedPrice(calculatePrice(ingredientList, unitList));
                                                setExpectedColor(calculateColor(ingredientList, unitList));
                                            }}
                                            min="0"
                                        />
                                        <select
                                            data-testid="ingredientUnitSelect"
                                            onChange={(e) => {
                                                onChangeIngredientUnit(idx, e.target.value);
                                                setExpectedABV(calculateABV(ingredientList, unitList));
                                                setExpectedPrice(calculatePrice(ingredientList, unitList));
                                                setExpectedColor(calculateColor(ingredientList, unitList));
                                            }} defaultValue={ingredient.recipe_unit}>
                                            {ingredient.unit.map((u) => {
                                                return <option
                                                    key={"key" + u}
                                                    value={u}
                                                >
                                                    {u}
                                                </option>
                                            })}
                                        </select>
                                        {idx !== ingredientList.length &&
                                            <button
                                                data-testid="ingredientDeleteButton"
                                                className="content__ingredient-delete-button"
                                                onClick={() => onClickIngredientDelete(idx)}
                                            >
                                                Delete
                                            </button>
                                        }
                                    </div>
                                )
                            })}
                        </div>
                        <div className='content__recipe'>
                            <label>
                                Recipe:<br />
                                <textarea className='content__recipe-input' value={recipe} onChange={(e) => setRecipe(e.target.value)} />
                            </label>
                        </div>
                        <div className='content__tag-box'>
                            Tag: <br />
                            <div className='content__tag-inner-box'>
                                {tagList.map((tagItem, idx) => {
                                    return (
                                        <div className="content__tag" key={`${tagItem}_${idx}`}>
                                            <span>{tagItem}</span>
                                            <button
                                                data-testid="tagDeleteButton"
                                                className="content__tag-delete-button"
                                                onClick={() => onDeleteTagItem(tagItem)}
                                            >
                                                X
                                            </button>
                                        </div>
                                    )
                                })}
                                <input
                                    data-testid="tagInput"
                                    className='content__tag-input'
                                    type="text"
                                    placeholder='Press enter to add tags'
                                    onChange={e => setTagItem(e.target.value)}
                                    value={tagItem}
                                    onKeyPress={onKeyPress}
                                />
                            </div>
                        </div>
                        <p className="content__price">예상 가격: {expectedPrice}원</p>
                        예상 색깔: <div className="content__color" style={{ "backgroundColor": `#${expectedColor}` }}></div>
                    </div>
                </div>
            </div>
        )
    }
}