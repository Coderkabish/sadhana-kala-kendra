const assetUrl = (fileName) => new URL(`./${fileName}`, import.meta.url).href;

export const logo = assetUrl("logo.png");

export const heroImages = [
  assetUrl("hero_5.jpeg"),
  assetUrl("hero_1.png"),
  assetUrl("hero_2.png"),
  assetUrl("hero_3.png"),
  assetUrl("hero_4.png"),
];

export const gallaryImages = [
  assetUrl("gallary_1.png"),
  assetUrl("gallary_2.png"),
  assetUrl("gallary_3.png"),
  assetUrl("gallary_4.png"),
  assetUrl("gallary_5.png"),
];

export const aboutVideo = assetUrl("about_section_video.mp4");