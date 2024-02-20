import { SetStateAction, Dispatch, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../store";
import React from "react";
import {
  getRecommendIngredientList,
  selectIngredient,
  postMyIngredients,
} from "../../store/slices/ingredient/ingredient";
import { selectUser } from "../../store/slices/user/user";
import { useNavigate } from "react-router";
import Modal from "@mui/material/Modal";
import {
  Box,
  Button,
  Card,
  FormGroup,
  Grid,
  IconButton,
  ImageListItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "80%",
  height: "40%",
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 3,
  overflow: "scroll",
};

export interface prop {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}

const AIRecommendModal = (props: prop) => {
  const { isOpen, setIsOpen } = props;
  const dispatch = useDispatch<AppDispatch>();
  const userState = useSelector(selectUser);

  const [cocktailFeel, setCocktailFeel] = useState<string>("");
  const handleAsk = () => {
    console.log("사용자가 입력한 칵테일 느낌:", cocktailFeel);
    // TODO
  };

  useEffect(() => {
    if (userState.isLogin && userState.user?.id !== null) {
      dispatch(getRecommendIngredientList(userState.token));
    }
  }, [isOpen]);

  return (
    <Modal open={isOpen} onClose={() => setIsOpen(false)}>
      <Stack spacing={2} sx={style}>
        <TextField
          label="원하는 칵테일의 느낌을 줄글로 표현해주세요"
          variant="outlined"
          fullWidth
          value={cocktailFeel}
          onChange={(e) => setCocktailFeel(e.target.value)}
        />
        <Button variant="contained" onClick={handleAsk}>
          AI에게 추천받기
        </Button>
      </Stack>
    </Modal>
  );
};

export default AIRecommendModal;
