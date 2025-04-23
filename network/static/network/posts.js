import { like } from './like.js'

export function load_posts(filter='all', page=1) {
    const postView = document.querySelector('#posts-view');

    fetch(`/posts/${filter}?page=${page}`)
        .then(response => response.json())
        .then(data => {
            postView.innerHTML = ''; // Clear

            if (filter === 'following') {
                postView.innerHTML += "<h4 id='following-heading'>#Following</h4>";
            }

            if (!data.posts || data.posts.length === 0) {
                postView.innerHTML += "<p class='text-center fs-1 fw-bold my-4' id='no-posts-heading' style='font-size: 2rem;'>No Posts Yet</p>";
                return;
            }

            data.posts.forEach(post => {
                const postDiv = document.createElement('div');
                postDiv.className = 'post card p-3 my-2';

                postDiv.innerHTML = `
                    <h5><a href="/profile/${post.author}"
                        data-username="{{ ${post.author} }}">
                        <strong>${post.author}</strong>
                    </a></h5>
                    <p class='post-content'>${post.content}</p>
                    <small>${post.timestamp}</small>
                `;

                // Add like button depending on post's status
                if (post.liked) {
                    postDiv.innerHTML += `
                    <span class='like-button'>
                        <i class="fa-solid fa-heart" data-post-id='${post.id}'></i>
                        <span class="like-count">${post.likes}</span>
                    </span>
                    `
                }

                else {
                    postDiv.innerHTML += `
                    <span class='like-button'>
                        <i class="fa-regular fa-heart" data-post-id='${post.id}'></i>
                        <span class="like-count">${post.likes}</span>
                    </span>
                    `
                }

                // Add like functionality
                postDiv.querySelector('.fa-heart').addEventListener('click', () => like(post.id))

                postView.appendChild(postDiv);
            });

             // Render pagination controls
             const controlsDiv = document.createElement('div');
             controlsDiv.className = 'd-flex justify-content-center gap-3 my-3';
 
             if (data.has_previous) {
                 const prevBtn = document.createElement('button');
                 prevBtn.textContent = 'Previous';
                 prevBtn.className = 'btn btn-outline-primary';
                 prevBtn.onclick = () => load_posts(filter, data.page_number - 1);
                 controlsDiv.appendChild(prevBtn);
             }
 
             if (data.has_next) {
                 const nextBtn = document.createElement('button');
                 nextBtn.textContent = 'Next';
                 nextBtn.className = 'btn btn-outline-primary ms-auto';
                 nextBtn.onclick = () => load_posts(filter, data.page_number + 1);
                 controlsDiv.appendChild(nextBtn);
             }
 
             postView.appendChild(controlsDiv);

        })

        .catch(error => {
            postView.innerHTML = `<p>Error loading posts: ${error}</p>`;
        });
}


