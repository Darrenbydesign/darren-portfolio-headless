'use strict';

const fs = require('fs-extra');
const path = require('path');
const mime = require('mime-types');
const { blogPosts, caseStudies } = require('../data/portfolio-content.json');

function getFileData(fileName) {
  const filePath = path.join('data', 'uploads', fileName);
  const ext = fileName.split('.').pop();

  return {
    filepath: filePath,
    originalFileName: fileName,
    size: fs.statSync(filePath).size,
    mimetype: mime.lookup(ext || '') || '',
  };
}

async function uploadFile(file, name) {
  return strapi
    .plugin('upload')
    .service('upload')
    .upload({
      files: file,
      data: {
        fileInfo: {
          alternativeText: `An image uploaded to Strapi called ${name}`,
          caption: name,
          name,
        },
      },
    });
}

async function findOrUploadFiles(fileNames) {
  const files = [];

  for (const fileName of fileNames) {
    const name = fileName.replace(/\..*$/, '');
    const existingFile = await strapi.query('plugin::upload.file').findOne({
      where: { name },
    });

    if (existingFile) {
      files.push(existingFile);
      continue;
    }

    const [uploadedFile] = await uploadFile(getFileData(fileName), name);
    files.push(uploadedFile);
  }

  return files.length === 1 ? files[0] : files;
}

async function hydrateContentBlocks(blocks) {
  const hydratedBlocks = [];

  for (const block of blocks) {
    if (block.__component === 'shared.content-rich-text') {
      hydratedBlocks.push({
        ...block,
        body: normalizeRichTextBlocks(block.body),
      });
      continue;
    }

    if (block.__component === 'shared.media') {
      hydratedBlocks.push({
        ...block,
        file: await findOrUploadFiles([block.file]),
      });
      continue;
    }

    if (block.__component === 'shared.slider') {
      hydratedBlocks.push({
        ...block,
        files: await findOrUploadFiles(block.files),
      });
      continue;
    }

    hydratedBlocks.push(block);
  }

  return hydratedBlocks;
}

function normalizeRichTextBlocks(blocks) {
  if (!Array.isArray(blocks)) return blocks;

  return blocks.map((block) => normalizeRichTextNode(block));
}

function normalizeRichTextNode(node) {
  if (!node || typeof node !== 'object') return node;

  const normalizedNode = {
    ...node,
    ...(typeof node.text === 'string' && !node.type ? { type: 'text' } : {}),
  };

  if (Array.isArray(node.children)) {
    normalizedNode.children = node.children.map((child) => normalizeRichTextNode(child));
  }

  return normalizedNode;
}

async function setPublicPermissions(newPermissions) {
  const publicRole = await strapi.query('plugin::users-permissions.role').findOne({
    where: { type: 'public' },
  });

  for (const [controller, actions] of Object.entries(newPermissions)) {
    for (const action of actions) {
      const permissionAction = `api::${controller}.${controller}.${action}`;
      const existingPermission = await strapi
        .query('plugin::users-permissions.permission')
        .findOne({
          where: {
            action: permissionAction,
            role: publicRole.id,
          },
        });

      if (existingPermission) continue;

      await strapi.query('plugin::users-permissions.permission').create({
        data: {
          action: permissionAction,
          role: publicRole.id,
        },
      });
    }
  }
}

async function createEntryIfMissing({ uid, slug, data }) {
  const existingEntry = await strapi.db.query(uid).findOne({
    where: { slug },
  });

  if (existingEntry) {
    console.log(`Skipped existing ${uid} entry: ${slug}`);
    return;
  }

  await strapi.documents(uid).create({
    data: {
      ...data,
      publishedAt: Date.now(),
    },
  });
  console.log(`Created ${uid} entry: ${slug}`);
}

async function importCaseStudies() {
  for (const caseStudy of caseStudies) {
    const cover = await findOrUploadFiles([caseStudy.caseStudyCover]);
    const contentBlocks = await hydrateContentBlocks(caseStudy.contentBlocks);

    await createEntryIfMissing({
      uid: 'api::case-study.case-study',
      slug: caseStudy.slug,
      data: {
        ...caseStudy,
        caseStudyCover: cover,
        description: normalizeRichTextBlocks(caseStudy.description),
        tools: normalizeRichTextBlocks(caseStudy.tools),
        contentBlocks,
      },
    });
  }
}

async function importBlogPosts() {
  for (const blogPost of blogPosts) {
    const cover = await findOrUploadFiles([blogPost.blogPostCover]);
    const contentBlocks = await hydrateContentBlocks(blogPost.contentBlocks);

    await createEntryIfMissing({
      uid: 'api::blog-post.blog-post',
      slug: blogPost.slug,
      data: {
        ...blogPost,
        blogPostCover: cover,
        content: normalizeRichTextBlocks(blogPost.content),
        contentBlocks,
      },
    });
  }
}

async function seedPortfolioContent() {
  await setPublicPermissions({
    'blog-post': ['find', 'findOne'],
    'case-study': ['find', 'findOne'],
  });

  await importCaseStudies();
  await importBlogPosts();
}

async function main() {
  const { createStrapi, compileStrapi } = require('@strapi/strapi');

  const appContext = await compileStrapi();
  const app = await createStrapi(appContext).load();

  app.log.level = 'error';

  await seedPortfolioContent();
  await app.destroy();

  process.exit(0);
}

main().catch((error) => {
  if (error?.details) {
    console.error(JSON.stringify(error.details, null, 2));
  }

  console.error(error);
  process.exit(1);
});
