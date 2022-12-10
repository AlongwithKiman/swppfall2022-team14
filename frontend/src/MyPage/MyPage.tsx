import { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import React from 'react';
import { fetchMyCocktailList } from "../store/slices/cocktail/cocktail"
import { useDispatch, useSelector } from "react-redux"
import { AppDispatch } from "../store"
import styles from "./MyPage.module.scss"
import '../ListPage/ListPage.scss'
import MyIngredient from "./MyIngredient";
import MyBookmark from "./MyBookmark";
import MyCustomCocktail from "./MyCustomCocktail";
import MyComment from "./MyComment";
import MyInfo from "./MyInfo";
import NavBar from "../NavBar/NavBar";
import { selectUser } from "../store/slices/user/user";
import { fetchIngredientList, fetchMyIngredientList } from "../store/slices/ingredient/ingredient";
import { Divider, ToggleButtonGroup, ToggleButton, Stack } from "@mui/material";

interface ButtonInfo {
    name: string;
    value: string;
    component: JSX.Element;
}

const MyPage = () => {

    const buttonList: ButtonInfo[] = [
        { name: '나의 술장', value: 'My Ingredient', component: <MyIngredient /> },
        { name: '나만의 칵테일', value: 'My Custom Cocktail', component: <MyCustomCocktail /> },
        { name: '즐겨찾기', value: 'My Favorites', component: <MyBookmark /> },
        { name: '나의 댓글', value: 'My Comments', component: <MyComment /> },
        { name: '나의 정보', value: 'Info', component: <MyInfo /> }
    ]
    const [toggle, setToggle] = useState<string>(buttonList[0].value)
    
    const userState = useSelector(selectUser)
    const navigate = useNavigate()
    const dispatch = useDispatch<AppDispatch>()
    useEffect(() => {

        dispatch(fetchIngredientList())
        if (!userState.isLogin) {
            navigate(-1)
            console.log("먼저 로그인 해주세요")
        }
        else dispatch(fetchMyIngredientList(userState.token))

        if (userState.isLogin && userState.token) {
            dispatch(fetchMyCocktailList(userState.token))
        }
    }, [])

<<<<<<< HEAD
    const buttonList: ButtonInfo[] = [{ name: 'My Ingredient', component: <MyIngredient /> },
    { name: 'My Custom Cocktail', component: < MyCustomCocktail /> },
    { name: 'My Favorites', component: <MyBookmark /> },
    { name: 'My Comments', component: <MyComment /> },
    { name: 'Info', component: <MyInfo /> }]

    const [buttonClickState, setButtonClickState] = useState<string>("My Ingredient")
    const onButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        setButtonClickState(e.currentTarget.name)
    }

    return <div className={styles.main}>
        <div className="list__navbar">
            {/*<NavBar />*/}
        </div>
        <div className={styles.left}>
            {buttonList.map((button) => <button key={button.name} name={button.name} onClick={onButtonClick} disabled={buttonClickState === button.name}>{button.name}</button>)}
        </div>
        <div className={styles.right}>
            <div className={styles.right__inner}>
                {/* 클릭된 버튼의 name으로 buttonList에서 component를 찾아 Render
                    추후 항목이 추가되면 buttonList를 수정하면 됨.*/}
                {buttonList.filter(button => button.name == buttonClickState)[0].component}
            </div>
        </div>
    </div >
=======
    return (
        <Stack direction="row" justifyContent="space-between" divider={<Divider orientation="vertical" flexItem />}>
            <NavBar />
            <Stack alignItems="flex-start" spacing={2} sx={{ width: 1, p: 3 }}>
                <Stack direction="row" justifyContent="flex-end" sx={{ width: 1, pr: 3 }}>
                    <ToggleButtonGroup
                        value={toggle}
                        exclusive
                        onChange={(e, t) => setToggle(t)}
                    >
                        {buttonList.map((button) => (
                            <ToggleButton key={button.value} value={button.value}>
                                {button.name}
                            </ToggleButton>
                        ))}
                    </ToggleButtonGroup>
                </Stack>
                {buttonList.find(button => button.value === toggle)?.component}
            </Stack>
        </Stack >
    )
>>>>>>> c88171a (feat: Design add ingredient modal)
}


export default MyPage