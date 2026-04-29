export interface Movie {
  id?: string;
  title: string;
  duration: number;
  genre: string;
  imageUrl: string;
  backdropUrl?: string;
  description?: string;
  trailerUrl?: string;
}

export const recentMovies: Movie[] = [
  { 
    title: 'Dune: Part Two', 
    duration: 166, 
    genre: 'Sci-Fi, Action, Adventure', 
    imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR1HYYqIoovqLVr7DQU9tevo_bMrzQqJ7LQiVnjyK1x5BUHqrjFB_JDtftcR1Sxo1cPE0fPmg&s=10', 
    backdropUrl: 'https://image.tmdb.org/t/p/original/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
    description: 'Paul Atreides unites with Chani and the Fremen while on a warpath of revenge against the conspirators who destroyed his family.',
    trailerUrl: 'https://www.youtube.com/embed/Way9Dexny3w'
  },
  { 
    title: 'Deadpool & Wolverine', 
    duration: 127, 
    genre: 'Action, Comedy, Sci-Fi', 
    imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTFs2b42I8mdYGULACpk8zRlBMHFP_ligKNHTuYvnswpNg4rDm87RY2K74SJ-kh6Wtj9mbZiw&s=10', 
    backdropUrl: 'https://image.tmdb.org/t/p/original/9l1eZiJHmhr5jIlthMdJN5WYoff.jpg',
    description: 'Wolverine is recovering from his injuries when he crosses paths with the loudmouth, Deadpool.',
    trailerUrl: 'https://www.youtube.com/embed/73_1biulkYk'
  },
  { 
    title: 'The Batman', 
    duration: 176, 
    genre: 'Action, Crime, Drama', 
    imageUrl: 'https://m.media-amazon.com/images/S/pv-target-images/3de84cca07fc963b66a01a5465c2638066119711e89c707ce952555783dd4b4f.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/b0PlSFdDwbyK0cf5RxwDpaOJQvQ.jpg',
    description: 'When a sadistic serial killer begins murdering key political figures in Gotham, Batman is forced to investigate.',
    trailerUrl: 'https://www.youtube.com/embed/mqqft2x_Aa4'
  },
  { 
    title: 'Oppenheimer', 
    duration: 180, 
    genre: 'Biography, Drama, History', 
    imageUrl: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg',
    description: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.',
    trailerUrl: 'https://www.youtube.com/embed/uYPbbksJxIg'
  },
  { 
    title: 'Barbie', 
    duration: 114, 
    genre: 'Comedy, Adventure, Fantasy', 
    imageUrl: 'https://upload.wikimedia.org/wikipedia/en/0/0b/Barbie_2023_poster.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/nHf61UzkfFno5X1ofIhugCPus2R.jpg',
    description: 'Barbie and Ken are having the time of their lives in the colorful and seemingly perfect world of Barbie Land.',
    trailerUrl: 'https://www.youtube.com/embed/pBk4NYhWNMM'
  },
  { 
    title: 'Spider-Man: Across the Spider-Verse', 
    duration: 140, 
    genre: 'Animation, Action, Adventure', 
    imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT0MiAFRF0oxZO8nwPESVBei050PmIs6_46y9pPRkfWS59pFJpi', 
    backdropUrl: 'https://image.tmdb.org/t/p/original/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg',
    description: 'Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence.',
    trailerUrl: 'https://www.youtube.com/embed/shW9i6k8cB0'
  },
  { 
    title: 'John Wick: Chapter 4', 
    duration: 169, 
    genre: 'Action, Crime, Thriller', 
    imageUrl: 'https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcS-ES3DHAOhlf9wJZwUEY1Xjm_W7DuMPaxl_8NiMKLOvwEuP5Al',
    backdropUrl: 'https://image.tmdb.org/t/p/original/h8gHn0OzBoaefsYseUByqsmEDMY.jpg',
    description: 'John Wick uncovers a path to defeating The High Table.',
    trailerUrl: 'https://www.youtube.com/embed/yjRHZEUamCc'
  },
  { 
    title: 'Gladiator II', 
    duration: 148, 
    genre: 'Action, Adventure, Drama', 
    imageUrl: 'https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcRYyFenK9oC_4PqB1HBYJhi8uDwgnH81h_836fNspVj-F1yb7oj',
    backdropUrl: 'https://image.tmdb.org/t/p/original/628Dep6AxEtDxjZoGP78TsOxYbK.jpg',
    description: 'Years after witnessing the death of the revered hero Maximus, Lucius is forced to enter the Colosseum after his home is conquered.',
    trailerUrl: 'https://www.youtube.com/embed/4rgYUipGJNo'
  },
  { 
    title: 'Avatar: The Way of Water', 
    duration: 192, 
    genre: 'Action, Adventure, Fantasy', 
    imageUrl: 'https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcSHAILTOQDx1YgNRjFS2cOQ079UnNqeZra5KCbnSV8N-aWWt34l',
    backdropUrl: 'https://image.tmdb.org/t/p/original/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg',
    description: 'Jake Sully lives with his newfound family formed on the extrasolar moon Pandora.',
    trailerUrl: 'https://www.youtube.com/embed/d9MyW72ELq0'
  }
];
