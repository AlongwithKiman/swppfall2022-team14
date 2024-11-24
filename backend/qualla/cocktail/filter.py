from django.db.models import Q
from django.http import HttpResponseBadRequest, HttpResponseNotAllowed, HttpResponseNotFound, JsonResponse, HttpResponse
from .models import Cocktail
from .utils import color_similarity, order_queryset_by_id

# request와 filter_q를 받아 filter_q에 필터 조건을 추가
class BaseFilter:
    def __init__(self):
        pass

    def apply(self, request, filter_q):
        pass
        # if error occurs, it should return that error

class TextFilter(BaseFilter):
    def __init__(self):
        pass
    def apply(self, request, filter_q):
        text = request.query_params.get("name_param", None)
        if (text is not None and text != ""):
            filter_q.add(Q(name__contains=text), Q.AND) 


class ABVFilter(BaseFilter):
    def __init__(self):
        self.ABV_range_map = {"weak":(0, 15), "medium":(15, 30), "strong": (30, 40), "extreme": (40, 100)}
    
    def apply(self, request, filter_q):
        filter_type_ABV = request.query_params.getlist(
            "type_three[]", None)  # 도수
        if len(filter_type_ABV) != 0:
            try:
                abv_range = self.ABV_range_map[filter_type_ABV[0]]
                filter_q.add(Q(ABV__range=(abv_range)), Q.AND)
            except (ValueError):
                return HttpResponseBadRequest('Invalid ABV Type', ValueError)


class TypeFilter(BaseFilter):

    
    def apply(self, request, filter_q):
        filter_type_one_list = request.query_params.getlist("type_one[]", None)  # 클래식 / 트로피컬
        try:
            assert (all([x in ['클래식', '트로피컬'] for x in filter_type_one_list])), "Invalid Filter Type"
        except AssertionError:
            return HttpResponseBadRequest('Invalid Filter Type(Classic or Tropical)', AssertionError)

        if filter_type_one_list is not None and len(filter_type_one_list) != 0:
            filter_q.add(Q(filter_type_one__in=filter_type_one_list), Q.AND)

class SizeFilter(BaseFilter):

    
    def apply(self, request, filter_q):
        filter_type_two_list = request.query_params.getlist("type_two[]", None)  # 롱 / 숏 / 샷
        try:
            assert (all([x in ['롱 드링크', '숏 드링크', '샷'] for x in filter_type_two_list])), "Invalid Filter Type(Size)"
        except AssertionError:
            return HttpResponseBadRequest('Invalid Filter Type(Size)', AssertionError)

        if filter_type_two_list is not None and len(filter_type_two_list) != 0:
            filter_q.add(Q(filter_type_two__in=filter_type_two_list), Q.AND)

class AvailableFilter(BaseFilter):
    
    def apply(self, request, filter_q):
        if not request.query_params.get("available_only", None) == 'true':
            return


        if not request.user.is_authenticated:
            return AttributeError

        user = request.user
        store_ingredients = user.store.all()

        # 내 재료 id list
        my_ingredients = [
            store_ingredient.ingredient.id for store_ingredient in store_ingredients]

        cocktail_all = Cocktail.objects.all()
        available_cocktails_id = []

        for cocktail in cocktail_all:
            ingredient_prepare = [
                ingredient_prepare.ingredient.id for ingredient_prepare in cocktail.ingredient_prepare.all()]

            # 만약 해당 칵테일 재료가 내 재료의 subset이면
            if set(ingredient_prepare).issubset(set(my_ingredients)):
                available_cocktails_id.append(cocktail.id)

        # 매칭된 칵테일 없음
        if (not available_cocktails_id):
            filter_q.add(Q(id__in=[-1]), Q.AND)
        else:
            filter_q.add(Q(id__in=available_cocktails_id), Q.AND)


class StandardOrCustomFilter(BaseFilter):
    
    def apply(self, request, filter_q):
        _type = request.GET.get('type')
        if _type == 'standard':
            filter_q.add(Q(type='ST'), Q.AND)
            #filter_q.add(Q(type='ST'), Q.AND)
        elif _type == 'custom':
            filter_q.add(Q(type='CS'), Q.AND)
            #filter_q.add(Q(type='CS'), Q.AND)
        else:
            return HttpResponseBadRequest('Cocktail type is \'custom\' or \'standard\'')


class ColorSorter:
    def __init__(self):
        pass
    def sort(self, request, cocktails):
        filter_color = request.query_params.get("color")
        if filter_color is not None:
            color_sort_id = [cocktail.id for cocktail in sorted(cocktails, key=lambda cocktail: color_similarity(
                cocktail.color, filter_color))]

            cocktails = order_queryset_by_id(cocktails, color_sort_id)
        
        return cocktails

        