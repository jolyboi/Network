import { load_posts } from './posts.js';
import { like } from './like.js'

// Functionality for profile view specifically

// Add event-listeners after DOM is loaded 
document.addEventListener('DOMContentLoaded', function() {
    if (document.querySelector('#compose-form')) {
        document.querySelector('#compose-form').onsubmit = send_post;
    }
    const profile_link = document.querySelector('#self-profile');
    const pathParts = window.location.pathname.split('/');
    const username = pathParts[pathParts.length - 1];

    if (document.querySelector('.follow-button')) {
        const button = document.querySelector('.follow-button');
        document.querySelector('.profile-header').style.borderBottomLeftRadius = '0';
        document.querySelector('.profile-header').style.borderBottomRightRadius = '0';
        if (button.innerHTML === 'Following') {
            button.style.backgroundColor = 'rgba(60, 60, 60)';
        }
        button.addEventListener('click', () => follow(username));
    }
    load_profile_head(username);
    load_posts(username);
});


// Compose post 
function send_post() {
    // Parse values
    const body = document.querySelector('#new-post-write').value;

    // Send post's text to the API
    fetch('/compose', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken'),  // Add CSRF token
        },
        credentials: 'include',
        body: JSON.stringify({
            body: body,
        })
    })
    .then(response => response.json())
    .then(result => {
        console.log(result);
        if (!result.error) {
            document.querySelector('#new-post-write').value = '';
            const postDiv = document.createElement('div');
            const post = result.post;
            postDiv.className = 'post card p-3 my-2';

            postDiv.innerHTML = `
                <h5><a href="/profile/${post.author}"
                        data-username="{{ ${post.author} }}">
                        <strong>${post.author}</strong>
                    </a>
                </h5>
                <p class='post-content'>${body}</p>
                <small>${post.timestamp}</small>
                <span class='like-button'>
                        <i class="fa-regular fa-heart" data-post-id='${post.id}'></i>
                        <span class="like-count">${post.likes}</span>
                </span>
            `;

            // Like button 
            postDiv.querySelector('.fa-heart').addEventListener('click', () => like(post.id))

            document.querySelector('#posts-view').prepend(postDiv);
            document.querySelector('#no-posts-heading').remove();

        }
        else {
            document.querySelector('#new-post-write').placeholder = result.error;
        }
    });

    // Do not submit the form
    return false;
}

// Load header 
function load_profile_head(username) {
    fetch(`/api/user/${username}`)
        .then(response => response.json())
        .then(data => {
            const head = document.querySelector('.profile-header');
            let following = data.following;
            let followers = data.followers;

            head.innerHTML = `
                <h2 class="fw-bold">${username}</h2>
                <div class="d-flex justify-content-center mt-2 profile-stats">
                    <div class="me-5">
                        <h5 class="mb-0 followers-count">${followers}</h5>
                        <small>Followers</small>
                    </div>
                    <div>
                        <h5 class="mb-0">${following}</h5>
                        <small>Following</small>
                    </div>
                </div>
            `;
        })

        .catch(error => {
            console.log('Error loading profile header:', error);
        });

}

function follow(username) {
    fetch(`/follow/${username}`, {
        method: 'PUT',
        headers: {
            'X-CSRFToken': getCookie('csrftoken'),
        },
    })
    .then(response => response.json())
    .then(data => {

        const button = document.querySelector('.follow-button');
        const followers_count = document.querySelector('.followers-count');
        let cur_followers_count = parseInt(followers_count.textContent);

        // Change button's color and text, change number of followers
        if (data.message === 'Followed') {
            button.innerHTML = 'Following'
            button.style.backgroundColor = 'rgba(60, 60, 60)'
            followers_count.textContent = cur_followers_count + 1;
        }
        else {
            button.innerHTML = 'Follow'
            button.style.backgroundColor = 'rgba(53, 121, 246)'
            followers_count.textContent = cur_followers_count - 1;
        }
    })
    .catch(error => {
        console.log(error)
    });
}

// Util
// Get CSRF token function  
export function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}