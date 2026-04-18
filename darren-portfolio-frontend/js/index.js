const API_URL = 'http://localhost:1337/api';

// Fetch Blog Posts
async function fetchBlogPosts() {
    try {
        const response = await fetch(`${API_URL}/blog-posts?populate=*`);
        const data = await response.json();
        
        const container = document.getElementById('blog-posts');
        container.innerHTML = '';
        
        if (data.data.length === 0) {
            container.innerHTML = '<p>No blog posts yet. Check back soon!</p>';
            return;
        }

        data.data.forEach(post => {
            const date = new Date(post.publishedAt).toLocaleDateString();
            const html = `
                <div class="post-card">
                    <h3>${post.title}</h3>
                    <p class="date">${date}</p>
                    <p>${post.excerpt || post.content.substring(0, 150)}...</p>
                    <a href="#blog/${post.slug}">Read More</a>
                </div>
            `;
            container.innerHTML += html;
        });
    } catch (error) {
        console.error('Error fetching blog posts:', error);
    }
}

// Fetch Case Studies
async function fetchCaseStudies() {
    try {
        const response = await fetch(`${API_URL}/case-studies?populate=*`);
        const data = await response.json();
        
        const container = document.getElementById('case-studies');
        container.innerHTML = '';
        
        if (data.data.length === 0) {
            container.innerHTML = '<p>No case studies yet. Check back soon!</p>';
            return;
        }

        data.data.forEach(study => {
            const html = `
                <div class="study-card">
                    <h3>${study.title}</h3>
                    <p>${study.description.substring(0, 150)}...</p>
                    <p><strong>Tools:</strong> ${study.tools || 'N/A'}</p>
                    <a href="#work/${study.slug}">View Case Study</a>
                </div>
            `;
            container.innerHTML += html;
        });
    } catch (error) {
        console.error('Error fetching case studies:', error);
    }
}

// Handle Contact Form Submission
document.getElementById('contact-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;
    const statusEl = document.getElementById('form-status');
    
    try {
        const response = await fetch(`${API_URL}/contact-messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                data: {
                    name,
                    email,
                    message,
                }
            })
        });
        
        if (response.ok) {
            statusEl.textContent = 'Message sent successfully! I\'ll get back to you soon.';
            statusEl.className = 'success';
            document.getElementById('contact-form').reset();
        } else {
            statusEl.textContent = 'Error sending message. Please try again.';
            statusEl.className = 'error';
        }
    } catch (error) {
        console.error('Error:', error);
        statusEl.textContent = 'Error sending message. Please try again.';
        statusEl.className = 'error';
    }
});

// Load content on page load
document.addEventListener('DOMContentLoaded', () => {
    fetchBlogPosts();
    fetchCaseStudies();
});