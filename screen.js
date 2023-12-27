//This code is unesscary but essatential allows for Java script to navigate to the href when the link is clicked 
// instead of html doing the "default behavior" of following the href specifed on the clicked a tag. 

document.addEventListener('DOMContentLoaded', function () {
    const links = document.querySelectorAll('a');

    links.forEach(function (link) {
        link.addEventListener('click', function (event) {
            event.preventDefault(); // Prevent the default link behavior
            const href = link.getAttribute('href');
            window.location.href = href; // Navigate to the second HTML file via JS
        });
    });
});  