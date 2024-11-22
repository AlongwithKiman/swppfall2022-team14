import {SetStateAction, Dispatch, useEffect} from 'react';
import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {fetchMyIngredientList, selectIngredient} from '../../store/slices/ingredient/ingredient';
import IngredientItem from '../../common/Components/IngredientItem';
import Modal from '@mui/material/Modal';
import { Grid, Stack, Typography } from "@mui/material";
import {selectUser} from "../../store/slices/user/user";
import {AppDispatch} from "../../store";

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '80%',
    height: '80%',
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 3,
    overflow: 'scroll',
};

export interface prop {
    isOpen: boolean;
    setIsOpen: Dispatch<SetStateAction<boolean>>;
}

const InitMyLiqourModal = (props: prop) => {

    const { isOpen, setIsOpen } = props;
    const ingredientState = useSelector(selectIngredient)
    const userState = useSelector(selectUser)
    const dispatch = useDispatch<AppDispatch>()

    useEffect(() => {
        if (userState.isLogin && userState.user?.id !== null) {
            dispatch(fetchMyIngredientList(userState.token))
        }

    }, [])

    return (
        <Modal 
            open={isOpen} 
            onClose={() => setIsOpen(false)}
        >
            <Stack sx={style}>
            <Typography
                variant="h3"
                sx={(theme) => ({
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    textAlign: "center",
                    mt: 1, // 위쪽 여백
                    mb: 2, // 아래쪽 여백 (필요에 따라 조정)
                    [theme.breakpoints.down("md")]: {
                    fontSize: 30,
                    },
                    [theme.breakpoints.down("sm")]: {
                    fontSize: 20,
                    },
                })}
                >
                내 재료 목록
            </Typography>


                <Grid container columns={4} spacing={3}>
                    {ingredientState.myIngredientList.map(ingredient => (
                        <Grid key={ingredient.id} item md={1} sm={2} xs={4}>
                            <IngredientItem 
                                key={ingredient.id} 
                                image={ingredient.image} 
                                name={ingredient.name} 
                                id={ingredient.id} 
                                ABV={ingredient.ABV} 
                                my_item={true} 
                            />
                        </Grid>
                    ))}
                </Grid>
            </Stack>
        </Modal >
    );
};

export default InitMyLiqourModal;