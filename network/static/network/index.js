import { load_posts } from './posts.js';

// Add event-listeners after DOM is loaded 
document.addEventListener('DOMContentLoaded', function() {
    // document.querySelector('#posts-link').addEventListener('click', (event) => view_interrupt(event, 'all'));
    // if (document.querySelector('#following-link')) {
    //     document.querySelector('#following-link').addEventListener('click', (event) => view_interrupt(event, 'following'));
    // }
    // By default, load posts 
    load_posts('all');
});

// // Interrupt django view if already on index page
// function view_interrupt(event, filter) {
//     if (window.location.pathname === '/' || window.location.pathname === '') {
//         event.preventDefault();
//     }
//     load_posts(filter)
// }


