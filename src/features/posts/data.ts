export interface Post {
  id: string;
  slug: string;
  cosplayer: string;
  character: string;
  source: string;
  photoCount: number;
  videoCount: number;
  thumbnail: string;
}

export const posts: Post[] = [
  {
    id: '1',
    slug: 'mihara-3',
    cosplayer: 'Tiny Asa アサ',
    character: 'Mihara',
    source: 'NIKKE',
    photoCount: 112,
    videoCount: 9,
    thumbnail: '/images/cosplay-tele/mihara-3.jpg',
  },
  {
    id: '2',
    slug: 'hatsune-miku',
    cosplayer: 'ChuChu Magic',
    character: 'Hatsune Miku',
    source: 'Vocaloid',
    photoCount: 30,
    videoCount: 1,
    thumbnail: '/images/cosplay-tele/hatsune-miku.jpg',
  },
  {
    id: '3',
    slug: 'lynae',
    cosplayer: 'Umeko J',
    character: 'Lynae',
    source: 'Wuthering Waves',
    photoCount: 103,
    videoCount: 4,
    thumbnail: '/images/cosplay-tele/lynae.jpg',
  },
  {
    id: '4',
    slug: 'maid-42',
    cosplayer: 'Arty Huang',
    character: 'Maid',
    source: 'Original',
    photoCount: 71,
    videoCount: 0,
    thumbnail: '/images/cosplay-tele/maid-42.jpg',
  },
  {
    id: '5',
    slug: 'school-girl-31',
    cosplayer: 'DemiFairyTW',
    character: 'School Girl',
    source: 'Original',
    photoCount: 35,
    videoCount: 1,
    thumbnail: '/images/cosplay-tele/school-girl-31.jpg',
  },
  {
    id: '6',
    slug: 'phoebe',
    cosplayer: 'Mizu',
    character: 'Phoebe',
    source: 'Wuthering Waves',
    photoCount: 96,
    videoCount: 6,
    thumbnail: '/images/cosplay-tele/phoebe.jpg',
  },
];
