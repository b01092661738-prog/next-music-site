const albums = [
  { id:'home', title:'Home', year:'1992', detail:'1ST STUDIO ALBUM', colors:['#e8b736','#c6502d'], tracks:['인형의 기사 Part I','인형의 기사 Part II','도시인','Turn Off the T.V.','외로움의 거리','증조 할머니의 무덤가에서','아버지와 나 Part I','집으로 가는 길','아버지와 나 Part II','영원히'] },
  { id:'being', title:'The Return of N.EX.T Part 1: The Being', year:'1994', detail:'2ND STUDIO ALBUM', colors:['#d6d7cc','#667b84'], tracks:['The Return of N.EX.T (Instrumental)','The Destruction of the Shell: 껍질의 파괴','이중인격자','The Dreamer','날아라 병아리','나는 남들과 다르다','Life Manufacturing: 생명생산 (Instrumental)','The Ocean: 불멸에 관하여'] },
  { id:'world', title:'The Return of N.EX.T Part 2: World', year:'1995', detail:'3RD STUDIO ALBUM', colors:['#c7d45c','#3b6770'], tracks:['세계의 문 Part 1. 유년의 끝, Part 2. 우리가 만든 세상을 보라','Komerican Blues (Ver. 3.1)','Mama','나는 쓰레기야 Part 1','The Age of No God','나는 쓰레기야 Part 2 (Instrumental)','힘겨워하는 연인들을 위하여','Requiem for the Embryo (Instrumental)','Money','나른한 오후의 단상 (Instrumental)','아가에게','Hope','Questions','Love Story (Bonus Track, Instrumental)'] },
  { id:'lazenca', title:'Lazenca - A Space Rock Opera', year:'1997', detail:'4TH ALBUM · ANIMATION OST', colors:['#f05a4f','#3f315c'], tracks:['Mars, the Bringer of the War','Lazenca, Save Us','The Power','먼 훗날 언젠가 (Original Ver.)','해에게서 소년에게','A Poem of Stars: 별의 시','먼 훗날 언젠가 (Evening Star Ver.)','The Hero'] },
  { id:'gae', title:'The Return of N.EX.T Part 3: 개한민국', year:'2004', detail:'5TH STUDIO ALBUM', colors:['#e43f35','#8d2924'], tracks:['序曲: 현세지옥','아! 개한민국','감염 (Infested)','Saving Private Jesus (예수 일병 구하기)','80’s Series 01: Anarky in the Net','Dear American (Clean Ver.)','Generation Crush (Tired Mix)','서울역 (Seoul Station, Frat Mix)','아! 개한민국 (No Cut Ver.)','사탄의 新婦 (Satan’s Bride, Full Bet Mix)','Growing Up','80’s Series 02: Laura','I Am Ssang','아들아, 정치만은 하지마','Devin’s Boogie (Live)','사탄의 新婦 (Royal Albert Mix)','힘을 내!','남태평양 (South Pacific)','Dear American (No Cut Ver.)'] },
  { id:'regame', title:'ReGame? - The 2nd Fan Service', year:'2006', detail:'5.5TH ALBUM · REMAKE', colors:['#80b4ad','#365d61'], tracks:['아버지와 나 Part I','아버지와 나 Part II','Friends','그대에게','날아라 병아리 (Feat. 윤도현)','눈동자 (Feat. 채연)','The Dreamer','인형의 기사 Part II (Feat. 먼데이키즈)','인생은 끝나지 않았다','The Last Love Song','영원히','인형의 기사 (Crom Ver.)'] },
  { id:'666', title:'666 Trilogy Part I', year:'2008', detail:'6TH STUDIO ALBUM', colors:['#d0d0ca','#48484b'], tracks:['Eternal Winter Suite: Part I The Last Knights','The Empire of Hatred: 증오의 제국','개판 5분전 만취 공중 해적단: Part II Totally Screwed Up Drunken Aero-Pirates','Dance United','Cyber Budha Company Ltd.'] },
  { id:'single', title:'Singles & Other Tracks', year:'1997–2014', detail:'SINGLES · SPECIAL RELEASES', colors:['#d5ff40','#49735b'], tracks:['Here, I Stand For You','Here, I Stand For You (Silhouette Version)','Arirang (97 동계유니버시아드 폐막식 음악)','Here, I Stand For You (Instrumental)','Arirang (Instrumental)','I Want It All (Demo 0.7)'] }
];

