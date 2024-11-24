from functools import partial
from json import JSONDecodeError
from django.http import HttpResponseBadRequest, HttpResponseNotAllowed, HttpResponseNotFound, JsonResponse, HttpResponse
from django.db import IntegrityError
from django.db.models import Q
from cocktail.permissions import AvailableCocktailPermission
from exception.errno import ErrorCode
from exception.exception_response import ExceptionResponse
from ingredient_prepare.models import IngredientPrepare
from ingredient.models import Ingredient
from tag.models import Tag, CocktailTag
from .models import Cocktail
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework import permissions, authentication
from .serializers import CocktailDetailSerializer, CocktailListSerializer, CocktailPostSerializer
from .utils import color_similarity, order_queryset_by_id
from django.db.models import Case, When
from .filter import ABVFilter, TypeFilter, SizeFilter, AvailableFilter, StandardOrCustomFilter, ColorSorter



## END FILTER FUNCTIONS ##

@api_view(['GET'])
@authentication_classes([authentication.TokenAuthentication])
@permission_classes([AvailableCocktailPermission])
def cocktail_list(request):
    if request.method == 'GET':

        filter_q = Q()

        err = TypeFilter().apply(request, filter_q)
        if err:
            raise err
        
        err = ABVFilter().apply(request, filter_q)
        if err:
            raise err

        err = SizeFilter().apply(request, filter_q)
        if err:
            raise err

        err = AvailableFilter().apply(request, filter_q)
        if err:
            raise err

        err = StandardOrCustomFilter().apply(request, filter_q)
        if err:
            raise err

        cocktails = Cocktail.objects.filter(filter_q)

        # calculate color similarity locally if needed
        cocktails = ColorSorter().sort(request, cocktails)



        data = CocktailListSerializer(cocktails, many=True, context={
                                      'user': request.user}).data
        return JsonResponse({"cocktails": data, "count": cocktails.count()}, safe=False)


@api_view(['POST'])
@authentication_classes([authentication.TokenAuthentication])
@permission_classes([permissions.IsAuthenticated])
def cocktail_post(request):
    if request.method == 'POST':
        try:
            if request.user.is_authenticated:
                data = request.data.copy()

        except (KeyError, JSONDecodeError) as e:
            return HttpResponseBadRequest("Unvalid Token")

        # TODO: change fields that is derived automatically
        #data['author_id'] = 1
        data['type'] = 'CS'
        print(data)

        serializer = CocktailPostSerializer(
            data=data, context={"request": request})
        print(serializer.initial_data["name_eng"])

        if not serializer.is_valid():
            err = serializer.errors
            # return first error
            first_err = next(iter(err))
            if first_err == 'name':
                if err['name'][0].code == 'blank':
                    return ExceptionResponse(status=400, detail="name_blank", code=ErrorCode.COCKTAIL_NAME_BLANK).to_response()
                elif err['name'][0].code == 'unique':
                    return ExceptionResponse(status=400, detail="name_not_unique", code=ErrorCode.COCKTAIL_NAME_ALREADY_EXIST).to_response()
            elif first_err == 'name_eng':
                return ExceptionResponse(status=400, detail="english_name_not_unique", code=ErrorCode.COCKTAIL_ENG_NAME_ALREADY_EXIST).to_response()
            elif first_err == 'color':
                return ExceptionResponse(status=400, detail="color_blank", code=ErrorCode.COCKTAIL_COLOR_BLANK).to_response()
            elif first_err == 'introduction':
                return ExceptionResponse(status=400, detail="intro_blank", code=ErrorCode.COCKTAIL_INTRO_BLANK).to_response()
            elif first_err == 'recipe':
                return ExceptionResponse(status=400, detail="recipe_blank", code=ErrorCode.COCKTAIL_RECIPE_BLANK).to_response()
        print(serializer.errors)
        cocktail = serializer.save()
        try:
            tags = data['tags']
        except (KeyError, JSONDecodeError) as e:
            tags = []
        for t in tags:
            try:
                tag = Tag.objects.get(content=t)
            except Tag.DoesNotExist:
                tag = Tag.objects.create(content=t)
            # try:
            #     CocktailTag.objects.create(tag=tag, cocktail=cocktail)
            CocktailTag.objects.create(tag=tag, cocktail=cocktail)
            # except IntegrityError:
            #     return HttpResponseBadRequest("tag must not be duplicated")

        try:
            ingredient_list = data['ingredients']
        except (KeyError, JSONDecodeError) as e:
            ingredient_list = []
        for ingredient in ingredient_list:
            try:
                _ingredient = Ingredient.objects.get(id=ingredient["id"])

            except Ingredient.DoesNotExist:
                return HttpResponseNotFound("ingredient does not exist")

            IngredientPrepare.objects.create(
                cocktail=cocktail, ingredient=_ingredient, amount=ingredient["amount"], unit=ingredient["unit"])

        return JsonResponse(CocktailDetailSerializer(cocktail, context={'user': request.user}).data, status=201)
    # else:
    #     return HttpResponseNotAllowed(['GET', 'POST'])


