const assetUrl = (fileName) => new URL(`./${fileName}`, import.meta.url).href;

export const logo = assetUrl("logo.png");

export const heroImages = [
  assetUrl("hero_1.png"),
  assetUrl("hero_2.png"),
  assetUrl("hero_3.png"),
];

export const aboutVideo = assetUrl("about_section_video.mp4");