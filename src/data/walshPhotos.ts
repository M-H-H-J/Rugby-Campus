/** Hugh's Notre Dame College / Walsh rugby photos. Walsh profile and the About NDC story only. */
export interface WalshPhoto {
  src: string;
  alt: string;
  caption?: string;
  width: number;
  height: number;
}

export const WALSH_GALLERY: WalshPhoto[] = [
  {
    src: '/images/walsh/bonnies.webp',
    width: 1600, height: 1066,
    alt: 'A ball carrier in a blue and white jersey running between players in white jerseys that say Bonnies',
    caption: 'Walsh vs St. Bonaventure',
  },
  {
    src: '/images/walsh/scrum.webp',
    width: 1600, height: 1200,
    alt: 'Two packs set in a scrum on grass, one in blue and white and one in tan, with a player in blue number 9 standing beside them',
  },
  {
    src: '/images/walsh/sideline.webp',
    width: 1600, height: 1066,
    alt: 'Players in blue and white standing on the field in front of blue bleachers and a crowd',
  },
  {
    src: '/images/walsh/phase.webp',
    width: 1451, height: 967,
    alt: 'A ball carrier in green and white tackled by players in blue and white, with more of both teams around the breakdown',
  },
  {
    src: '/images/walsh/night-scrum.webp',
    width: 1280, height: 853,
    alt: 'A night scrum with a blue and white pack and a maroon and white pack, a referee in yellow standing beside them',
  },
];

/** One frame for the Notre Dame College story on About. Not the Bonnies caption. */
export const NDC_ABOUT_PHOTO: WalshPhoto = WALSH_GALLERY[1];
