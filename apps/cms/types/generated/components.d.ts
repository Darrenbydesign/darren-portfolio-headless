import type { Schema, Struct } from '@strapi/strapi';

export interface SharedContentRichText extends Struct.ComponentSchema {
  collectionName: 'components_shared_content_rich_texts';
  info: {
    displayName: 'Content Rich Text';
    icon: 'align-justify';
  };
  attributes: {
    body: Schema.Attribute.Blocks;
  };
}

export interface SharedDetailStat extends Struct.ComponentSchema {
  collectionName: 'components_shared_detail_stats';
  info: {
    description: 'A label and value card for detail page snapshot metadata.';
    displayName: 'Detail stat';
    icon: 'bulletList';
  };
  attributes: {
    label: Schema.Attribute.String & Schema.Attribute.Required;
    value: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedExternalGallery extends Struct.ComponentSchema {
  collectionName: 'components_shared_external_galleries';
  info: {
    displayName: 'External Gallery';
    icon: 'images';
  };
  attributes: {
    images: Schema.Attribute.JSON & Schema.Attribute.Required;
  };
}

export interface SharedExternalImage extends Struct.ComponentSchema {
  collectionName: 'components_shared_external_images';
  info: {
    displayName: 'External Image';
    icon: 'picture';
  };
  attributes: {
    alt: Schema.Attribute.String;
    caption: Schema.Attribute.String;
    url: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedHeroMetaChip extends Struct.ComponentSchema {
  collectionName: 'components_shared_hero_meta_chips';
  info: {
    description: 'A named chip displayed in detail page hero metadata.';
    displayName: 'Hero meta chip';
    icon: 'priceTag';
  };
  attributes: {
    label: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedMedia extends Struct.ComponentSchema {
  collectionName: 'components_shared_media';
  info: {
    displayName: 'Media';
    icon: 'file-video';
  };
  attributes: {
    captions: Schema.Attribute.Media<'files'>;
    captionsLabel: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'English'>;
    captionsLanguage: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'en'>;
    file: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    transcript: Schema.Attribute.Blocks;
  };
}

export interface SharedProgressItem extends Struct.ComponentSchema {
  collectionName: 'components_shared_progress_items';
  info: {
    description: 'A labelled percentage row for project deliverables.';
    displayName: 'Progress item';
    icon: 'chartBubble';
  };
  attributes: {
    label: Schema.Attribute.String & Schema.Attribute.Required;
    percentage: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 100;
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<100>;
  };
}

export interface SharedQuote extends Struct.ComponentSchema {
  collectionName: 'components_shared_quotes';
  info: {
    displayName: 'Quote';
    icon: 'indent';
  };
  attributes: {
    body: Schema.Attribute.Text;
    title: Schema.Attribute.String;
  };
}

export interface SharedRichText extends Struct.ComponentSchema {
  collectionName: 'components_shared_rich_texts';
  info: {
    description: '';
    displayName: 'Rich text';
    icon: 'align-justify';
  };
  attributes: {
    body: Schema.Attribute.RichText;
  };
}

export interface SharedSeo extends Struct.ComponentSchema {
  collectionName: 'components_shared_seos';
  info: {
    description: '';
    displayName: 'Seo';
    icon: 'allergies';
    name: 'Seo';
  };
  attributes: {
    metaDescription: Schema.Attribute.Text & Schema.Attribute.Required;
    metaTitle: Schema.Attribute.String & Schema.Attribute.Required;
    shareImage: Schema.Attribute.Media<'images'>;
  };
}

export interface SharedSlider extends Struct.ComponentSchema {
  collectionName: 'components_shared_sliders';
  info: {
    description: '';
    displayName: 'Slider';
    icon: 'address-book';
  };
  attributes: {
    files: Schema.Attribute.Media<'images', true>;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'shared.content-rich-text': SharedContentRichText;
      'shared.detail-stat': SharedDetailStat;
      'shared.external-gallery': SharedExternalGallery;
      'shared.external-image': SharedExternalImage;
      'shared.hero-meta-chip': SharedHeroMetaChip;
      'shared.media': SharedMedia;
      'shared.progress-item': SharedProgressItem;
      'shared.quote': SharedQuote;
      'shared.rich-text': SharedRichText;
      'shared.seo': SharedSeo;
      'shared.slider': SharedSlider;
    }
  }
}