@api_view(['PUT'])
@authentication_classes([authentication.TokenAuthentication])
@permission_classes([permissions.IsAuthenticated])
def cocktail_edit(request, pk):
    try:
        cocktail = Cocktail.objects.get(id=pk)
    except Cocktail.DoesNotExist:
        return HttpResponseNotFound(f"No Cocktails matches id={pk}")
    serializer = CocktailDetailSerializer(
        cocktail, data=request.data, partial=True, context={'user': request.user})
    data = request.data.copy()
    if not serializer.is_valid():
        err = serializer.errors
        # return first error
        first_err = next(iter(err))
        if first_err == 'name':
            if err['name'][0].code == 'blank':
                return ExceptionResponse(status=400, detail="name_blank", code=ErrorCode.COCKTAIL_NAME_BLANK).to_response()
            elif err['name'][0].code == 'unique':
                return ExceptionResponse(status=400, detail="name_not_unique", code=ErrorCode.COCKTAIL_NAME_ALREADY_EXIST).to_response()
        elif first_err == 'name_eng':
            return ExceptionResponse(status=400, detail="english_name_not_unique", code=ErrorCode.COCKTAIL_ENG_NAME_ALREADY_EXIST).to_response()
        elif first_err == 'color':
            return ExceptionResponse(status=400, detail="color_blank", code=ErrorCode.COCKTAIL_COLOR_BLANK).to_response()
        elif first_err == 'introduction':
            return ExceptionResponse(status=400, detail="intro_blank", code=ErrorCode.COCKTAIL_INTRO_BLANK).to_response()
        elif first_err == 'recipe':
            return ExceptionResponse(status=400, detail="recipe_blank", code=ErrorCode.COCKTAIL_RECIPE_BLANK).to_response()

    serializer.save()

    CocktailTag.objects.filter(cocktail=pk).delete()
    try:
        tags = data['tags']
    except (KeyError, JSONDecodeError) as e:
        tags = []
    for t in tags:
        try:
            tag = Tag.objects.get(content=t)
        except Tag.DoesNotExist:
            tag = Tag.objects.create(content=t)
        # try:
        CocktailTag.objects.create(tag=tag, cocktail=cocktail)
        # except IntegrityError:
        #     return HttpResponseBadRequest("tag must not be duplicated")

    try:
        ingredient_list = data['ingredients']
    except (KeyError, JSONDecodeError) as e:
        ingredient_list = []
    IngredientPrepare.objects.filter(cocktail=cocktail).delete()
    for ingredient in ingredient_list:
        try:
            _ingredient = Ingredient.objects.get(id=ingredient["id"])
        except Ingredient.DoesNotExist:
            return HttpResponseNotFound("ingredient does not exist")
        IngredientPrepare.objects.create(
            cocktail=cocktail, ingredient=_ingredient, amount=ingredient["amount"], unit=ingredient["unit"])
    return JsonResponse(data=CocktailDetailSerializer(cocktail, context={'user': request.user}).data, status=200)


@api_view(['GET'])
def retrieve_cocktail(request, pk):
    try:
        cocktail = Cocktail.objects.get(id=pk)
    except Cocktail.DoesNotExist:
        return HttpResponseNotFound(f"No Cocktails matches id={pk}")
    return JsonResponse(CocktailDetailSerializer(cocktail, context={'user': request.user}).data, safe=False)

    # else:
    #     return HttpResponseNotAllowed(['GET', 'PUT'])


@api_view(['PUT'])
def cocktail_rate_edit(request, pk):

    try:
        cocktail = Cocktail.objects.get(id=pk)
    except Cocktail.DoesNotExist:
        return HttpResponseNotFound(f"No Cocktails matches id={pk}")

    serializer = CocktailDetailSerializer(
        cocktail, data=request.data, partial=True, context={'user': request.user})
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return JsonResponse(serializer.data, status=200)


