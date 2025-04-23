
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path('profile/<str:name>', views.profile_page, name='profile'),
    path('following', views.following_view, name='following'),

    # API Routes
    path('posts/<str:filter>', views.posts, name='posts'),
    path('compose', views.compose, name='compose'),
    path('api/user/<str:username>', views.profile_info, name='profile_info'),
    path('follow/<str:username>', views.follow, name='follow'),
    path('like/<int:post_id>', views.like, name='like')

]
