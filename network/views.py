from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django.contrib.auth.decorators import login_required
import json
from django.core.paginator import Paginator


from .models import User, Post, Following, Like


def index(request):
    return render(request, "network/index.html")


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")

# View profile
def profile_page(request, name):
    homepage = (request.user.is_authenticated and name == request.user.username)
    following = False
    if request.user.is_authenticated and not homepage:
        following = Following.objects.filter(follower=request.user, followed__username=name).exists()
        
    return render(request, "network/profile.html", {
        'homepage': homepage,
        'following': following
    })
    
@login_required
def following_view(request):
    return render(request, "network/following.html")


    


#todo#  APIs 

# Post 
@login_required
def compose(request):
    # Composing a new post must be via POST
    if request.method != 'POST':
        return JsonResponse({'error': 'POST request required.'}, status=400)
    
    # Parse JSON data 
    data = json.loads(request.body)
    body = data.get('body', '')

    # Do not create post if empty
    if not body:
        return JsonResponse({'error': 'Share something!'}, status=201)

    # Create post 
    post = Post(author=request.user, content=body)
    post.save()

    # Return JSON response
    return JsonResponse({
        'message': 'Post created successfully.',
        'post': {
            'id': post.id,
            'author': post.author.username,
            'timestamp': post.timestamp.strftime("%Y-%m-%d %H:%M"),
            'likes': post.likes
        }
    }, status=201)


# View posts
def posts(request, filter):
    # Show all posts
    if filter == 'all':
        posts = Post.objects.all()
    elif filter == 'following':
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'Authentication required'}, status=401)
         # Get the users the current user is following
        following_users = request.user.following_set.values_list('followed', flat=True)
        
        # Get posts from those followed users
        posts = Post.objects.filter(author__in=following_users)
    else:
        try:
            # Attempt to interpret the filter as a username
            user = User.objects.get(username=filter)
            posts = Post.objects.filter(author=user)
        except User.DoesNotExist:
            return JsonResponse({'error': 'User not found.'}, status=404)

    all_posts = posts.order_by('-timestamp')

    # Handle pagination 
    page_number = request.GET.get('page', 1)
    paginator = Paginator(all_posts, 10)  # 10 posts per page

    try:
        page = paginator.page(page_number)
    except:
        return JsonResponse({'error': 'Invalid page number.'}, status=400)
    
    # Get IDs of liked posts
    if request.user.is_authenticated:
        liked_posts = Like.objects.filter(liker=request.user).values_list('post', flat=True)

    # Prepare posts with like status
    serialized_posts = []
    for post in page.object_list:
        post_data = post.serialize()
        if request.user.is_authenticated:
            post_data['liked'] = post.id in liked_posts  # Check if the user has liked the post
        else:
            post_data['liked'] = False
        serialized_posts.append(post_data)

    return JsonResponse({
            'posts': serialized_posts,
            'has_next': page.has_next(),
            'has_previous': page.has_previous(),
            'page_number': page.number,
            'num_pages': paginator.num_pages
        }, safe=False)

# Info about user
def profile_info(request, username):
    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        return JsonResponse({'error': 'User not found.'}, status=404)
    
    following = user.following_set.count() or 0
    followers = user.followers_set.count() or 0


    return JsonResponse({
        'user': user.username,
        'following': following,
        'followers': followers
    })


# Follow / Unfollow button
@login_required
def follow(request, username):
    try: 
        follower = request.user 
        followed = User.objects.get(username=username)
        
        # If connection is already there, delete it
        following = Following.objects.filter(follower=follower, followed=followed)
        if following.exists():
            following.delete()
            return JsonResponse({'message': 'Unfollowed'})
        else: 
            Following.objects.create(follower=follower, followed=followed)
            return JsonResponse({'message': 'Followed'})
        
    except User.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)

# Like button 
@login_required
def like(request, post_id):
    try: 
        liker = request.user
        post = Post.objects.get(id=post_id)

        like = Like.objects.filter(liker=liker, post=post)
        if like.exists():
            like.delete()
            post.likes -= 1
            message = 'Unliked'
        else:
            Like.objects.create(liker=liker, post=post)
            post.likes += 1
            message = 'Liked'

        post.save()
        return JsonResponse({
            'message': message,
            'likes': post.likes
        })


    except Post.DoesNotExist:
        return JsonResponse({'error': 'Post not found'}, status=404)
    
    