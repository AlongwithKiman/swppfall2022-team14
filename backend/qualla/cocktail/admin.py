from django.contrib import admin
from .models import Cocktail
from django.contrib import admin
from django.http import HttpResponse
from django.core.exceptions import PermissionDenied
import csv
# Register your models here.


# admin.site.register(Cocktail)


@admin.register(Cocktail)
class CocktailAdmin(admin.ModelAdmin):
    actions = ["download_csv"]
    
    @admin.action(description = "download csv")
    def download_csv(modeladmin, request, queryset):
        if not request.user.is_staff:
            raise PermissionDenied
        opts = queryset.model._meta
        model = queryset.model
        response = HttpResponse(content_type='text/csv')
        # force download.
        response['Content-Disposition'] = 'attachment;filename=export.csv'
        # the csv writer
        writer = csv.writer(response)
        field_names = [field.name for field in opts.fields]
        # Write a first row with header information
        writer.writerow(field_names)
        # Write data rows
        for obj in queryset:
            writer.writerow([getattr(obj, field) for field in field_names])
        
        return HttpResponse(response, content_type = "text/csv")
