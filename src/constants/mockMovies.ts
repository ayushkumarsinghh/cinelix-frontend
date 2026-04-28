export interface Movie {
  id?: string;
  title: string;
  duration: number;
  genre: string;
  imageUrl: string;
  description?: string;
  trailerUrl?: string;
}

export const recentMovies: Movie[] = [
  { title: 'Dune: Part Two', duration: 166, genre: 'Sci-Fi, Action, Adventure', imageUrl: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?q=80&w=2070', description: 'Paul Atreides unites with Chani and the Fremen while on a warpath of revenge against the conspirators who destroyed his family.' },
  { title: 'Deadpool & Wolverine', duration: 127, genre: 'Action, Comedy, Sci-Fi', imageUrl: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?q=80&w=1974', description: 'Wolverine is recovering from his injuries when he crosses paths with the loudmouth, Deadpool.' },
  { title: 'Joker: Folie à Deux', duration: 138, genre: 'Drama, Crime, Music', imageUrl: 'https://images.unsplash.com/photo-1531259683007-016a7b628fc3?q=80&w=1974', description: 'Failed comedian Arthur Fleck meets the love of his life, Harley Quinn, while incarcerated at Arkham State Hospital.' },
  { title: 'The Batman', duration: 176, genre: 'Action, Crime, Drama', imageUrl: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?q=80&w=2076', description: 'When a sadistic serial killer begins murdering key political figures in Gotham, Batman is forced to investigate.' },
  { title: 'Oppenheimer', duration: 180, genre: 'Biography, Drama, History', imageUrl: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=2070', description: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.' },
  { title: 'Barbie', duration: 114, genre: 'Comedy, Adventure, Fantasy', imageUrl: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?q=80&w=2070', description: 'Barbie and Ken are having the time of their lives in the colorful and seemingly perfect world of Barbie Land.' },
  { title: 'Spider-Man: Across the Spider-Verse', duration: 140, genre: 'Animation, Action, Adventure', imageUrl: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?q=80&w=2070', description: 'Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence.' },
  { title: 'Mission: Impossible - Dead Reckoning', duration: 163, genre: 'Action, Adventure, Thriller', imageUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2025', description: 'Ethan Hunt and his IMF team must track down a dangerous new weapon that threatens all of humanity.' },
  { title: 'John Wick: Chapter 4', duration: 169, genre: 'Action, Crime, Thriller', imageUrl: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=2070', description: 'John Wick uncovers a path to defeating The High Table.' },
  { title: 'Guardians of the Galaxy Vol. 3', duration: 150, genre: 'Action, Adventure, Comedy', imageUrl: 'https://images.unsplash.com/photo-1500628539100-21827d427c7a?q=80&w=2070', description: 'Still reeling from the loss of Gamora, Peter Quill rallies his team to defend the universe.' },
  { title: 'Avatar: The Way of Water', duration: 192, genre: 'Action, Adventure, Fantasy', imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=2094', description: 'Jake Sully lives with his newfound family formed on the extrasolar moon Pandora.' },
  { title: 'Top Gun: Maverick', duration: 130, genre: 'Action, Drama', imageUrl: 'https://images.unsplash.com/photo-1568870615271-898bd339d633?q=80&w=1935', description: 'After thirty years, Maverick is still pushing the envelope as a top naval aviator.' },
  { title: 'Everything Everywhere All at Once', duration: 139, genre: 'Action, Adventure, Comedy', imageUrl: 'https://images.unsplash.com/photo-1536640712247-c575adcfc615?q=80&w=2050', description: 'A middle-aged Chinese immigrant is swept up into an insane adventure.' },
  { title: 'Inside Out 2', duration: 100, genre: 'Animation, Adventure, Comedy', imageUrl: 'https://images.unsplash.com/photo-1620336655055-188602363867?q=80&w=1974', description: 'Joy, Sadness, Anger, Fear and Disgust are back for a new adventure inside Riley\'s head.' },
  { title: 'Kingdom of the Planet of the Apes', duration: 145, genre: 'Action, Adventure, Sci-Fi', imageUrl: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?q=80&w=2070', description: 'Many years after the reign of Caesar, a young ape goes on a journey that will lead him to question everything.' },
  { title: 'Furiosa: A Mad Max Saga', duration: 148, genre: 'Action, Adventure, Sci-Fi', imageUrl: 'https://images.unsplash.com/photo-1505686994434-e3cc5abf1330?q=80&w=2073', description: 'The origin story of renegade warrior Furiosa before her encounter with Mad Max.' },
  { title: 'The Fall Guy', duration: 126, genre: 'Action, Comedy, Drama', imageUrl: 'https://images.unsplash.com/photo-1444628838545-ac4016a5418a?q=80&w=2070', description: 'A down-and-out stuntman must find the missing star of his ex-girlfriend\'s blockbuster movie.' },
  { title: 'Challengers', duration: 131, genre: 'Drama, Romance, Sport', imageUrl: 'https://images.unsplash.com/photo-1546519156-d81a3ae9729c?q=80&w=2070', description: 'Tashi, a former tennis prodigy turned coach, transformed her husband into a world-famous grand slam champion.' },
  { title: 'Civil War', duration: 109, genre: 'Action, Thriller', imageUrl: 'https://images.unsplash.com/photo-1593359674240-a5a2a78480d3?q=80&w=1974', description: 'A journey across a dystopian future America, following a team of military-embedded journalists.' },
  { title: 'Godzilla x Kong: The New Empire', duration: 115, genre: 'Action, Adventure, Sci-Fi', imageUrl: 'https://images.unsplash.com/photo-1590177602111-2594833e1d76?q=80&w=1974', description: 'Two ancient titans, Godzilla and Kong, clash in an epic battle as humans unravel their intertwined origins.' }
];
