export function like(post_id) {
    console.log('Clicked!')
    fetch(`/like/${post_id}`, {
        method: 'PUT',
        headers: {
            'X-CSRFToken': getCookie('csrftoken'),
        },
    })
    .then(response => response.json())
    .then(data => {
        const button = document.querySelector(`.fa-heart[data-post-id='${post_id}']`);
        const like_count = button.nextElementSibling;

        if (data.message === 'Liked') {
            button.classList.remove('fa-regular');
            button.classList.add('fa-solid');
        }

        else if (data.message === 'Unliked'){
            button.classList.remove('fa-solid');
            button.classList.add('fa-regular');
        }

        like_count.textContent = data.likes; 
    })

    .catch(error => {
        console.log(error);
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


