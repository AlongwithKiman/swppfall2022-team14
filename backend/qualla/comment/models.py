from django.db import models
from django.db.models import CheckConstraint, Q
from cocktail.models import Cocktail


class Comment(models.Model):

    # FKs
    cocktail = models.ForeignKey(
        Cocktail, on_delete=models.CASCADE, related_name='comments', null=False)
    author_id = models.IntegerField(
        null=True, default=None)  # Null when deleted

    # 대댓글 기능 구현을 위해, comment의 delete is_deleted flag를 0으로 set하게 구현되어 있다.
    # 따라서 일반적인 댓글 삭제 상황시 대댓글은 유지되나, Cocktail 객체가 삭제될 시에는 하위 댓글이 모두 삭제되므로 그 아래 대댓글은 SET_NULL로 처리하면 충분하다.
    parent_comment = models.ForeignKey(
        'self', on_delete=models.SET_NULL, related_name='replies', null=True)

    content = models.CharField(max_length=500, null=False)
    created_at = models.DateTimeField(auto_now_add=True, null=False)
    updated_at = models.DateTimeField(auto_now=True, null=False)
    is_deleted = models.BooleanField(default=False)

    def __str__(self):
        return "comment for {}, comment id {}".format(self.cocktail.name, self.id)
