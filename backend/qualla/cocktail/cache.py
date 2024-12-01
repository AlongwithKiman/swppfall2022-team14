from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.core.cache import cache
import hashlib
from .models import Cocktail

def get_cache_key_by_request(request):
    is_available = request.query_params.get("available_only", None) == 'true'

    if is_available:
        _key = f"cocktail_list_{request.user.id}"        
    else:
        query_params = "_".join(f"{key}={value}" for key, value in request.GET.items())
        _key = f"cocktail_list_all_{query_params}"

    return is_available, hashlib.md5(_key.encode('utf-8')).hexdigest()