@api_view(['GET'])
@authentication_classes([authentication.TokenAuthentication])
@permission_classes([permissions.IsAuthenticated])
def retrieve_my_cocktail(request):
    user = request.user

    # TODO: author_id=request.user.id
    cocktails = Cocktail.objects.filter(author_id=user.id, type='CS')
    data = CocktailListSerializer(cocktails, many=True, context={
                                  'user': request.user}).data
    return JsonResponse({"cocktails": data, "count": cocktails.count()}, safe=False)


@api_view(['DELETE'])
@authentication_classes([authentication.TokenAuthentication])
@permission_classes([permissions.IsAuthenticated])
def delete_cocktail(request, pk):
    user = request.user
    if not user.is_authenticated:
        return HttpResponse(status=401)
    try:
        cocktail = Cocktail.objects.get(id=pk)
    except Cocktail.DoesNotExist:
        return HttpResponseNotFound(f"No Cocktails matches id={pk}")
    if cocktail.author_id != user.id:
        return HttpResponse(status=401)
    # TODO: author_id=request.user.id
    cocktail.delete()
    return HttpResponse(status=204)


@api_view(['GET'])
@authentication_classes([authentication.TokenAuthentication])
def get_init_cocktail(request):

    filter_q = Q()
    type = request.GET.get('type')
    if type == 'standard':
        filter_q.add(Q(type='ST'), Q.AND)
    elif type == 'custom':
        filter_q.add(Q(type='CS'), Q.AND)
    else:
        return HttpResponseBadRequest('Cocktail type is \'custom\' or \'standard\'')

    cocktails = Cocktail.objects.filter(
        filter_q).order_by('-rate', 'name')[:15]
    data = CocktailListSerializer(cocktails, many=True, context={
        'user': request.user}).data
    return JsonResponse({"cocktails": data, "count": cocktails.count()}, safe=False)





"""
import torch
from cocktail.cocktailbert.kobert_for_classification import BERTClassification
from kobert_tokenizer import KoBERTTokenizer
from cocktail.cocktailbert.utils import postprocess_model


tokenizer = KoBERTTokenizer.from_pretrained('skt/kobert-base-v1')
#TODO: modify this root
checkpoint_path = '/home/ubuntu/build/qualla/cocktail/cocktailbert/model.ckpt'
loaded_ckpt = torch.load(checkpoint_path)
loaded_model={}
for key, value in loaded_ckpt.items():
    loaded_model[key] = value

model = BERTClassification([4,5,5])
model.load_state_dict(loaded_model, strict=False)
model.eval()

@api_view(['GET'])
def get_ai_cocktail_recommend(request):

    MAX_RECOMMEND_LEN = 5


    text = request.query_params.get("text", None)
    print(f"got param :{text}")
    with torch.no_grad():
        result = postprocess_model(model,text, tokenizer)
    
    size, abv, color = result["size"], result["abv"], result["color"]
    
    if size == 0:
        size = None
    elif size == 1:
        size = '롱 드링크'
    elif size == 2:
        size = '숏 드링크'
    elif size == 3:
        size = '샷'
    else:
        raise ValueError("invalid size type")

    if abv == 0:
        abv = None
    elif abv == 1:
        abv = (0, 15)
    elif abv == 2:
        abv = (15, 30)
    elif abv == 3:
        abv = (30, 40)
    elif abv == 4:
        abv = (40, 100)
    else:
        raise ValueError("invalid abv type")


    if color == 0:
        color = None
    elif color == 1:
        color = "ff0000"
    elif color == 2:
        color = "00ff00"
    elif color == 3:
        color = "33ffff"
    elif color == 4:
        color = "da8c17"
    elif color == 5:
        color = "ffff00"
    else:
        raise ValueError("invalid abv type")

    filter_q = Q()

    if size is not None:
        filter_q.add(Q(filter_type_two=size), Q.AND)
    if abv is not None:
        filter_q.add(Q(ABV__range=(abv)), Q.AND)
    cocktails = Cocktail.objects.filter(filter_q)
    if color is not None:
        color_sort_id = [cocktail.id for cocktail in sorted(cocktails, key=lambda cocktail: color_similarity(
            cocktail.color, color))]

        cocktails = order_queryset_by_id(cocktails, color_sort_id)[:MAX_RECOMMEND_LEN]
    data = CocktailListSerializer(cocktails, many=True, context={
                                    'user': request.user}).data
    return JsonResponse({"cocktails": data, "count": cocktails.count()}, safe=False)

    """