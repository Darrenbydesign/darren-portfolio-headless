const API_URL = 'http://localhost:1337/api';

function extractTextFromRichContent(content) {
  if (!Array.isArray(content)) return '';

  return content
    .map((block) => {
      if (!Array.isArray(block.children)) return '';

      return block.children
        .map((child) => {
          if (Array.isArray(child.children)) {
            return child.children.map((nested) => nested.text || '').join('');
          }

          return child.text || '';
        })
        .join('');
    })
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractListItemsFromRichContent(content) {
  if (!Array.isArray(content)) return [];

  return content.flatMap((block) => {
    if (block.type !== 'list' || !Array.isArray(block.children)) return [];

    return block.children.map((item) => {
      if (!Array.isArray(item.children)) return '';

      return item.children
        .map((child) => child.text || '')
        .join('')
        .trim();
    });
  }).filter(Boolean);
}

function getPreviewText(text, length = 150) {
  if (!text || typeof text !== 'string') return '';
  return text.length > length ? `${text.substring(0, length)}...` : text;
}

async function fetchBlogPosts() {
  const container = document.getElementById('blog-posts');
  if (!container) return;

  try {
    const response = await fetch(`${API_URL}/blog-posts?populate=*`);

    if (!response.ok) {
      throw new Error(`Failed to fetch blog posts: ${response.status}`);
    }

    const result = await response.json();
    const posts = result.data || [];

    container.innerHTML = '';

    if (posts.length === 0) {
      container.innerHTML = '<p>No blog posts yet. Check back soon!</p>';
      return;
    }

    const html = posts
      .map((post) => {
        const fullText = extractTextFromRichContent(post.content);
        const preview = post.excerpt || getPreviewText(fullText, 150);
        const date = post.datePublished
          ? new Date(post.datePublished).toLocaleDateString()
          : '';

        return `
          <div class="post-card">
            <h3>${post.title || 'Untitled Post'}</h3>
            <p class="date">${date}</p>
            <p>${preview}</p>
            <a href="/blog/${post.slug || ''}">Read More</a>
          </div>
        `;
      })
      .join('');

    container.innerHTML = html;
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    container.innerHTML = '<p>Unable to load blog posts right now.</p>';
  }
}

async function fetchCaseStudies() {
  const container = document.getElementById('case-studies');
  if (!container) return;

  try {
    const response = await fetch(`${API_URL}/case-studies?populate=*`);

    if (!response.ok) {
      throw new Error(`Failed to fetch case studies: ${response.status}`);
    }

    const result = await response.json();
    const studies = result.data || [];

    container.innerHTML = '';

    if (studies.length === 0) {
      container.innerHTML = '<p>No case studies yet. Check back soon!</p>';
      return;
    }

    const html = studies
      .map((study) => {
        const descriptionText = extractTextFromRichContent(study.description);
        const preview = getPreviewText(descriptionText, 150);

        const toolsList = extractListItemsFromRichContent(study.tools);
        const toolsText = toolsList.length > 0 ? toolsList.join(', ') : 'N/A';

        return `
          <div class="study-card">
            <h3>${study.title || 'Untitled Case Study'}</h3>
            <p>${preview}</p>
            <p><strong>Tools:</strong> ${toolsText}</p>
            <a href="/work/${study.slug || ''}">View Case Study</a>
          </div>
        `;
      })
      .join('');

    container.innerHTML = html;
  } catch (error) {
    console.error('Error fetching case studies:', error);
    container.innerHTML = '<p>Unable to load case studies right now.</p>';
  }
}

function setupContactForm() {
  const form = document.getElementById('contact-form');
  const statusEl = document.getElementById('form-status');

  if (!form || !statusEl) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name')?.value.trim() || '';
    const email = document.getElementById('email')?.value.trim() || '';
    const message = document.getElementById('message')?.value.trim() || '';

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
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to send message: ${response.status}`);
      }

      statusEl.textContent = "Message sent successfully! I'll get back to you soon.";
      statusEl.className = 'success';
      form.reset();
    } catch (error) {
      console.error('Error sending message:', error);
      statusEl.textContent = 'Error sending message. Please try again.';
      statusEl.className = 'error';
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  fetchBlogPosts();
  fetchCaseStudies();
  setupContactForm();
});