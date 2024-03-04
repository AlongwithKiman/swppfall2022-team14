import React, { useState } from "react";
import { SetStateAction, Dispatch, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../store";
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
  const [showMessage, setShowMessage] = useState<boolean>(false);

  const handleAsk = () => {
    console.log("사용자가 입력한 칵테일 느낌:", cocktailFeel);
    setShowMessage(true);
    setTimeout(() => {
      setShowMessage(false);
    }, 3000); // 3초 후에 메시지를 감춤
    // TODO: 서버 요청 및 로직 추가
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
        {showMessage && (
          <Typography textAlign="center">서버 재정비 후 돌아올게요!</Typography>
        )}
      </Stack>
    </Modal>
  );
};

export default AIRecommendModal;