const albumGrid = document.querySelector('#album-grid');
const filterBox = document.querySelector('#filters');
const search = document.querySelector('#search');
const count = document.querySelector('#track-count');
const allTracks = albums.reduce((sum, album) => sum + album.tracks.length, 0);
document.querySelector('#total-songs').textContent = allTracks;

const filters = [
  {id:'all',label:'전체'}, {id:'home',label:'HOME'}, {id:'being',label:'THE BEING'},
  {id:'world',label:'WORLD'}, {id:'lazenca',label:'LAZENCA'}, {id:'gae',label:'개한민국'},
  {id:'regame',label:'REGAME?'}, {id:'666',label:'666'}, {id:'single',label:'싱글'}
];
const appleAlbumSearch = {
  home:'Home N.EX.T', being:'The Return of N.EX.T Part 1 The Being',
  world:'The Return of N.EX.T Part 2 World', lazenca:'Lazenca A Space Rock Opera',
  gae:'The Return of N.EX.T Part 3 Gae Han Min Gook', regame:'ReGame N.EX.T',
  '666':'666 Trilogy Part I N.EX.T', single:'Here I Stand For You N.EX.T'
};
const appleAlbumPatterns = {
  home:/\bhome\b/i, being:/\bbeing\b/i, world:/\bworld\b/i,
  lazenca:/lazenca/i, gae:/gae.?han|republic.?of.?korea|part.?3/i,
  regame:/regame/i, '666':/666/i, single:/here.?i.?stand|arirang|single|ep/i
};
const appleTrackCache = new Map();
let activeFilter = 'all';
let currentQuery = '';
let playerRequest = 0;

function makeFilters(){
  filterBox.innerHTML = filters.map(({id,label}) => `<button class="filter-chip${id===activeFilter?' active':''}" data-filter="${id}">${label}</button>`).join('');
  filterBox.querySelectorAll('button').forEach(button => button.addEventListener('click', () => {
    activeFilter = button.dataset.filter;
    filterBox.querySelectorAll('button').forEach(item => item.classList.toggle('active', item === button));
    renderAlbums();
  }));
}

function renderAlbums(){
  let visibleTracks = 0;
  albumGrid.innerHTML = '';
  albums.forEach((album, albumIndex) => {
    if(activeFilter !== 'all' && activeFilter !== album.id) return;
    const matching = album.tracks.map((title,index) => ({title,index})).filter(track => `${track.title} ${album.title} ${album.year}`.toLocaleLowerCase('ko').includes(currentQuery));
    if(!matching.length) return;
    visibleTracks += matching.length;
    const card = document.createElement('article');
    card.className = 'album-card';
    card.innerHTML = `<div class="album-head"><div class="album-art" style="--cover-a:${album.colors[0]};--cover-b:${album.colors[1]}" aria-hidden="true">${String(albumIndex+1).padStart(2,'0')}</div><div class="album-info"><h3>${album.title}</h3><p>${album.year} · ${album.detail}</p></div><div class="album-total"><strong>${String(matching.length).padStart(2,'0')}</strong>TRACKS</div></div><ol class="track-list">${matching.map(({title,index}) => `<li class="track-row${title.startsWith('The Destruction of the Shell')?' is-spotlight':''}"><span class="track-no">${String(index+1).padStart(2,'0')}</span><span class="track-name">${title}</span><button class="row-listen" aria-label="${title} 사이트 안에서 듣기" data-song="${title}" data-album="${album.title}" data-album-id="${album.id}">▶</button></li>`).join('')}</ol>`;
    albumGrid.append(card);
  });
  count.textContent = `${visibleTracks} TRACKS`;
  if(!visibleTracks) albumGrid.innerHTML = '<div class="empty-state">검색 결과가 없습니다. 다른 곡명으로 검색해보세요.</div>';
  albumGrid.querySelectorAll('[data-song]').forEach(button => button.addEventListener('click', () => chooseSong(button.dataset.song, button.dataset.album, button.dataset.albumId)));
}

function normalizeTrackTitle(title){
  return title.toLocaleLowerCase('ko')
    .replace(/\b(?:part|pt\.?)\s*(i{1,3}|[1-3])\b/g, (_match, part) => `part${/^[1-3]$/.test(part) ? part : part.length}`)
    .replace(/\binstrumental\b|\binst\.?\b|bonus\s*track/gi, '')
    .replace(/[^a-z0-9가-힣]/g, '');
}

