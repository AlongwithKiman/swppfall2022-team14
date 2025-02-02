import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Filter from "./Components/Filter";
import Item from "../common/Components/Item";
import React from "react";
import LoginModal from "./Modals/LoginModal";
import InitMyLiqourModal from "./Modals/InitMyLiquorModal";
import {
  fetchCustomCocktailList,
  fetchStandardCocktailList,
  selectCocktail,
} from "../store/slices/cocktail/cocktail";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser, selectUser } from "../store/slices/user/user";
import { AppDispatch } from "../store";
import RecommendModal from "./Modals/RecommendModal";
import { styled } from "@mui/material/styles";
import {
  Box,
  Grid,
  IconButton,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ToggleButtonGroup,
  ToggleButton,
  TextField,
  Stack,
  Typography,
} from "@mui/material";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import SearchIcon from "@mui/icons-material/Search";
import LiquorIcon from "@mui/icons-material/Liquor";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import LocalBarIcon from "@mui/icons-material/LocalBar";
import { useSearchParams } from "react-router-dom";
import AIRecommendModal from "./Modals/AIRecommendModal";

const StyledItem = styled(ListItemButton)({
  position: "relative",
  justifyContent: "center",
  gap: 10,
});

const StyledItemIcon = styled(ListItemIcon)({
  width: 22,
  height: 22,
  color: "inherit",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minWidth: 10,
});

export interface Filterparam {
  type_one: string[];
  type_two: string[];
  type_three: string[];
  available_only: boolean;
  color: string | null;
}

const InitPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const cocktailState = useSelector(selectCocktail);
  const userState = useSelector(selectUser);
  const dispatch = useDispatch<AppDispatch>();

  const loginState = userState.isLogin;
  const [filterParam, setFilterParam] = useState<Filterparam>({
    type_one: [],
    type_two: [],
    type_three: [],
    available_only: false,
    color: "000000",
  });
  const [input, setInput] = useState("");

  const request_param = { filter_param: filterParam, name_param: input };

  const navigate = useNavigate();

  const [toggle, setToggle] = useState<
    "standard" | "custom" | "ingredient" | "recommendation"
  >("standard");
  const [isStandard, setIsStandard] = useState(
    searchParams.get("type") === "custom"
  );
  const [isOpenFilter, setIsOpenFilter] = useState(false);
  const onClickFilter = () => {
    setIsOpenFilter(!isOpenFilter);
  };
  const [isOpenProfile, setisOpenProfile] = useState(false); // 프로필 클릭 시 나오는 버튼 handle
  const onClickProfile = () => {
    setisOpenProfile(!isOpenProfile);
  };

  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const onClickLogin = () => {
    setIsLoginOpen(true);
  };
  const [isInitMyLiqourOpen, setIsInitMyLiqourOpen] = useState(false);
  const onClickMyLiqour = () => {
    if (userState.isLogin && userState.user?.id !== null) {
      setIsInitMyLiqourOpen(true);
    } else {
      setIsLoginOpen(true);
    }
  };
  const onClickLogout = async () => {
    await dispatch(logoutUser(userState.token));
    location.reload();
  };
  const onClickSearch = () => {
    // TODO : give params with filter information
    if (searchParams.get("type") === "custom") {
      navigate(`/custom`, { state: request_param });
    } else {
      navigate(`/standard`, { state: request_param });
    }
  };

  const onClickToggle = (
    event: React.MouseEvent<HTMLElement>,
    toggle: "standard" | "custom" | "ingredient" | null
  ) => {
    if (toggle === null) return;

    if (toggle === "standard") {
      setToggle(toggle);
      setIsStandard(true);
      setSearchParams({ type: "" });
    } else if (toggle === "custom") {
      setToggle(toggle);
      setIsStandard(false);
      setSearchParams({ type: "custom" });
    } else if (toggle === "ingredient") {
      onClickIngredientRecommendButton();
    } else if (toggle === "recommendation") {
      onClickAIRecommendButton();
    }
  };

  const onClickMyPage = () => {
    navigate(`/mypage`);
  };

  const [isIngredientRecommendOpen, setIsIngredientRecommendOpen] =
    useState(false);

  const [isAIRecommendOpen, setIsAIRecommendOpen] = useState(false);

  const onClickIngredientRecommendButton = () => {
    if (userState.isLogin) {
      setIsIngredientRecommendOpen(true);
    } else {
      setIsLoginOpen(true);
    }
  };

  const onClickAIRecommendButton = () => {
    if (userState.isLogin) {
      setIsAIRecommendOpen(true);
    } else {
      setIsLoginOpen(true);
    }
  };

  useEffect(() => {
    const type = searchParams.get("type");
    if (type == "custom") {
      setToggle("custom");
      dispatch(
        fetchCustomCocktailList({ params: null, token: userState.token })
      );
    } else {
      setToggle("standard");
      dispatch(
        fetchStandardCocktailList({ params: null, token: userState.token })
      );
    }
  }, [searchParams, loginState]);

  return (
    <Stack
      spacing={2}
      sx={(theme) => ({
        width: 1,
        pl: 2,
        pr: 3,
        py: 2,
        [theme.breakpoints.down("sm")]: {
          pl: 0,
          pr: 1,
        },
      })}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="flex-start"
      >
        <LocalBarIcon
          sx={(theme) => ({
            [theme.breakpoints.up("md")]: {
              mt: 1,
              ml: 13,
              fontSize: 50,
            },
            [theme.breakpoints.down("md")]: {
              mt: 1.25,
              ml: 3,
              fontSize: 40,
            },
            [theme.breakpoints.down("sm")]: {
              mt: 1,
              ml: 3,
              fontSize: 30,
            },
          })}
        />
        <Typography
          variant="h3"
          sx={(theme) => ({
            [theme.breakpoints.up("md")]: {
              mt: 1,
              ml: 7,
            },
            [theme.breakpoints.down("md")]: {
              mt: 1.5,
              ml: 13,
              fontSize: 30,
            },
            [theme.breakpoints.down("sm")]: {
              mt: 1.25,
              ml: 6,
              fontSize: 20,
            },
          })}
        >
          A Tipsy Night
        </Typography>
        <Box
          sx={(theme) => ({
            direction: "rtl",
            [theme.breakpoints.up("md")]: {
              display: "flex",
              width: 150,
            },
            [theme.breakpoints.down("md")]: {
              display: "flex",
              width: 150,
            },
            [theme.breakpoints.down("sm")]: {
              display: "block",
              width: 90,
              marginRight: 1,
            },
          })}
        >
          {loginState ? (
            <IconButton
              data-testid="my profile"
              size="large"
              onClick={onClickProfile}
              sx={(theme) => ({
                [theme.breakpoints.down("sm")]: {
                  padding: 1,
                  ml: 10,
                },
              })}
            >
              <AccountCircleIcon
                fontSize="large"
                sx={(theme) => ({
                  [theme.breakpoints.down("sm")]: {
                    fontSize: 25,
                  },
                })}
              />
            </IconButton>
          ) : (
            <IconButton
              data-testid="login"
              onClick={onClickLogin}
              sx={(theme) => ({
                [theme.breakpoints.up("sm")]: {
                  padding: 1,
                  mt: 1,
                  mr: 1,
                },
                [theme.breakpoints.down("sm")]: {
                  padding: 1,
                  ml: 10,
                },
              })}
            >
              <LoginIcon
                sx={(theme) => ({
                  [theme.breakpoints.down("sm")]: {
                    fontSize: 20,
                  },
                })}
              />
            </IconButton>
          )}
          {loginState && isOpenProfile ? (
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              justifyContent="flex-end"
              sx={(theme) => ({
                direction: "ltr",
                [theme.breakpoints.down("sm")]: {
                  mr: 0.25,
                },
              })}
            >
              <IconButton
                data-testid="my page"
                onClick={onClickMyPage}
                sx={(theme) => ({
                  [theme.breakpoints.down("sm")]: {
                    padding: 1,
                    mr: -1,
                  },
                })}
              >
                <PersonOutlineIcon
                  sx={(theme) => ({
                    [theme.breakpoints.down("sm")]: {
                      fontSize: 20,
                    },
                  })}
                />
              </IconButton>
              <IconButton
                data-testid="logout"
                onClick={onClickLogout}
                sx={(theme) => ({
                  [theme.breakpoints.down("sm")]: {
                    padding: 1,
                  },
                })}
              >
                <LogoutIcon
                  sx={(theme) => ({
                    [theme.breakpoints.down("sm")]: {
                      fontSize: 20,
                    },
                  })}
                />
              </IconButton>
            </Stack>
          ) : null}
        </Box>
      </Stack>
      <Grid
        container
        spacing={1}
        columns={2}
        sx={{ width: 1, px: 2 }}
        justifyContent="space-between"
      >
        <Grid item md={1} sm={2} xs={2}>
          <Stack
            direction="row"
            spacing={1}
            justifyContent="flex-start"
            sx={{ width: 1, mt: 1 }}
          >
            <ToggleButtonGroup
              value={toggle}
              exclusive
              onChange={onClickToggle}
            >
              <ToggleButton value="standard">스탠다드</ToggleButton>
              <ToggleButton value="custom">커스텀</ToggleButton>
              <ToggleButton value="ingredient">재료 추천</ToggleButton>
              <ToggleButton value="recommendation">
                AI에게 추천받기
              </ToggleButton>
            </ToggleButtonGroup>
          </Stack>
        </Grid>
        <Grid item md={1} sm={2} xs={2}>
          <Stack
            direction="row"
            spacing={1}
            alignItems="stretch"
            justifyContent="flex-end"
            sx={{ width: 1, height: 1, mt: 1 }}
          >
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Stack
                direction="row"
                alignItems="center"
                sx={{ pl: 2, pr: 1, bgcolor: "primary.main", borderRadius: 4 }}
              >
                <TextField
                  placeholder="검색어"
                  variant="standard"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  sx={{
                    "& label.Mui-focused": {
                      color: "secondary.light",
                    },
                    "& .MuiInput-underline:after": {
                      borderBottomColor: "secondary.light",
                    },
                    "& .MuiOutlinedInput-root": {
                      "&.Mui-focused fieldset": {
                        borderColor: "secondary.light",
                      },
                    },
                  }}
                />
                <IconButton data-testid="search" onClick={onClickSearch}>
                  <SearchIcon />
                </IconButton>
              </Stack>
              <StyledItem
                data-testid="filter"
                onClick={onClickFilter}
                sx={{ px: 2, bgcolor: "primary.main", borderRadius: 4 }}
              >
                <ListItemText
                  disableTypography
                  primary="필터 검색"
                  sx={(theme) => ({
                    [theme.breakpoints.down("md")]: {
                      display: "none",
                    },
                  })}
                />
                <StyledItemIcon>
                  <FilterAltIcon />
                </StyledItemIcon>
              </StyledItem>
            </Stack>
          </Stack>
        </Grid>
      </Grid>
      {isOpenFilter ? (
        <Filter
          setUrlParams={setFilterParam}
          onClickSearch={onClickSearch}
          input={input}
          setInput={setInput}
        />
      ) : null}
      <Grid container spacing={3} columns={15} sx={{ width: 1, pr: 2 }}>
        {cocktailState.cocktailList.map((cocktail) => (
          <Grid key={cocktail.id} item md={3} sm={5} xs={15}>
            <Item
              key={cocktail.id}
              image={cocktail.image}
              name={cocktail.name}
              rate={cocktail.rate}
              type={cocktail.type}
              id={cocktail.id}
              tags={cocktail.tags}
              is_bookmarked={cocktail.is_bookmarked}
              ABV={cocktail.ABV}
              price_per_glass={cocktail.price_per_glass}
            />
          </Grid>
        ))}
      </Grid>
      <IconButton
        data-testid="my liquor"
        onClick={onClickMyLiqour}
        size="large"
        sx={{
          bgcolor: "primary.light",
          position: "fixed",
          right: 50,
          bottom: 50,
        }}
      >
        <LiquorIcon fontSize="large" />
      </IconButton>
      <LoginModal isOpen={isLoginOpen} setIsOpen={setIsLoginOpen} />
      {isInitMyLiqourOpen ? (
        userState.isLogin && userState.user?.id !== null ? (
          <InitMyLiqourModal
            isOpen={isInitMyLiqourOpen}
            setIsOpen={setIsInitMyLiqourOpen}
          />
        ) : null
      ) : null}
      {isIngredientRecommendOpen ? (
        <RecommendModal
          isOpen={isIngredientRecommendOpen}
          setIsOpen={setIsIngredientRecommendOpen}
        />
      ) : null}
      {isAIRecommendOpen ? (
        <AIRecommendModal
          isOpen={isAIRecommendOpen}
          setIsOpen={setIsAIRecommendOpen}
        />
      ) : null}
    </Stack>
  );
};

export default InitPage;
