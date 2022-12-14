import { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import React from 'react';
import { fetchMyCocktailList } from "../store/slices/cocktail/cocktail"
import { useDispatch, useSelector } from "react-redux"
import { AppDispatch } from "../store"
import '../ListPage/ListPage.scss'
import MyIngredient from "./MyIngredient";
import MyBookmark from "./MyBookmark";
import MyCustomCocktail from "./MyCustomCocktail";
import MyComment from "./MyComment";
import MyInfo from "./MyInfo";
import { selectUser } from "../store/slices/user/user";
import { fetchIngredientList, fetchMyIngredientList } from "../store/slices/ingredient/ingredient";
import { ToggleButtonGroup, ToggleButton, Stack } from "@mui/material";

interface ButtonInfo {
    name: string;
    value: string;
    component: JSX.Element;
}

const MyPage = () => {

    const [isOpen, setIsOpen] = useState(false)

    const buttonList: ButtonInfo[] = [
        { name: '나의 술장', value: 'My Ingredient', component: <MyIngredient /> },
        { name: '나만의 칵테일', value: 'My Custom Cocktail', component: <MyCustomCocktail /> },
        { name: '즐겨찾기', value: 'My Favorites', component: <MyBookmark /> },
        { name: '나의 댓글', value: 'My Comments', component: <MyComment /> },
        { name: '나의 정보', value: 'Info', component: <></> }
    ]
    const [toggle, setToggle] = useState<string>(buttonList[0].value)
    
    const userState = useSelector(selectUser)
    const navigate = useNavigate()
    const dispatch = useDispatch<AppDispatch>()

    useEffect(() => {

        dispatch(fetchIngredientList(null))
        if (!userState.isLogin) {
            navigate(-1)
            alert("먼저 로그인 해주세요")
        }
        else dispatch(fetchMyIngredientList(userState.token))

        if (userState.isLogin && userState.token) {
            dispatch(fetchMyCocktailList(userState.token))
        }
    }, [])

    const onClickToggle = (
        event: React.MouseEvent<HTMLElement>,
        toggle: string | null,
    ) => {
        if (toggle === null) return;

        if (toggle !== buttonList[4].value) {
            setToggle(toggle);
        } else {
            setIsOpen(true);
        }
    }

    return (
        <>
            {/*<NavBar />*/}
            <Stack alignItems="flex-start" spacing={2} sx={{ width: 1, p: 3 }}>
                <Stack 
                    direction="row" justifyContent="flex-end" 
                    sx={(theme) => ({ 
                        width: 1, pr: 3,
                        [theme.breakpoints.down('md')]: {
                            pr: 1
                        },
                        })}
                    >
                    <ToggleButtonGroup
                        value={toggle}
                        exclusive
                        onChange={onClickToggle}
                    >
                        {buttonList.map((button) => (
                            <ToggleButton key={button.value} value={button.value}>
                                {button.name}
                            </ToggleButton>
                        ))}
                    </ToggleButtonGroup>
                </Stack>
                {buttonList.find(button => button.value === toggle)?.component}
                <MyInfo open={isOpen} onClose={() => setIsOpen(false)} />
            </Stack>
        </>
    )
}


export default MyPage