function titleMatches(wanted, actual){
  const wantedParts = wanted.split(/[:：]/).map(normalizeTrackTitle).filter(Boolean);
  const actualParts = actual.split(/[:：]/).map(normalizeTrackTitle).filter(Boolean);
  return wantedParts.some(a => actualParts.some(b => a === b || (Math.min(a.length,b.length) > 5 && (a.includes(b) || b.includes(a)))));
}

async function findAppleTrack(song, albumId){
  const cacheKey = `${albumId}:${song}`;
  if(appleTrackCache.has(cacheKey)) return appleTrackCache.get(cacheKey);
  const albumTerm = appleAlbumSearch[albumId] || '';
  const queryTitles = [song,
    song.replace(/\bpart\s+(i{1,3})\b/gi, (_match, roman) => `Part ${roman.length}`),
    song.replace(/\bpt\.?\s+(i{1,3})\b/gi, (_match, roman) => `Pt. ${roman.length}`)
  ];
  const queries = [...new Set(queryTitles.flatMap(title => [`${title} ${albumTerm}`, title]))];
  const results = new Map();
  for(const query of queries){
    const url = `https://itunes.apple.com/search?entity=song&limit=50&country=us&term=${encodeURIComponent(query)}`;
    const response = await fetch(url);
    if(!response.ok) continue;
    const data = await response.json();
    for(const track of data.results || []) if(track.trackId) results.set(track.trackId, track);
    const hit = [...results.values()].find(track =>
      /n\.(?:ex|e\.x)\.t/i.test(track.artistName || '') &&
      appleAlbumPatterns[albumId]?.test(track.collectionName || '') &&
      titleMatches(song, track.trackName || '') && track.trackViewUrl
    );
    if(hit){ appleTrackCache.set(cacheKey, hit); return hit; }
  }
  const hit = [...results.values()].find(track =>
    /n\.(?:ex|e\.x)\.t/i.test(track.artistName || '') &&
    titleMatches(song, track.trackName || '') && track.trackViewUrl
  );
  appleTrackCache.set(cacheKey, hit || null);
  return hit || null;
}

async function chooseSong(song, albumTitle, albumId){
  const requestId = ++playerRequest;
  const player = document.querySelector('#apple-player');
  const shell = document.querySelector('#now-playing');
  const status = document.querySelector('#player-status');
  document.querySelector('#now-title').textContent = song;
  shell.classList.add('has-track','is-loading');
  player.hidden = true;
  player.removeAttribute('src');
  status.textContent = 'APPLE MUSIC · 음원 정보를 찾는 중…';
  try{
    const track = await findAppleTrack(song, albumId);
    if(requestId !== playerRequest) return;
    if(!track){
      shell.classList.remove('is-loading');
      status.textContent = '이 곡의 Apple Music 임베드를 찾지 못했습니다.';
      return;
    }
    const embed = new URL(track.trackViewUrl);
    embed.hostname = 'embed.music.apple.com';
    embed.searchParams.delete('uo');
    player.title = `${track.artistName} — ${track.trackName} Apple Music 플레이어`;
    player.src = embed.toString();
    player.hidden = false;
    status.textContent = `${track.artistName} · Apple Music 플레이어`;
    shell.classList.remove('is-loading');
  }catch(error){
    if(requestId !== playerRequest) return;
    shell.classList.remove('is-loading');
    status.textContent = '플레이어를 불러오지 못했습니다. 잠시 후 다시 선택해 주세요.';
    console.error('Apple Music embed lookup failed:', error);
  }
}

search.addEventListener('input', event => {
  currentQuery = event.target.value.trim().toLocaleLowerCase('ko');
  renderAlbums();
});
document.querySelector('.spotlight-listen').addEventListener('click', event => {
  const button = event.currentTarget;
  chooseSong(button.dataset.song, button.dataset.album, button.dataset.albumId);
});
document.addEventListener('keydown', event => {
  if(event.key === '/' && !['INPUT','TEXTAREA'].includes(document.activeElement.tagName)) { event.preventDefault(); search.focus(); }
  if(event.key === 'Escape') search.blur();
});

makeFilters();
renderAlbums();
