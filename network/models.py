from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    pass

class Post(models.Model):
    author = models.ForeignKey(User, on_delete=models.PROTECT, related_name='posts')
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    likes = models.IntegerField(default=0)

    def serialize(self):
        return {
            'id': self.id,
            'author': self.author.username,
            'content': self.content,
            'timestamp': self.timestamp.strftime("%Y-%m-%d %H:%M"),
            'likes': self.likes,
        }

class Following(models.Model):
    follower = models.ForeignKey(User, on_delete=models.CASCADE, related_name='following_set') # Users that user follows 
    followed = models.ForeignKey(User, on_delete=models.CASCADE, related_name='followers_set') # Users that follow user

class Like(models.Model):
    liker = models.ForeignKey(User, on_delete=models.CASCADE, related_name='liked_posts')
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='liked_by')