import { useState, useEffect } from "react";
import AddIngredientModal from "../CreateCustomPage/Modals/AddIngredientModal"
import { useNavigate, useParams } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../store";
import { CocktailDetailType, IngredientPrepareType, editCocktail, getCocktail, selectCocktail, PostForm } from "../store/slices/cocktail/cocktail";
import './EditCustomPage.scss';
import NavBar from "../NavBar/NavBar";
import React from 'react';
import { IngredientType } from "../store/slices/ingredient/ingredient";
import { selectUser } from "../store/slices/user/user";
import { calculateABV, calculateColor, calculatePrice } from "../common/utils/utils";
import S3 from 'react-aws-s3-typescript'
import {v4 as uuid} from 'uuid'
import { Button, ImageListItem, ImageListItemBar, Divider, IconButton, Box, MenuItem, Stack, TextField, Typography } from "@mui/material";
import FileUploadIcon from '@mui/icons-material/FileUpload';
import RemoveIcon from '@mui/icons-material/Remove';

export interface Image {
    key:string;
    url:string;
}

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

    const cocktailState = useSelector(selectCocktail);
    const cocktail = cocktailState.cocktailItem;
    const [image, setImage] = useState<Image|null>(null);
    const dispatch = useDispatch<AppDispatch>();
    const userState = useSelector(selectUser)

    useEffect(() => {
        if (!userState.isLogin) {
            navigate(-1)
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
            setNameEng(cocktail.name_eng);
            setIngredientList(cocktail.ingredients);
            const url = cocktail.image.split('/')
            const key = url[url.length-2] + url[url.length-1].split('.')[0]
            setImage({url: cocktail.image, key: key});
        }
    }, [cocktail]);


    const navigate = useNavigate();
    const onClickIngredientDelete = (selectedIdx: number) => {
        setIngredientList(ingredientList.filter((_value, idx) => idx !== selectedIdx));
    };

    useEffect(() => {
        if (newIngredient) {
            setIngredientList([...ingredientList, { ...newIngredient, amount: "", recipe_unit: newIngredient.unit[0] }]);
            setNewIngredient(null);
        }
    }, [newIngredient])

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

    const onChangeIngredientUnit = (selectedIdx: number, changedUnit: string) => {
        setIngredientList(
            ingredientList.map((ingredient, idx) => {
                if (idx !== selectedIdx) {
                    return ingredient;
                } else {
                    return { ...ingredient, recipe_unit: changedUnit } as IngredientPrepareType;
                }
            })
        );
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
        setExpectedABV(calculateABV(ingredientList))
        setExpectedPrice(calculatePrice(ingredientList))
        setExpectedColor(calculateColor(ingredientList))
    }, [ingredientList])

    const editCocktailHandler = async () => {
        if (name === ""){
            window.alert("칵테일의 이름을 입력해주세요.")
            return
        }else if(introduction === ""){
            window.alert("칵테일의 설명을 입력해주세요.")
            return    
        }else if(recipe === ""){
            window.alert("칵테일의 만드는 방법을 입력해주세요.")
            return
        }else if(ingredientList.length === 0){
            window.alert("칵테일의 재료를 추가해주세요.")
            return
        }else if(ingredientList.find(ingre => ingre.amount === '')){
            window.alert("칵테일 재료의 양을 기재해주세요.")
            return
        }
        if (userState.user?.id !== null && userState.token !== null) {
            const ingredients = ingredientList.map((ingr, ind) => {
                return { ...ingr, amount: ingr.amount, unit: ingr.recipe_unit }
            })
            const data: PostForm = {
                cocktail: {
                    name: name,
                    name_eng: (nameEng) ? nameEng : null,
                    image: (image)? image.url:"https://izzycooking.com/wp-content/uploads/2021/05/White-Russian-683x1024.jpg",
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
            const response = await dispatch(editCocktail({ data: data, id: Number(id) }))
            if (response.type === `${editCocktail.typePrefix}/fulfilled`) {
                navigate(`/custom/${(response.payload as CocktailDetailType).id}`)        
            }else{
                if(response.payload === 9001){
                    window.alert("중복되는 칵테일 이름입니다.")
                }
                else if(response.payload === 9002){
                    window.alert("중복되는 칵테일 영어 이름입니다.")
                }
            }        }
    }

    const S3_config = {
        bucketName: process.env.REACT_APP_BUCKET_NAME!,
        region: "ap-northeast-2",
        accessKeyId: process.env.REACT_APP_ACCESS!,
        secretAccessKey: process.env.REACT_APP_SECRET!,
    }

    const handleSelectFile = async (e:React.ChangeEvent<HTMLInputElement>) => {
        if(e.target.files){
            const file = e.target.files[0]
            if (file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/jpg') {
                const S3Client = new S3(S3_config)
                // delete previous image
                if(image !== null){
                    await S3Client.deleteFile(image.key)
                }
                
                // upload file and setImage(S3 Link)
                const fileName = 'cocktail' + '/' + uuid()
                const response = await S3Client.uploadFile(file, fileName)
                if(response.status == 204){
                    setImage({key: response.key, url: response.location})
                }
            }else{
                alert('이미지 파일(jpeg, png, jpg)만 업로드 가능합니다.')
                e.target.files=null
            }
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
            <>
                {/*<NavBar />*/}
                <Stack alignItems="flex-start" spacing={2} sx={{ width: 1, p: 3 }}>
                    <TextField 
                        label="칵테일 이름" 
                        variant="standard" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)}
                        sx={{
                            '& label.Mui-focused': {
                                color: 'secondary.light',
                            },
                            '& .MuiInput-underline:after': {
                                borderBottomColor: 'secondary.light',
                            },
                            '& .MuiOutlinedInput-root': {
                                '&.Mui-focused fieldset': {
                                    borderColor: 'secondary.light',
                                },
                            },
                        }}
                    />
                    <Stack direction="row" justifyContent="space-between" sx={{ width: 1 }}>
                        <TextField 
                            label="영어 이름 (선택)" 
                            variant="standard" 
                            size="small"
                            value={nameEng} 
                            onChange={(e) => setNameEng(e.target.value)}
                            sx={{
                                '& label.Mui-focused': {
                                    color: 'secondary.light',
                                },
                                '& .MuiInput-underline:after': {
                                    borderBottomColor: 'secondary.light',
                                },
                                '& .MuiOutlinedInput-root': {
                                    '&.Mui-focused fieldset': {
                                        borderColor: 'secondary.light',
                                    },
                                },
                            }}
                        />
                        <Button variant="contained" onClick={editCocktailHandler}
                            sx={{
                                bgcolor: 'primary.dark',
                                borderRadius: 3,
                                boxShadow: 3,
                                '&:hover': {
                                    backgroundColor: 'secondary.main',
                                    boxShadow: 2,
                                },
                            }}
                        >
                            수정
                        </Button>
                    </Stack>
                    <Stack direction="row" spacing={2} alignItems="flex-start" justifyContent="space-between" sx={{ width: 1 }}>
                        <ImageListItem sx={{ width: 0.3 }}>
                            <img
                                src={
                                    image ?
                                    image.url :
                                    "https://cdn.pixabay.com/photo/2015/07/16/06/48/bahama-mama-847225_1280.jpg"
                                }
                                style={{ borderRadius: 20, height: 'auto' }}
                                loading="lazy"
                            />
                            <ImageListItemBar
                                sx={{
                                    background: "rgba(0,0,0,0)"
                                }}
                                actionIcon={
                                    <IconButton 
                                        size="small" 
                                        sx={{ 
                                            bgcolor: "primary.main", m: 1, px: 0.8, boxShadow: 3,
                                            '&:hover': {
                                                backgroundColor: 'primary.light',
                                                boxShadow: 2,
                                            },
                                        }}
                                    >
                                        <label data-testid="file" htmlFor='file' style={{ "marginBottom": -2 }}>
                                            <FileUploadIcon fontSize="small" />
                                        </label>
                                    </IconButton>
                                }
                            />
                        </ImageListItem>
                        <input type="file" onChange={handleSelectFile} id='file' style={{ "display": "none" }} />
                        <Stack alignItems="flex-start" justifyContent="flex-start" spacing={2} sx={{ width: 1 }}>
                            <Stack alignItems="flex-start" justifyContent="flex-start" spacing={2} sx={{ width: 1, p: 2, bgcolor: 'primary.main', borderRadius: 3 }}>
                                <Typography variant="body1">
                                    {isNaN(expectedABV) ? "재료를 입력하여 예상 도수를 알아보세요." : `예상 도수 ${expectedABV}%`}
                                </Typography>
                                <Typography variant="body1">
                                    예상 가격 {expectedPrice.toLocaleString()}원
                                </Typography>
                                <Stack direction="row" spacing={0.75} alignItems="center" justifyContent="flex-start">
                                    <Typography variant="body1">
                                        예상 색깔
                                    </Typography>
                                    <Box
                                        sx={{
                                            width: 10,
                                            height: 10,
                                            borderRadius: 5,
                                            bgcolor: `#${expectedColor}`
                                        }}
                                    />
                                </Stack>
                                <TextField
                                    label="설명"
                                    variant="standard"
                                    value={introduction}
                                    onChange={(e) => setIntroduction(e.target.value)}
                                    multiline
                                    fullWidth
                                    sx={{
                                        '& label.Mui-focused': {
                                            color: 'secondary.light',
                                        },
                                        '& .MuiInput-underline:after': {
                                            borderBottomColor: 'secondary.light',
                                        },
                                        '& .MuiOutlinedInput-root': {
                                            '&.Mui-focused fieldset': {
                                                borderColor: 'secondary.light',
                                            },
                                        },
                                    }}
                                />
                            </Stack>
                            <Stack alignItems="flex-start" justifyContent="flex-start" spacing={1} sx={{ width: 1, px: 2 }}>
                                {[...ingredientList, { name: "", amount: undefined, unit: [""], recipe_unit: "" }].map((ingredient, idx) => {
                                    return (
                                        <Stack key={ingredient.name} direction="row" spacing={1} alignItems="flex-end" justifyContent="space-between" sx={{ width: 1 }}>
                                            <Stack key={ingredient.name} direction="row" spacing={1} alignItems="flex-end" justifyContent="flex-start" sx={{ width: 0.9 }}>
                                                <TextField
                                                    label="재료"
                                                    variant="standard"
                                                    value={ingredient.name}
                                                    onClick={() => (idx === ingredientList.length) && setOpen(true)}
                                                    size="small"
                                                    InputProps={{
                                                        readOnly: true,
                                                    }}
                                                    sx={{
                                                        width: 0.5,
                                                        '& label.Mui-focused': {
                                                            color: 'secondary.light',
                                                        },
                                                        '& .MuiInput-underline:after': {
                                                            borderBottomColor: 'secondary.light',
                                                        },
                                                        '& .MuiOutlinedInput-root': {
                                                            '&.Mui-focused fieldset': {
                                                                borderColor: 'secondary.light',
                                                            },
                                                        },
                                                    }}
                                                />
                                                <AddIngredientModal
                                                    isOpen={isOpen}
                                                    close={() => setOpen(false)}
                                                    addedIngredientList={ingredientList.map((ingredient) => { return ingredient.name })}
                                                    setNewIngrdient={setNewIngredient}
                                                />
                                                <TextField
                                                    label="양"
                                                    variant="standard"
                                                    value={ingredient.amount}
                                                    onChange={(event) => {
                                                        onChangeAmount(idx, event.target.value);
                                                        setExpectedABV(calculateABV(ingredientList));
                                                        setExpectedColor(calculateColor(ingredientList));
                                                        setExpectedPrice(calculatePrice(ingredientList));
                                                    }}
                                                    size="small"
                                                    sx={{
                                                        width: 0.35,
                                                        '& label.Mui-focused': {
                                                            color: 'secondary.light',
                                                        },
                                                        '& .MuiInput-underline:after': {
                                                            borderBottomColor: 'secondary.light',
                                                        },
                                                        '& .MuiOutlinedInput-root': {
                                                            '&.Mui-focused fieldset': {
                                                                borderColor: 'secondary.light',
                                                            },
                                                        },
                                                    }}
                                                />
                                                <TextField
                                                    label="단위"
                                                    variant="standard"
                                                    select
                                                    value={ingredient.recipe_unit}
                                                    onChange={(e) => {
                                                        onChangeIngredientUnit(idx, e.target.value);
                                                        setExpectedABV(calculateABV(ingredientList));
                                                        setExpectedColor(calculateColor(ingredientList));
                                                        setExpectedPrice(calculatePrice(ingredientList));
                                                    }}
                                                    size="small"
                                                    sx={{
                                                        width: 0.15,
                                                        '& label.Mui-focused': {
                                                            color: 'secondary.light',
                                                        },
                                                        '& .MuiInput-underline:after': {
                                                            borderBottomColor: 'secondary.light',
                                                        },
                                                        '& .MuiOutlinedInput-root': {
                                                            '&.Mui-focused fieldset': {
                                                                borderColor: 'secondary.light',
                                                            },
                                                        },
                                                    }}
                                                >
                                                    {ingredient.unit.map((u) => {
                                                        return (
                                                            <MenuItem key={u} value={u}>
                                                                {u}
                                                            </MenuItem>
                                                        )
                                                    })}
                                                </TextField>
                                            </Stack>
                                            {idx !== ingredientList.length &&
                                                <IconButton data-testid="delete" size="small" onClick={() => onClickIngredientDelete(idx)}>
                                                    <RemoveIcon fontSize="small" />
                                                </IconButton>
                                            }
                                        </Stack>
                                    )
                                })}
                                <TextField
                                    label="만드는 방법"
                                    variant="standard"
                                    value={recipe}
                                    onChange={(e) => setRecipe(e.target.value)}
                                    multiline
                                    fullWidth
                                    sx={{
                                        '& label.Mui-focused': {
                                            color: 'secondary.light',
                                        },
                                        '& .MuiInput-underline:after': {
                                            borderBottomColor: 'secondary.light',
                                        },
                                        '& .MuiOutlinedInput-root': {
                                            '&.Mui-focused fieldset': {
                                                borderColor: 'secondary.light',
                                            },
                                        },
                                    }}
                                />
                            </Stack>
                        </Stack>
                    </Stack>
                    <Stack direction="row" alignItems="flex-end" justifyContent="flex-start" spacing={1} sx={{ width: 1 }}>
                        {tagList.map((tagItem, idx) => {
                            return (
                                <Button 
                                    key={`${tagItem}_${idx}`} 
                                    sx={{ bgcolor: 'primary.light', borderRadius: 5, px: 1, py: 0.2, textAlign: 'center' }}
                                    onClick={() => onDeleteTagItem(tagItem)}
                                >
                                    <Typography color='text.primary'>
                                        #{tagItem}
                                    </Typography>
                                </Button>
                            )
                        })}
                    </Stack>
                    <TextField
                        label="태그"
                        variant="standard"
                        value={tagItem}
                        size="small"
                        onChange={e => setTagItem(e.target.value)}
                        onKeyPress={onKeyPress}
                        sx={{
                            '& label.Mui-focused': {
                                color: 'secondary.light',
                            },
                            '& .MuiInput-underline:after': {
                                borderBottomColor: 'secondary.light',
                            },
                            '& .MuiOutlinedInput-root': {
                                '&.Mui-focused fieldset': {
                                    borderColor: 'secondary.light',
                                },
                            },
                        }}
                    />
                </Stack >
            </>
        )
    }
}